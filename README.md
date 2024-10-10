# Xmind live protocol

An application to generate protocol documents from XMind mind maps.

## Download

Download the [latest release](https://github.com/davidenke/xmind-live-protocol/releases/latest/) for your platform.\
Other versions can be found on the [releases page](https://github.com/davidenke/xmind-live-protocol/releases/).

> Mac users: Determine the correct version for your macOS platform, either for Intel `*_x64.dmg` or Apple Silicon `*_aarch64.dmg`.

## Usage

Simply run the application and open an XMind mind map file (`*.xmind`) to generate a protocol document.

Xmind files can either be dragged onto the application window or opened via a file dialog after clicking the window.

Once opened, the protocol document will be updated automatically whenever the mind map is changed (saved to disk).

To open another mind map, simply close the window with the current protocol document and open up a new one.

> Mac users: Make sure to allow the app to run (system preferences → Security & Privacy → General) once you tried to open it unsuccessfully.

---

## Development

### tl;dr

Assuming you have [Rust], [nvm][nvm-nix] and [pnpm] installed, you can run the application with the following commands:

```bash
nvm use && pnpm i
pnpm dev
```

### Prerequisites

To develop and build the application, you have to checkout the sources and install the required tooling.

#### Checkout repository

```bash
git clone https://github.com/davidenke/xmind-live-protocol.git
cd ./xmind-live-protocol
```

#### Setup tooling

The application is built with [Tauri], a framework for building desktop applications with web technologies and a [Rust] backend.

##### macOS

- Xcode Command Line Tools (macOS)
- [Rust] for the backend
- [Version manager][nvm-nix] for [Node.js]
- [pnpm] package manager

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

##### Windows

1. Rust\
   → https://v1.tauri.app/v1/guides/getting-started/prerequisites/#setting-up-windows
1. [Version manager][nvm-win] for [Node.js]\
   → https://github.com/coreybutler/nvm-windows?tab=readme-ov-file#install-nvm-windows
1. [pnpm] package manager\
   → https://pnpm.io/installation#on-windows

#### Install dependencies

And use correct Node.js version from [`.nvmrc`](./.nvmrc).

```bash
nvm install $(cat .nvmrc)
nvm use $(cat .nvmrc)
pnpm install
```

#### Run development server

To conveniently develop the application, you can start the development server with the following command:

```bash
pnpm dev
```

This will start the frontend using [Vite] and the backend using [Tauri].

#### Build application

To build the application for distribution, you can run the following command:

```bash
pnpm build
```

## Icons

### App icon

Most of the app icons are generated after installation.

The only exception is the macOS icon, which is configured to be used from the [`./src/assets/icons/app.icon.icns` path](./src/assets/icons/app.icon.icns) directly.

This icon is sourced from its Adobe Illustrator file [`./src/assets/icons/app.icns.ai`](./src/assets/icons/app.icns.ai). Once opened and edited, the icons has to be exported in [eight different sizes as PNGs and converted properly](https://gist.github.com/jamieweavis/b4c394607641e1280d447deed5fc85fc).\
To export the files properly, use the Illustrator export dialog (`File → Export → Export for Screens...`). A preset can be imported from the [`./src/assets/icons/app.icns.preset`](./src/assets/icons/app.icns.preset) file.\
Output the files to the to be created [`./src/assets/icons/icon.iconset`](./src/assets/icons/icon.iconset) folder.\
Then, this folder is converted to an ICNS file using the `iconutil` command on macOS: `iconutil --convert icns --output src/assets/icons/app.icon.icns src/assets/icons/icon.iconset`.

```bash

[Rust]: https://www.rust-lang.org/
[pnpm]: https://pnpm.io/
[Tauri]: https://tauri.app/
[Vite]: https://vitejs.dev/
[Node.js]: https://nodejs.org/
[nvm-nix]: https://github.com/nvm-sh/nvm
[nvm-win]: https://github.com/coreybutler/nvm-windows
```
