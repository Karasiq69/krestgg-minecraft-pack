# KrestGG Minecraft

Клиентский модпак для сервера сообщества Кресты. Сервер — **Paper 1.21.8** (выживание Towny + экономика + скиллы крутятся плагинами на сервере, ставить ничего не нужно). Клиент — лёгкий Fabric-набор: голос, эмоции, перформанс.

- **Версия:** Minecraft `1.21.8`, Fabric Loader `0.19.2`
- **Адрес сервера:** `185.207.214.12:37465`

## Что внутри (клиент)

- **Голосовой чат** — Simple Voice Chat: proximity-голос, кнопка по умолчанию `V` (настраивается). Должен совпадать с серверным плагином — уже совпадает.
- **Эмоции** — Emotecraft (+ Player Animation Library): анимированные эмоции.
- **Производительность и графика** — Sodium + Iris (шейдеры).
- **Миникарта** — Xaero's Minimap: миникарта в углу, вейпоинты, мини-карта мира.
- Библиотеки: Fabric API, Cloth Config.

> Towny (города/клеймы), магазины (QuickShop), скиллы (AuraSkills), бухло (BreweryX) и т.д. — это **серверные плагины**, отдельно их ставить не надо, работают для всех.

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
# Пак КЛИЕНТСКИЙ (сервер = Paper, плагины отдельно). Держим только client/both моды:
#   client — только клиенту (sodium, iris, distant-horizons)
#   both   — обоим, но на клиент тоже ставится (fabric-api, simple-voice-chat, emotecraft)
# Серверные моды (side=server) сюда НЕ добавляем — на Paper они не нужны.
packwiz refresh
git add . && git commit -m "add <slug>" && git push
```

После push:
- GH Pages обновится автоматически (`pack.toml` свежий).
- GH Action соберёт `KrestMC.zip`, `KrestMC.mrpack`, `KrestMC-mods.zip` и опубликует в [Release](https://github.com/karasiq69/krestgg-minecraft-pack/releases).
- Prism / PolyMC игроки получат обновление при следующем `Launch`.

> Сервер (Paper) этот пак **не** использует — серверные плагины живут отдельно в `~/PycharmProjects/krestmc-server` / `/srv/krestmc`.
