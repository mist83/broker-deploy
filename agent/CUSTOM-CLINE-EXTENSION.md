# Custom Cline Extension Build Notes

This guide was salvaged from `mist83/clone`, which was a notes-only repo. It is for building a private Cline VS Code extension variant from the upstream `cline/cline` checkout.

## Purpose

Fork or clone Cline, replace branding assets, adjust extension metadata, package a `.vsix`, and install it locally.

## Prerequisites

```bash
git --version
node --version
npm --version
code --version
git lfs install
npm install -g @vscode/vsce
```

Cline uses Git LFS for binary assets. If clone or checkout fails, verify Git LFS first.

## Build Flow

```bash
git clone https://github.com/cline/cline.git cline-custom
cd cline-custom
npm run install:all
npm run protos
npm run compile
npx vsce package
code --install-extension ./cline-custom-*.vsix
```

## Branding Files

Common files to inspect or replace:

- `assets/cline-bot.svg`
- `assets/icon.png`
- `assets/cline-bot.ttf`
- `assets/cline-bot.woff`
- `webview-ui/public/`
- `package.json`

Useful searches:

```bash
rg "icon|cline-bot" package.json assets webview-ui/public
```

## Metadata

To avoid confusing the custom build with the official extension, update these fields in `package.json`:

- `name`
- `displayName`
- `description`
- `publisher`

Keep `name` lowercase and hyphenated. Install the official extension and custom extension side by side only if the identifiers are distinct.

## Troubleshooting

If the package build fails after dependency or generated-code drift:

```bash
rm -rf node_modules webview-ui/node_modules
npm run install:all
npm run protos
npm run compile
npx vsce package
```

## Source

Recovered from `mist83/clone` before that repo was retired into `mist83/agent`.
