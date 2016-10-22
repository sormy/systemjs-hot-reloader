# SystemJS Hot Reloader #

Universal hot reloader for SystemJS / JSPM.

This is more powerfull alternative to `capaj/systemjs-hot-reloader`.

Featured demo is available here: <https://github.com/sormy/jspm-hot-skeleton.git>

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
* Unload unused modules (mostly usefull for css modules).
  `SystemJS.trace = true` is required to track modules without exports.
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
* Show list of unloaded modules
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

or via `jspm.config.js`:

```javascript
SystemJS.config({
  hotReloaderOptions: {
    logLevel: 3
  }
});
```

### JavaScript Hot Reloader ###

This reloader could reload any JS module and will track all dependencies.

By default this reloader will recursively all parents of modified module
and will reinject all modules.

Modules with side effects should export `__unload()` hook.

Modules with alternative reload logic should export `__reload()` hook.

Both hooks have array of reinjected modules as first argument.

Please note that unused modules without exports can't be unloaded without extra
debug information which could be enable with `SystemJS.trace = true`.

### CSS Hot Reloader ###

This reloader could reload any module, including CSS, LESS, SCSS, SASS, Stylus,
PostCSS if css plugin supports correct reinjection.

Server side `bs-systemjs-hot-reloader` could track LESS, SCSS, SASS, Stylus
dependency tree to reload root module if one of dependencies is changed.

If you would like to be able to remove CSS modules on the fly after they were
initially loaded then you need to enable `SystemJS.trace = true`. Module to DOM
relations are tracked with selectors: `[data-url={address}]` and
`[data-systemjs-css, href={address}]`.

Avoid using of loaders via `!` because in that case there is no 100% way to
convert file name into module name so reloader will have to iterate over all
registered modules to find correct module name. It is recommended to define
loader via `meta` SystemJS config section for files based on their extension.

The fastest reload is guaranteed when css filename could be 1:1 resolved to
module name. It works when you have css loading workflow like below:

```javascript
SystemJS.config({
  meta: {
    "*.css": { "loader": "plugin-css" },
    "*.scss": { "loader": "plugin-sass" },
    "*.sass": { "loader": "plugin-sass" },
    "*.less": { "loader": "plugin-less" }
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

If you keep state in store model object or in `mobx` and your application will be
able to restore state from it, then you don't need this part, just keep you store
instance in separate module.

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

* `react-hot-loader/babel` babel plugin is required to wrap `import()`
* `react-hot-loader/lib/patch.dev.js` is required, will patch React on the fly
* `react-hot-loader/lib/AppContainer.dev.js` will restore state on reload
* `__reload()` hook required to rerender application instead of full module reload
* different application entry points for development and production

Please note, that **react-hot-loader/babel** should be **FIRST** plugin in list
of Babel plugins.

File: `jspm.config.js`:

```javascript
SystemJS.config({
  paths: {
    "app/": "src/"
  },
  meta: {
    "*.jsx": { loader: "plugin-babel" }
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
        "main": "index.jsx"
      }
    }
  },
  packages: {
    "app": {
      "main": "index.dist.jsx",
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
    <div id="root"></div>
    <script src="app.js"></script>
  </body>
</html>
```
