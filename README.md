# KrestGG Minecraft

Клиентский модпак для сервера сообщества Кресты. Сервер — **Fabric, Minecraft 26.2**, почти
ванильное выживание: никаких городов, экономики и скиллов, только удобства.

- **Версия:** Minecraft `26.2`, Fabric Loader `0.19.3`, нужна **Java 25**
- **Адрес сервера:** `playmc.krest.gg`

## Что внутри (клиент)

- **Голосовой чат** — Simple Voice Chat: голос по расстоянию, кнопка по умолчанию `V`.
- **Карта** — Xaero's Minimap (миникарта, вейпоинты) + Xaero's World Map (большая карта).
- **Сортировка** — Inventory Sorting: клик по кнопке сортирует сундук или инвентарь.
- **Дальняя прорисовка** — Distant Horizons: видно горизонт далеко за чанк-дистанцией.
- **Производительность и графика** — Sodium + Iris (шейдеры).
- Библиотеки: Fabric API, Cloth Config.

Рубка дерева целиком (FallingTree) работает **на сервере** — ставить ничего не надо, достаточно
сломать нижний блок ствола.

> Sodium под 26.2 пока в alpha. Если ловите графические артефакты — уберите Sodium и Iris из
> `mods/`, остальное работает без них.

## Как зайти

Выбери способ под свой лаунчер — мир один, моды одинаковые.

### Prism Launcher / PolyMC / MultiMC (рекомендуется)

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

1. [Скачать TLauncher](https://llaun.ch/ru) (или Legacy Launcher).
2. В лаунчере выбрать версию `26.2` + установить `Fabric 0.19.3`. Запустить один раз и закрыть.
3. Скачать **`KrestMC-mods.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
4. Распаковать **содержимое** zip в папку с модами:
   - **Windows:** `%APPDATA%\.minecraft\mods\`
   - **macOS:** `~/Library/Application Support/minecraft/mods/`
   - **Linux:** `~/.minecraft/mods/`
5. Запустить лаунчер, подключиться к серверу.

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

Добавить мод:
```bash
packwiz mr add <slug> -y && packwiz refresh
```

Пак **клиентский**. Держим только `client`/`both` моды; серверные моды живут в
`MODRINTH_PROJECTS` серверного compose и сюда не добавляются.

После push:
- GH Pages обновится автоматически (`pack.toml` свежий).
- GH Action соберёт `KrestMC.zip`, `KrestMC.mrpack`, `KrestMC-mods.zip` и опубликует в [Release](https://github.com/karasiq69/krestgg-minecraft-pack/releases).
- Prism / PolyMC игроки получат обновление при следующем `Launch`.
