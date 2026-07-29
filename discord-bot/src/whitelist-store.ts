import { createHash } from 'node:crypto';
import { chmod, chown, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { config } from './config.js';
import { sendCommand } from './rcon.js';

/**
 * Сервер оффлайновый (за Velocity + LimboAuth), игроки приходят с offline v3-UUID.
 * RCON `whitelist add <ник>` для этого не годится: ванильная команда резолвит ник
 * через Mojang и пишет premium v4-UUID, несмотря на ONLINE_MODE=false. Игрок с v3
 * потом получает "You are not white-listed" (MC-063, до этого MC-031 на Paper).
 *
 * Поэтому запись в вайтлист идёт файлом, с самостоятельно посчитанным offline-UUID,
 * а серверу остаётся только `whitelist reload`. Mojang из цепочки убран полностью.
 */

/** Ошибка доступа к whitelist.json — отличаем от падения RCON, сообщения разные. */
export class WhitelistFileError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'WhitelistFileError';
  }
}

type Entry = { uuid: string; name: string };

/**
 * Offline-UUID = UUIDv3 от "OfflinePlayer:<ник>" на MD5.
 * Регистр ника значим: BillieJoe и Billiejoe дают разные UUID.
 * Алгоритм сверен с фактическими UUID karasiq и Ramecko на этом сервере.
 */
export function offlineUuid(name: string): string {
  const h = createHash('md5').update(`OfflinePlayer:${name}`, 'utf8').digest();
  h[6] = (h[6] & 0x0f) | 0x30; // версия 3
  h[8] = (h[8] & 0x3f) | 0x80; // вариант RFC 4122
  const hex = h.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/** Версия UUID — 13-й hex-символ. 3 = offline, 4 = premium (мусор для нас). */
function uuidVersion(uuid: string): string {
  return uuid.replace(/-/g, '')[12] ?? '?';
}

async function readEntries(path: string): Promise<Entry[]> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return [];
    throw new WhitelistFileError(
      `не читается ${path} (${code ?? 'ошибка'}) — проверь, что каталог данных смонтирован в контейнер бота`,
      err,
    );
  }
  if (!raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new WhitelistFileError(`${path} — битый JSON, руками не правился?`, err);
  }
  if (!Array.isArray(parsed)) {
    throw new WhitelistFileError(`${path} — ожидался массив записей`);
  }
  return parsed.filter(
    (e): e is Entry =>
      !!e && typeof e === 'object' && typeof (e as Entry).name === 'string',
  );
}

/**
 * Пишем через временный файл + rename, чтобы сервер не прочитал обрезанный JSON.
 * Владелец и права переносятся с исходного файла: бот работает под root, а сервер
 * под uid 1000 — если оставить файл root-owned, консольный `whitelist add` на
 * сервере перестанет писать.
 */
async function writeEntries(path: string, entries: Entry[]): Promise<void> {
  const tmp = join(dirname(path), `.whitelist.json.bot-${process.pid}.tmp`);
  try {
    await writeFile(tmp, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
    try {
      const st = await stat(path);
      await chown(tmp, st.uid, st.gid);
      await chmod(tmp, st.mode & 0o777);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        console.warn('[whitelist] не удалось перенести владельца/права:', code ?? err);
      }
    }
    await rename(tmp, path);
  } catch (err) {
    throw new WhitelistFileError(`не записывается ${path}`, err);
  }
}

/** Предупредить в лог, если в файле остались premium-UUID от прежних `whitelist add`. */
function warnOnPremiumEntries(entries: Entry[], skipNameLower: string): void {
  for (const e of entries) {
    if (e.name.toLowerCase() === skipNameLower) continue;
    if (typeof e.uuid === 'string' && uuidVersion(e.uuid) === '4') {
      console.warn(
        `[whitelist] у ${e.name} premium-UUID ${e.uuid} (v4) — этот игрок не зайдёт, ожидается ${offlineUuid(e.name)}`,
      );
    }
  }
}

/**
 * Файл — источник истины, `whitelist reload` лишь подхватывает его на живом сервере.
 * Поэтому сбой перезагрузки не отменяет успешную запись: логируем и сообщаем отдельно,
 * запись применится при следующем reload или рестарте.
 */
async function reloadWhitelist(): Promise<boolean> {
  try {
    await sendCommand('whitelist reload');
    return true;
  } catch (err) {
    console.warn(
      '[whitelist] файл записан, но `whitelist reload` не прошёл:',
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

export type AddOutcome = 'added' | 'repaired' | 'exists';
export type AddResult = { outcome: AddOutcome; reloaded: boolean };

/**
 * Добавить ник в вайтлист с корректным offline-UUID.
 * Существующая запись с тем же ником в любом регистре заменяется — так повторное
 * одобрение с другим написанием чинит запись, а не плодит дубль.
 */
export async function addToWhitelist(name: string): Promise<AddResult> {
  const path = config.whitelistFile;
  const uuid = offlineUuid(name);
  const entries = await readEntries(path);
  const lower = name.toLowerCase();

  const existing = entries.filter((e) => e.name.toLowerCase() === lower);
  const alreadyCorrect =
    existing.length === 1 && existing[0].name === name && existing[0].uuid === uuid;

  warnOnPremiumEntries(entries, lower);

  if (alreadyCorrect) {
    return { outcome: 'exists', reloaded: await reloadWhitelist() };
  }

  const kept = entries.filter((e) => e.name.toLowerCase() !== lower);
  kept.push({ uuid, name });
  await writeEntries(path, kept);
  return {
    outcome: existing.length > 0 ? 'repaired' : 'added',
    reloaded: await reloadWhitelist(),
  };
}

export type RemoveResult = { outcome: 'removed' | 'missing'; reloaded: boolean };

/** Убрать ник из вайтлиста (регистронезависимо). */
export async function removeFromWhitelist(name: string): Promise<RemoveResult> {
  const path = config.whitelistFile;
  const entries = await readEntries(path);
  const lower = name.toLowerCase();
  const kept = entries.filter((e) => e.name.toLowerCase() !== lower);
  if (kept.length === entries.length) return { outcome: 'missing', reloaded: true };
  await writeEntries(path, kept);
  return { outcome: 'removed', reloaded: await reloadWhitelist() };
}
