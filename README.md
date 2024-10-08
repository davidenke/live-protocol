# Xmind live protocol

Generate protocols from structured mind map data.

## tl;dr

Assuming you have [Rust], [nvm][nvm-nix] and [pnpm] installed, you can run the application with the following commands:

```bash
nvm use && pnpm i
pnpm dev
```

## Prerequisites

To develop and build the application, you have to checkout the sources and install the required tooling.

### Checkout repository

```bash
git clone https://github.com/davidenke/xmind-live-protocol.git
cd ./xmind-live-protocol
```

### Setup tooling

The application is built with [Tauri], a framework for building desktop applications with web technologies and a [Rust] backend.

#### macOS

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

#### Windows

1. Rust\
   → https://v1.tauri.app/v1/guides/getting-started/prerequisites/#setting-up-windows
1. [Version manager][nvm-win] for [Node.js]\
   → https://github.com/coreybutler/nvm-windows?tab=readme-ov-file#install-nvm-windows
1. [pnpm] package manager\
   → https://pnpm.io/installation#on-windows

### Install dependencies

And use correct Node.js version from [`.nvmrc`](./.nvmrc).

```bash
nvm install $(cat .nvmrc)
nvm use $(cat .nvmrc)
pnpm install
```

### Run development server

To conveniently develop the application, you can start the development server with the following command:

```bash
pnpm dev
```

This will start the frontend using [Vite] and the backend using [Tauri].

### Build application

To build the application for distribution, you can run the following command:

```bash
pnpm build
```

[Rust]: https://www.rust-lang.org/
[pnpm]: https://pnpm.io/
[Tauri]: https://tauri.app/
[Vite]: https://vitejs.dev/
[Node.js]: https://nodejs.org/
[nvm-nix]: https://github.com/nvm-sh/nvm
[nvm-win]: https://github.com/coreybutler/nvm-windows
