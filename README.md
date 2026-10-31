# KrestGG Minecraft

Сервер сообщества Кресты — **Minecraft 26.2 на Fabric**, почти ванильное выживание: никаких городов,
экономики и скиллов. Только удобства, атмосфера (звуки, туман, частицы).

- **Адрес сервера:** `playmc.krest.gg`
- **Версия:** Minecraft `26.2` + Fabric Loader `0.19.5`, нужна **Java 25**
- **Вход:** только по нику из вайтлиста, заявка через Discord-бота

## Что в паке

- **Голосовой чат** — Simple Voice Chat: голос по расстоянию, кнопка по умолчанию `V`.
- **Карта** — Xaero's Minimap (миникарта, вейпоинты) + Xaero's World Map (большая карта, `M`).
- **Удобства** — Inventory Sorting (сортировка сундуков и инвентаря), Jade (что за блок перед тобой),
  AppleSkin (сытость на шкале еды), Mouse Tweaks (перекладывание предметов мышью).
- **Атмосфера** — AmbientSounds (звуки пещер, леса, воды), Sound Physics Remastered (эхо и
  глушение звука стенами), Presence Footsteps (шаги), Fog (туман), Particle Rain (дождь и снег
  частицами), Particular Reforged (листья, светлячки, брызги), LambDynamicLights (факел в руке
  светит), 3D Skin Layers, Not Enough Animations.
- **Производительность** — Sodium, ImmediatelyFast, Entity Culling, More Culling, Dynamic FPS.
- Мод-меню и библиотеки: Mod Menu, Fabric API, Cloth Config, YACL и прочие зависимости.

### Опциональные моды

Prism при первом запуске спросит, какие из них ставить. Оба **выключены по умолчанию**:

- **Iris (шейдеры)** — BSL уже в комплекте: `Options` → `Video Settings` → `Shader Packs` → BSL.
  На 26.2 у Iris есть баг: у предметов в инвентаре иногда пропадают иконки. Включайте, если готовы
  с этим жить (`F3+T` помогает).
- **Distant Horizons** — дальняя прорисовка. Красиво, но тяжело для слабых машин и ноутбуков.

> ⚠️ **Не обновляйте Sodium и Iris вручную.** Iris работает только с той версией Sodium,
> которая лежит в паке. Пак обновится сам.

## Как установить

### Prism Launcher (рекомендуется)

Работает с offline-аккаунтами (пиратки). **Пак обновляется сам при каждом запуске** — ничего
перекачивать не нужно.

1. Скачать [Prism Launcher](https://prismlauncher.org/download/) (подойдут и PolyMC / MultiMC).
2. `Add Account` → `Offline` → ник (тот же, что в вайтлисте, с тем же регистром букв).
3. Скачать **`KrestMC.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
4. `Add Instance` → `Import` → выбрать `KrestMC.zip`.
5. `Launch`. Перед игрой откроется окно обновления: выбрать опциональные моды, дождаться загрузки.
   Дальше при каждом запуске пак сам подтянет новые версии модов.

### Modrinth App / ATLauncher / GDLauncher

1. Скачать **`KrestMC.mrpack`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
2. В лаунчере: `Add Instance` / `Import` → выбрать файл.
3. Лаунчер сам поставит Minecraft, Fabric и моды. Обновления — скачать новый `.mrpack`.

### TLauncher / Legacy Launcher / любой простой лаунчер

1. В лаунчере выбрать версию `26.2` + установить `Fabric` `0.19.5`. Запустить один раз и закрыть.
2. Скачать **`KrestMC-mods.zip`** из [последнего релиза](https://github.com/karasiq69/krestgg-minecraft-pack/releases/latest).
3. Распаковать **содержимое** zip в папку с модами:
   - **Windows:** `%APPDATA%\.minecraft\mods\`
   - **macOS:** `~/Library/Application Support/minecraft/mods/`
   - **Linux:** `~/.minecraft/mods/`
4. Запустить лаунчер, подключиться к серверу.

В этом архиве нет опциональных модов (Iris, Distant Horizons) — их можно поставить с Modrinth
тех же версий, что в паке. **Когда выйдет обновление пака:** удалить всё из `mods/` и распаковать
свежий `KrestMC-mods.zip`.

## Подключение и регистрация

`Multiplayer` → `Add Server` → `playmc.krest.gg`.

Первый вход:
```
/register твой_пароль твой_пароль
```
В следующие разы: `/login твой_пароль`.

До логина вы попадаете в тёмный «предбанник» — это нормально, мир откроется сразу после команды.
Ник чувствителен к регистру: `Vasya` и `vasya` — разные аккаунты.

---

## Для контрибьюторов: как добавить мод

Установить [packwiz](https://github.com/packwiz/packwiz):
```bash
go install github.com/packwiz/packwiz@latest
```

Добавить мод (строго по version id, `mr add <slug>` может утянуть alpha):
```bash
packwiz mr add --project-id <pid> --version-id <vid> && packwiz refresh
```

Пак **клиентский**: сюда только моды, которые нужны игроку. Серверные моды (логгер, античит,
worldgen, прокси) ставятся на сервер отдельно. Версии берутся из лок-файла с version id и sha512.

После push в `master`:
- GH Pages обновится автоматически (`pack.toml` свежий).
- GH Action соберёт `KrestMC.zip`, `KrestMC.mrpack`, `KrestMC-mods.zip` и опубликует в [Release](https://github.com/karasiq69/krestgg-minecraft-pack/releases).
- Игроки в Prism получат обновление при следующем `Launch`.
