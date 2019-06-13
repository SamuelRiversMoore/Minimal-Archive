Minimal-Archive
===============

A minimal tool (javascript with no dependencies, php) to display images on a web page.

## Table of Contents

1. Prerequisites
2. Installation
3. Usage
4. Project structure
5. Translation
6. Compilation
7. Extras (fonts etc.)

## Prerequisites

- `php` >= 7.0

## Installation
1. Put everything inside the `./www` folder in your server. Make sure the folder is writable.
2. Head to `{your-url}/install`.
3. Add a title, description, favicon, social image, email and password.
6. Enjoy `{your-url}` (+ keyboard navigation).
7. Uninstall using `{your-url}/uninstall`. This will remove the account and the meta file but keep the images.

## Usage
1. Head to `{your-url}/edit` with your email and password.
2. Edit the title and the note.
3. Add, rename or delete a bunch of images.
4. Save or cancel your changes.

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
npx rollup ./src/js/index.js --file www/assets/js/index.js --format iife -w

npx rollup ./src/js/edit.js --file www/assets/js/edit.js --format iife -w

# the -w option is for watching for changes and recompiling
```

If you wish to edit the css, you may want to use the scss sources. Compile using sass.

```sh
sass --watch src/css:www/assets/css
```

## Extra

Suggested Font: [Arcadia Textbook](https://github.com/SamuelRiversMoore/Arcadia-Textbook)