# KrestGG Minecraft

Сервер сообщества Кресты — **Minecraft 26.1.2**, почти ванильное выживание: никаких городов,
экономики и скиллов, только удобства.

- **Адрес сервера:** `playmc.krest.gg`
- **Версия:** Minecraft `26.1.2`, нужна **Java 25**

## Моды не обязательны

Сервер работает на Paper: **зайти можно чистой ванилью** — выбрал версию `26.1.2` в любом
лаунчере и играешь. Все серверные удобства работают без единого мода:

- **Рубка дерева целиком** — сломай нижний блок ствола топором, дерево упадёт всё.
- **Сортировка сундуков и инвентаря** — shift-клик по пустому слоту. Один раз введи
  `/chestsort` и включи сортировку в открывшемся окне (там же можно сменить кнопку) —
  настройка запомнится навсегда.
- Анти-X-ray и защита координат — встроены в сервер.

Единственное, что требует мод — **голосовой чат**: без него тебя не слышно и ты не слышишь.
Он входит в модпак ниже (или поставь [Simple Voice Chat](https://modrinth.com/plugin/simple-voice-chat)
отдельно).

## Модпак (рекомендуется)

Клиентский пак с удобствами:

- **Голосовой чат** — Simple Voice Chat: голос по расстоянию, кнопка по умолчанию `V`.
- **Карта** — Xaero's Minimap (миникарта, вейпоинты) + Xaero's World Map (большая карта).
- **Производительность и шейдеры** — Sodium + Iris, **BSL уже в комплекте**: в игре
  `Options` → `Video Settings` → `Shader Packs` → выбрать BSL → `Apply`.
- Библиотеки: Fabric API, Cloth Config.

> ⚠️ **Не обновляйте Sodium вручную.** Iris работает только с той версией Sodium, которую
> сам требует. Версии в паке подобраны парой — просто не трогайте их.

Distant Horizons в пак не входит (тяжёлый и капризный) — кому хочется дальней прорисовки,
[ставит сам](https://modrinth.com/mod/distanthorizons), сервер для него ничего не требует.

## Как зайти

### Совсем без модов (любой лаунчер)

Выбрать версию `26.1.2`, запустить, `Multiplayer` → `playmc.krest.gg`. Всё.

### Prism Launcher / PolyMC / MultiMC (рекомендуется для пака)

Работает с offline-аккаунтами (пиратки). Моды обновляются автоматически при каждом запуске.

1. Скачать [Prism Launcher](https://prismlauncher.org/download/) (или PolyMC / MultiMC).
2. `Add Account` → `Offline` → ник.
3. Скачать **`KrestMC.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
4. `Add Instance` → `Import` → выбрать `KrestMC.zip`.
5. `Launch` — моды скачаются сами и будут обновляться при выходе новых версий.

### Modrinth App / ATLauncher / GDLauncher

1. Скачать **`KrestMC.mrpack`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
2. В лаунчере: `Add Instance` / `Import` → выбрать файл.
3. Лаунчер сам поставит Minecraft, Fabric и моды.

### TLauncher / Legacy Launcher / любой простой лаунчер

Без модов: просто выбери версию `26.1.2` и играй. С паком:

1. В лаунчере выбрать версию `26.1.2` + установить `Fabric`. Запустить один раз и закрыть.
2. Скачать **`KrestMC-mods.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
3. Распаковать **содержимое** zip в папку с модами:
   - **Windows:** `%APPDATA%\.minecraft\mods\`
   - **macOS:** `~/Library/Application Support/minecraft/mods/`
   - **Linux:** `~/.minecraft/mods/`
4. Запустить лаунчер, подключиться к серверу.

**Когда выйдет обновление пака:** удалить всё из папки `mods/`, распаковать свежий `KrestMC-mods.zip`.

## Подключение и регистрация

`Multiplayer` → `Add Server` → `playmc.krest.gg`.

Первый вход:
```
/register твой_пароль твой_пароль
```
В следующие разы: `/login твой_пароль`.

До логина вы попадаете в тёмный «предбанник» — это нормально, мир откроется сразу после команды.
Ник чувствителен к регистру: `Vasya` и `vasya` — разные аккаунты.

Зайти можно только с ником из вайтлиста — заявка через Discord-бота.

---

## Для контрибьюторов: как добавить мод

Установить [packwiz](https://github.com/packwiz/packwiz):
```bash
go install github.com/packwiz/packwiz@latest
```

Добавить мод (строго по version id, `mr add <slug>` может утянуть alpha):
```bash
packwiz mr add --project-id <pid> --version-id <vid> -y && packwiz refresh
```

Пак **клиентский**. Держим только клиентские моды; серверная часть — плагины Paper в
compose сервера, сюда не добавляются.

После push:
- GH Pages обновится автоматически (`pack.toml` свежий).
- GH Action соберёт `KrestMC.zip`, `KrestMC.mrpack`, `KrestMC-mods.zip` и опубликует в [Release](https://github.com/karasiq69/krestgg-minecraft-pack/releases).
- Prism / PolyMC игроки получат обновление при следующем `Launch`.
