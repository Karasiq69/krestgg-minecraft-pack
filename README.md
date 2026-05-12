# KrestMC — Minecraft на krestgg

Самообновляющийся клиентский модпак для сервера сообщества Krest.

## Установка (один раз)

1. **Скачать Prism Launcher**: https://prismlauncher.org/download/ (portable работает без установки).
2. **Скачать `KrestMC.zip`** из последнего релиза: https://github.com/Karasiq69/krestgg-minecraft-pack/releases/latest
3. В Prism Launcher: `Add Instance` → `Import` → `Local file` → выбрать `KrestMC.zip`.
4. Открыть созданный инстанс → `Edit` → `Settings` → вкладка `Accounts` → `Add Offline` → ввести свой ник.
5. Нажать `Launch`. При первом запуске Prism скачает Fabric, Java и клиентские моды через packwiz.

## Подключение к серверу

- **Адрес сервера:** уточни у админа (он один для всех).
- В игре: `Multiplayer` → `Add Server` → вписать адрес.

## Первый вход

- При первом входе на сервер: `/register <ваш-пароль> <ваш-пароль>` (запомни!).
- При следующих входах: `/login <ваш-пароль>`.

## Обновления модов

Когда модпак обновится — при следующем запуске игры моды докачаются сами. Ничего вручную делать не нужно.

## Что в паке

Клиентские моды:
- **Fabric API** — базовая библиотека Fabric.
- **Fabric Language Kotlin** — runtime для Kotlin-модов.
- **Plasmo Voice** — голосовой чат в игре.
- **Sodium** — оптимизация рендера, больше FPS.
- **Iris Shaders** — поддержка шейдеров (опционально).

## Проблемы

- **Prism не находит Java 21**: `Settings` → `Java` → `Auto-detect` или укажи путь вручную.
- **Не подключается к серверу**: проверь что используешь именно этот pack (Minecraft 1.21.8 + Fabric 0.19.2).
- **Голосовой чат не работает**: убедись что в системе разрешён микрофон для Java.

## Для разработчиков

Pack собран через [packwiz](https://github.com/packwiz/packwiz). Обновление модов:
```bash
packwiz update --all
packwiz refresh
git add -A && git commit -m "chore: update mods" && git push
```

Сборка нового `KrestMC.zip`:
```bash
./build-instance.sh
```

`KrestMC.zip` приклеивается к GitHub Release; Pages раздаёт `pack.toml` по URL
`https://karasiq69.github.io/krestgg-minecraft-pack/pack.toml`, который и зашит в pre-launch hook инстанса.
