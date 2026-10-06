# ![QuotesBot](./utils/images/quotesbot.webp) QuotesBot

> - QuotesBot for Discord

---

![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-$_discord-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-$_drizzle-informational?style=plastic&logo=drizzle)
![SQLite](https://img.shields.io/badge/SQLite-$_sqlite-informational?style=plastic&logo=sqlite)

![CodeQL](https://github.com/$_user/$_repo/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic&logo=jest)

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/$_user/$_repo?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")

---

### What it does: <!-- markdownlint-disable-line MD001 -->

- Generates inspirational quotes

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
|      Info      |  `/info`   |     None      |
|      Ping      |  `/ping`   |     None      |
| Generate Quote |  `/quote`  | Administrator |

---

### 🖧 Docker

#### Environment Variables:

|      📝 Description       | 📌 Variable |  {...} Value   |
|:-------------------------:|:-----------:|:--------------:|
|         Activity          |  ACTIVITY   |    Quoting     |
|        Channel ID         | CHANNEL_ID  |     \<id>      |
|  Embed Color<sup>1</sup>  |    COLOR    |    #78866b     |
|          DB Name          |   DB_NAME   |  quotesbot.db  |
|          DB Path          |   DB_PATH   |      ./db      |
|           Debug           |    DEBUG    | true/**false** |
|         Bot Name          |    NAME     |   QuotesBot    |
| Quote Timeout<sup>2</sup> |   TIMEOUT   |       6        |
|         Bot Token         |    TOKEN    |    \<token>    |

###### <sup>1</sup> #RRGGBB format <!-- markdownlint-disable-line MD001 -->

###### <sup>2</sup> Values: @hourly / {hours} as number (2-23) / @daily (midnight)

##### From `@postfmly/logoserver`:

| 📝 Description | 📌 Variable |    {...} Value    |
|:--------------:|:-----------:|:-----------------:|
|   Logo Name    |  LOGO_NAME  |  quotesbot.webp   |
|   Local Path   |  LOGO_PATH  |  ./utils/images   |
|      Port      |  LOGO_PORT  | **Random**/[port] |
|    Logo URL    |  LOGO_URL   |      \<url>       |

##### From `@postfmly/checkrate`:

###### *NOTE: Rate limited to 1 request per 1 second*

#### Deployment:

|  📜 Script  |  🔧 Command   |
|:-----------:|:-------------:|
|    Full     | `./build.sh`  |
| Docker Only | `./docker.sh` |

---

### 📃 Quotes

`./db/quotes.csv`

```csv
quote,author
"Some quote",Some Author
```

###### *NOTE: Automatically refreshed during startup* <!-- markdownlint-disable-line MD001 -->

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
