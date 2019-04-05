Minimal-Archive
===============

A minimal tool (javascript with no dependencies, php) to display images on a web page.

## Prerequisites

- `php` >= 7.0

## Installation
1. Edit `./www/meta.txt` with the appropriate `title`, `description` and `shareimage`.
2. Add images in the `./www/images/` folder.
3. Edit the style if you wish in `./www/assets/css/main.css`
4. Put everything inside the `./www` folder in your server.
3. Enjoy (+ keyboard navigation).

## Project structure

```sh
Minimal-Archive/
│
├── src/
│   # sources
│
└── www/
   # This folder is all you need to deploy to your server
   │
   ├── assets/
   ├── images/
   ├── lib/
   └── index.php
```

## Compilation

If you plan to edit the javascript, you need to compile it to iife. A simple way to do this would be to use `rollup` via `npx`.

```sh
npx rollup ./src/js/index.js --file www/assets/js/main.js --format iife
# If you wish to watch files:
# npx rollup ./src/js/index.js --file www/assets/js/main.js --format iife -w
```