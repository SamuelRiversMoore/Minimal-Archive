Minimal-Archive
===============

A minimal tool (javascript with no dependencies, php) to display images on a web page.

## Prerequisites

- `php` >= 7.0

## Installation
1. Put everything inside the `./www` folder in your server
2. Head to `{your-url}/install`
3. Add a title, description, favicon, social image, email and password.
6. Enjoy `{your-url}` (+ keyboard navigation)
7. Uninstall using `{your-url}/uninstall`. This will remove the account and the meta file.

## Usage
1. Head to `{your-url}/editor` with your email and password
2. Add a bunch of images
3. Edit the title and the note
4. Rename them
5. Save or cancel your changes

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
   ├── minimalarchive/
   │
   ├── meta.txt
   │   # This file contains all the page info :)
   │
   └── index.php
```

## Translation

The translation file is located in `www/minimalarchive/engine/translations.php`.
It's a simple array where the key is the language code.

## Compilation

If you plan to edit the javascript, you need to compile it to iife. A simple way to do this would be to use `rollup` via `npx`.

```sh
npx rollup ./src/js/index.js --file www/assets/js/main.js --format iife

# Watch the files using -w argument:
npx rollup ./src/js/index.js --file www/assets/js/main.js --format iife -w
```

If you wish to edit the css, you may want to use the scss sources. Compile using sass.

```sh
# index page
sass --watch --scss src/css/pages/index.scss:www/assets/css/index.css

# installation page
sass --watch --scss src/css/pages/install.scss:www/assets/css/install.css
```
