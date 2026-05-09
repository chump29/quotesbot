# ![QuotesBot](./utils/images/quotesbot.webp) QuotesBot

> - QuotesBot for Discord

---

![Biome](https://img.shields.io/badge/Biome-$_biome-informational?style=plastic&logo=biome) &nbsp;
![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-$_discord-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-$_drizzle-informational?style=plastic&logo=drizzle)
![SQLite](https://img.shields.io/badge/SQLite-$_sqlite-informational?style=plastic&logo=sqlite)

![CodeQL](https://github.com/chump29/quotesbot/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-96.55%25-success?style=plastic&logo=jest)

![License](https://img.shields.io/github/license/chump29/quotesbot?style=plastic&color=blueviolet&label=License&logo=gplv3)

---

### 🔗 Invite Link <!-- markdownlint-disable-line MD001 -->

[Add QuotesBot](https://discord.com/oauth2/authorize?client_id=1499785850303545454&permissions=3072&integration_type=0&scope=bot)

---

### 🖥️ Discord

#### Role Permissions:

| ⚙️ Permission |
|:-------------:|
|  ViewChannel  |
| SendMessages  |

#### Commands:

|    📋 Task     | 🔧 Command | ⚙️ Permission |
|:--------------:|:----------:|:-------------:|
|      Info      |  `/info`   | SendMessages  |
|      Ping      |  `/ping`   | SendMessages  |
| Generate Quote |  `/quote`  | Administrator |
| Reload Quotes  | `/reload`  | Administrator |
|  Start Quotes  |  `/start`  | Administrator |
|     Status     | `/status`  | Administrator |
|  Stop Quotes   |  `/stop`   | Administrator |

---

### 🛠️ Environment Management

#### NPM ([Bun](https://github.com/oven-sh/bun "Bun") toolkit):

| 📋 Task |  🔧 Command   |
|:-------:|:-------------:|
| Upgrade | `bun upgrade` |

---

### 📦 Dependency Management

#### Installation & Removal:

|        📋 Task         |            🔧 Command (Full)             |           🔧 Command (Short)           |
|:----------------------:|:----------------------------------------:|:--------------------------------------:|
|      Install DEV       |              `bun install`               |                `bun i`                 |
|      Install PROD      |        `bun install --production`        |               `bun i -p`               |
|     Add dependency     |      `bun add [package][@version]`       |      `bun a [package][@version]`       |
|   Add devDependency    | `bun add --save-dev [package][@version]` |     `bun a -d [package][@version]`     |
| Add optionalDependency | `bun add --optional [package][@version]` | `bun a --optional [package][@version]` |
|   Add peerDependency   |   `bun add --peer [package][@version]`   |   `bun a --peer [package][version]`    |
|       Add Global       |  `bun add --global [package][@version]`  |     `bun a -g [package][@version]`     |
|   Remove Dependency    |          `bun remove [package]`          |           `bun r [package]`            |

#### Maintenance & Quality:

|     📋 Task     |   🔧 Command (Full)    | 🔧 Command (Short)  |
|:---------------:|:----------------------:|:-------------------:|
|  Check Updates  |     `bun outdated`     |       &mdash;       |
|   Update All    |      `bun update`      |       &mdash;       |
| Update Specific | `bun update [package]` |       &mdash;       |
| Security Audit  |      `bun audit`       |       &mdash;       |
|  Package Info   |  `bun info [package]`  |       &mdash;       |
|   Run Script    |   `bun run [script]`   |   `bun [script]`    |
|      List       |       `bun list`       |       &mdash;       |
|   List Extra    |    `bun list --all`    |       &mdash;       |
|    Hierarchy    | `bun pm why [package]` | `bun why [package]` |

---

### 🧪 Development

#### Scripts:

|    📋 Task     |  🔧 Command (Full)   | 🔧 Command (Short) |
|:--------------:|:--------------------:|:------------------:|
| Lint All (DEV) |    `bun run lint`    |     `bun lint`     |
| Lint All (CI)  |  `bun run lint:ci`   |   `bun lint:ci`    |
|   Lint Biome   | `bun run lint:biome` |  `bun lint:biome`  |
|    Lint ENV    |  `bun run lint:env`  |   `bun lint:env`   |
|    Run DEV     |    `bun run dev`     |     `bun dev`      |
|    Run PROD    |    `bun run prod`    |     `bun prod`     |
|      Test      |    `bun run test`    |       &mdash       |

---

### 🖧 Docker

#### Environment Variables:

|   📝 Description   | 📌 Variable |  {...} Value   |
|:------------------:|:-----------:|:--------------:|
|     Autostart      |  AUTOSTART  | true/**false** |
| Message Channel ID | CHANNEL_ID  |  [channel id]  |
|      DB Name       |   DB_NAME   |  quotesbot.db  |
|      DB Path       |   DB_PATH   |     ./db/      |
|       Debug        |  IS_DEBUG   | true/**false** |
|      Logo URL      |  LOGO_URL   |     [url]      |
|      Bot Name      |    NAME     |   QuotesBot    |
|   Quote Timeout    |   TIMEOUT   |       6h       |
|     Bot Token      |    TOKEN    |    [token]     |

##### From `@postfmly/logoserver`:

| 📝 Description | 📌 Variable |    {...} Value    |
|:--------------:|:-----------:|:-----------------:|
|   IPv4/IPv6    |  LOGO_IPv6  |  true/**false**   |
|   Logo Name    |  LOGO_NAME  |    [filename]     |
|   Local Path   |  LOGO_PATH  |      [path]       |
|      Port      |  LOGO_PORT  | **Random**/[port] |

##### From `@postfmly/checkrate`:

| 📝 Description | 📌 Variable | {...} Value |
|:--------------:|:-----------:|:-----------:|
|   Rate Limit   |    RATE     |     1s      |

#### Deployment:

|  📜 Script  |  🔧 Command   |
|:-----------:|:-------------:|
|    Full     | `./build.sh`  |
| Docker Only | `./docker.sh` |

---

### 📄 Documentation

### Generate:

```bash
./docs.sh
```

---

### 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted
- **Github Actions:** Builds and pushes images to repository
  - latest
    - amd64
    - arm64
