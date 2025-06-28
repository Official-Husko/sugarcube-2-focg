# 🍭 **SugarCube v2 — Fort of Chains: Galvanized Fork**

[**SugarCube**](http://www.motoslave.net/sugarcube/) is a free (gratis & libre) story format for [Twine/Twee](http://twinery.org/) — the interactive fiction tool.

---

## 🏰 About This Fork

This repository is a custom fork of SugarCube v2 for the game [**Fort of Chains: Galvanized**](https://github.com/Official-Husko/fork-of-chains).

- **Purpose:**
  - Keep this fork up-to-date with the main SugarCube branch.
  - Apply and maintain the changes required for Fort of Chains: Galvanized (FoC:G).
- **Upstream:** [SugarCube main repository](https://github.com/tmedwards/sugarcube-2)
- **Game Repo:** [Fort of Chains: Galvanized](https://github.com/Official-Husko/fork-of-chains/releases)

---

## 📚 Documentation & Downloads

👉 [SugarCube Website](http://www.motoslave.net/sugarcube/)

🐞 **Found a bug or have a suggestion?**

- [Create an Issue (Upstream)](https://github.com/tmedwards/sugarcube-2/issues)
- 📝 [Work Log (Upstream)](https://github.com/tmedwards/sugarcube-2/projects/1)

---

## 🚀 Installation

You can either:

- **Download** a precompiled package from the [SugarCube website](http://www.motoslave.net/sugarcube/)
- **Build from source** (see below)

---

## 🛠️ Building from Source

SugarCube uses **Node.js** (≥v16) for its build system.
You'll also need **Git** to fetch the source code.

### 1️⃣ Install Prerequisites

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

### 2️⃣ Clone the Repository

```sh
git clone https://github.com/Official-Husko/fork-of-chains.git
cd fork-of-chains
```

### 3️⃣ Choose a Branch

- `develop` — Main development branch
- `master` — Stable release branch

Switch branches as needed:

```sh
git checkout develop   # or master
```

### 4️⃣ Install Dependencies

```sh
npm install
```

### 5️⃣ Build SugarCube

```sh
node build.js
```

The compiled story formats (Twine 1 & 2) will be output to the `build` directory. 🎉

---

> **ℹ️ Note:**
> If you get build errors, try updating dependencies:
>
> ```sh
> npm update --save -D
> ```
>
> Or, if needed:
>
> ```sh
> npm uninstall
> npm install
> ```

> **💡 Tip:**
> For build options (debug, targeting specific Twine versions, etc.), run:
>
> ```sh
> node build.js -h
> ```

---

_Made with ❤️ for the interactive fiction community and the Fort of Chains: Galvanized project._
