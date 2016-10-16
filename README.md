# SystemJS Hot Reloader #

Universal hot reloader for SystemJS / JSPM.

This is more powerfull alternative to `capaj/systemjs-hot-reloader`.

## Features ##

* Designed to be used together with `bs-systemjs-hot-reloader` package
  which will be responsible for
  * development web server
  * watch for file changes and emit reload event to this module
  * track CSS/LESS/SASS/SCSS/Stylus dependencies
* Reload js, jsx, ts, tsx etc on the fly with all related modules
* Reload CSS/LESS/SASS/SCSS/Stylus if plugin supports hot reload
* Console status logging like in webpack
* Track errors during reload and revert back on errors
* Custom __reload() / __unload() hooks
* Optimize reload strategy based on full dependency graph
* Works with/without enabled `SystemJS.trace`
* React Hot Loader v3.x friendly

## TODO ##

* Add tests
* Test for support with different JSPM / SystemJS versions
* Fancy error screen (react-redbox ?)
* Show BrowserSync notification on reload
* Show BrowserSync notification for hooks (__reload() and __unload())
* Assume that some modules like scss|sass|less|style have no exports
  (so reloading them will not cause reload for modules which imports them)
* Babel plugin to strip __unload() / __reload() for production builds
* Module unload if it was removed (for example, removed css module)
* Get rid of react hot loader babel plugin
* Reload assets (fonts, images, cursors etc)

## Installation ##

```shell
npm install browser-sync bs-systemjs-hot-reloader --save-dev
jspm install npm:systemjs-hot-reloader-ex --dev
```

## Usage ##

Please refer to `bs-systemjs-hot-reloader` usage to setup BrowserSync with plugin.

It is peer dependency for `bs-systemjs-hot-reloader`, but tehnically could be used
as client side reloader for any 3rd party development server.

### Log Level ###

Log level could be changed on the fly with:

```javascript
// Log level: 0 - none, 1 - error, 2 - info (default), 3 - debug
SystemJS.import('systemjs-hot-reloader-ex')
  .then(function (exports) {
    exports.default.logLevel = 3;
  });
```

### JavaScript Hot Reloader ###

This reloader could reload any JS module and will track all dependencies.

By default this reloader will recursively all parents of modified module
and will reinject all modules.

Modules with side effects should export `__unload()` hook.

Modules with alternative reload logic should export `__reload()` hook.

Both hooks have array of reinjected modules as first argument.

### CSS Hot Reloader ###

This reloader could reload any module, including CSS, LESS, SCSS, SASS, Stylus,
PostCSS if css plugin supports correct reinjection.

Server side `bs-systemjs-hot-reloader` could track LESS, SCSS, SASS, Stylus
dependency tree to reload root module if one of dependencies is changed.

The fastest reload is guaranteed when css filename could be 1:1 resolved to
module name. It works when you have css loading workflow like below:

```javascript
SystemJS.config({
  meta: {
    "*.css": {
      "loader": "plugin-css"
    },
    "*.scss": {
      "loader": "plugin-sass"
    }
  },
});
```

```javascript
import 'app.css';
import 'component.scss';
```

A slightly slower loading workflow (guess loader by adding `!` to filename in resolver):

```javascript
import 'app.css!';
import 'component.scss!';
```

The slowest loading workflow (need to search in all loaded modules):

```javascript
import 'app.css!plugin-css';
import 'component.scss!plugin-sass';
```

### React Hot Reloader ###

React, babel plugin, babel preset are required (obviously):

```shell
jspm install react react-dom
jspm install plugin-babel babel-preset-react --dev
```

We could use WebPack's react hot reloader.

```shell
jspm install npm:react-hot-loader@3.0.0-beta.5 --save-dev
```

React Hot Reloader v3.x is the best hot reloader and it uses the best things
from both `react-transform-hmr` and `react-hot-loader` v1.x - v2.x

How does it work:

* `react-hot-loader/babel` required to wrap `import()`
* `react-hot-loader/lib/patch.dev.js` will patch React
* `react-hot-loader/lib/AppContainer.dev.js` will restore state on reload
* `__reload()` hook required to rerender application instead of module reload
* different application entry points for development and production

File: `jspm.config.js`:

```javascript
SystemJS.config({
  paths: {
    "app/": "src/"
  },
  transpiler: "plugin-babel",
  babelOptions: {
    "presets": [
      "babel-preset-react"
    ]
  },
  browserConfig: {
    "babelOptions": {
      "plugins": [
        "react-hot-loader/babel"
      ]
    },
    "packages": {
      "app": {
        "main": "index"
      }
    }
  },
  packages: {
    "app": {
      "main": "index.dist",
      "defaultExtension": "jsx"
    }
  }
});
```

File: `src/index.jsx` (development entry point):

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

import 'react-hot-loader/lib/patch.dev.js';
import AppContainer from 'react-hot-loader/lib/AppContainer.dev.js';

import App from './App';

const root = document.getElementById('root');

ReactDOM.render(<AppContainer><App /></AppContainer>, root);

export function __reload() {
  ReactDOM.render(<AppContainer><App /></AppContainer>, root);
}
```

File: `src/index.dist.jsx` (production entry point):

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(<App/>, document.getElementById('root'));
```

File: `./index.html` (development entry point):

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Application</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="jspm_packages/system.js"></script>
    <script src="jspm.config.js"></script>
    <script>SystemJS.import('app');</script>
  </body>
</html>
```

File: `./index.dist.html` (production entry point):

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Application</title>
  </head>
  <body>
    <div id="app-root"></div>
    <script src="app.js"></script>
  </body>
</html>
```
