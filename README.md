# KrestGG Minecraft

Клиентский модпак для сервера сообщества Кресты.

- **Версия:** Minecraft `1.21.8`, Fabric Loader `0.19.2`
- **Адрес сервера:** `185.207.214.12:37465`

## Что внутри

- **Партии и клеймы** — Open Parties and Claims: создавай отряд, забирай чанки под защиту, настраивай PvP/доступ союзникам.
- **Дороги** — The Roads More Travelled: травленные тропы появляются там, где часто ходят пацаны.
- **Бухло** — Patbox's Brewery: вари самогон, настойки и прочее, разливай в бочки.
- Голосовой чат (Plasmo Voice), бэкапы (Fastback), история действий (Ledger), сортировка инвентаря, шейдеры (Iris+Sodium), оптика дальних чанков (Distant Horizons, опционально).

> **Map Atlases не входит** — нет сборки под 1.21.8 на момент релиза. Добавим, когда мэйнтейнер обновит мод.

## Как зайти

Выбери способ под свой лаунчер — мир один, моды одинаковые.

### Prism Launcher / PolyMC / MultiMC (рекомендуется)

Работает с offline-аккаунтами (пиратки). Моды обновляются автоматически при каждом запуске.

1. Скачать [Prism Launcher](https://prismlauncher.org/download/) (или PolyMC / MultiMC — workflow идентичен).
2. `Add Account` → `Offline` → ник.
3. Скачать **`KrestMC.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
4. `Add Instance` → `Import` → выбрать `KrestMC.zip`.
5. `Launch` — моды скачаются автоматически и будут сами обновляться при выходе новых версий.

### Modrinth App / ATLauncher / GDLauncher

1. Скачать **`KrestMC.mrpack`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
2. В лаунчере: `Add Instance` / `Import` → выбрать файл.
3. Лаунчер сам поставит Minecraft, Fabric и моды.

### TLauncher / Legacy Launcher / любой простой лаунчер

1. [Скачать TLauncher](https://llaun.ch/ru) (или Legacy Launcher).
2. В лаунчере выбрать версию `1.21.8` + установить `Fabric 0.19.2`. Запустить один раз и закрыть (создаст профиль).
3. Скачать **`KrestMC-mods.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
4. Распаковать **содержимое** zip в папку с модами:
   - **Windows:** `%APPDATA%\.minecraft\mods\`
   - **macOS:** `~/Library/Application Support/minecraft/mods/`
   - **Linux:** `~/.minecraft/mods/`
5. Запустить лаунчер, подключиться к серверу.

**Когда выйдет обновление пака:** удалить всё из папки `mods/`, распаковать свежий `KrestMC-mods.zip`.

## Подключение и регистрация

`Multiplayer` → `Add Server` → `185.207.214.12:37465`.

Первый вход:
```
/register твой_пароль твой_пароль
```
В следующие разы: `/login твой_пароль`.

---

## Для контрибьюторов: как добавить мод

Установить [packwiz](https://github.com/packwiz/packwiz):
```bash
go install github.com/packwiz/packwiz@latest
```

Добавить мод:
```bash
cd krestgg-minecraft-pack
packwiz mr add <slug> -y
# При необходимости поправить side в mods/<slug>.pw.toml:
#   client — только клиенту (sodium, iris, distant-horizons)
#   server — только серверу (lithium, luckperms, fastback и т.д.)
#   both   — обоим (fabric-api, plasmo-voice, kotlin)
packwiz refresh
git add . && git commit -m "add <slug>" && git push
```

После push:
- GH Pages обновится автоматически (`pack.toml` свежий).
- GH Action соберёт `KrestMC.zip`, `KrestMC.mrpack`, `KrestMC-mods.zip` и опубликует в [Release](https://github.com/karasiq69/krestgg-minecraft-pack/releases).
- Prism / PolyMC игроки получат обновление при следующем `Launch`.
- Сервер подтянет новые серверные моды при ручном `docker compose restart` на хосте.
