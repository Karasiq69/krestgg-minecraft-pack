# KrestGG Minecraft

Клиентский модпак для сервера сообщества Кресты.

- **Версия:** Minecraft `1.21.8`, Fabric Loader `0.19.2`
- **Адрес сервера:** `185.207.214.12:37465`

## Как зайти

Выбери способ под свой лаунчер — мир один, моды одинаковые.

### Prism Launcher

1. [Скачать Prism Launcher](https://prismlauncher.org/download/).
2. Скачать **`KrestMC.zip`** из [последнего релиза](https://github.com/Karasiq69/krestgg-minecraft-pack/releases/latest).
3. В Prism: `Add Instance` → `Import` → выбрать `KrestMC.zip`.
4. Открыть инстанс → `Settings` → `Accounts` → `Add Offline` → ник.
5. `Launch`. Моды скачаются автоматически и будут сами обновляться при выходе новых версий.

### Modrinth App / ATLauncher / GDLauncher

1. Скачать [**`KrestMC.mrpack`**](https://karasiq69.github.io/krestgg-minecraft-pack/KrestMC.mrpack).
2. В лаунчере: `Add Instance` / `Import` → выбрать файл.
3. Лаунчер сам поставит Minecraft, Fabric и моды.

### Legacy Launcher (пиратка)

1. [Скачать Legacy Launcher](https://llaun.ch/ru).
2. В лаунчере выбрать версию `1.21.8` + установить `Fabric 0.19.2`.
3. Запустить один раз, потом закрыть.
4. В папке профиля (`%APPDATA%\.minecraft\mods\` на Windows, `~/Library/Application Support/minecraft/mods/` на macOS) положить пять `.jar` из таблицы ниже.
5. Запустить, подключиться к серверу.

## Подключение и регистрация

`Multiplayer` → `Add Server` → `185.207.214.12:37465`.

Первый вход: в чате ввести
```
/register твой_пароль твой_пароль
```
В следующие разы — `/login твой_пароль`.

## Моды (для ручной установки)

| Мод | Версия | Modrinth | Прямая ссылка |
|---|---|---|---|
| Fabric API | 0.136.1+1.21.8 | [страница](https://modrinth.com/mod/fabric-api) | [.jar](https://cdn.modrinth.com/data/P7dR8mSH/versions/g58ofrov/fabric-api-0.136.1%2B1.21.8.jar) |
| Fabric Language Kotlin | 1.13.11 | [страница](https://modrinth.com/mod/fabric-language-kotlin) | [.jar](https://cdn.modrinth.com/data/Ha28R6CL/versions/2i87JpYj/fabric-language-kotlin-1.13.11%2Bkotlin.2.3.21.jar) |
| Plasmo Voice | 2.1.9 | [страница](https://modrinth.com/mod/plasmo-voice) | [.jar](https://cdn.modrinth.com/data/1bZhdhsH/versions/B2yGOZ6R/plasmovoice-fabric-1.21.6-2.1.9.jar) |
| Sodium | 0.7.3 | [страница](https://modrinth.com/mod/sodium) | [.jar](https://cdn.modrinth.com/data/AANobbMI/versions/7pwil2dy/sodium-fabric-0.7.3%2Bmc1.21.8.jar) |
| Iris Shaders | 1.9.6 | [страница](https://modrinth.com/mod/iris) | [.jar](https://cdn.modrinth.com/data/YL57xq9U/versions/Rhzf61g1/iris-fabric-1.9.6%2Bmc1.21.8.jar) |

Необходимы: Fabric API, Fabric Language Kotlin, Plasmo Voice. Sodium и Iris — опционально (FPS и шейдеры).
