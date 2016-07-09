# SystemJS Hot Reloader #

Plugin-based hot reloader for SystemJS.

This is alternative to capaj/systemjs-hot-reloader.

## Benefits ##

- browser sync friendly
- reload js, jsx, ts, tsx etc on the fly with all related modules on the fly
- small and easy to read
- pluggable listeners
- pluggable reloaders
- no root transpiler required
- typescript with typings
- revert module state back if error occured on import

## TODO ##

- BrowserSync plugin for transparent integration.
- Full state reloader for React applications.

## Installation ##

```shell
jspm install systemjs-hot-reloader=github:sormy/systemjs-hot-reloader --dev
```

## Recipes ##

### GULP + BrowserSync ###

Backend GULP serve task:

```javascript
var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('serve', function(done) {
  browserSync({
    online: false,
    open: false,
    port: 9000,
    //ghostMode: false,
    server: {
      baseDir: ['.tmp', '.'],
      middleware: function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});
```

Backend GULP watch task:

```javascript
var gulp = require('gulp');
var browserSync = require('browser-sync');
var path = require('path');

gulp.task('watch', function() {
  gulp.watch([ 'src/**/*.tsx', 'src/**/*.ts', 'src/**/*.jsx', 'src/**/*.js' ])
    .on('change', function(event) {
      var relPath = path.relative('.', event.path);
      browserSync.notify('Injected: ' + relPath);
      browserSync.get('singleton').sockets.emit('system:change', { path: relPath });
    });
});
```

Frontend index.html:

```html
<script src="jspm_packages/system.js"></script>
<script src="jspm.config.js"></script>
<script>
  if (location.hostname === 'localhost') {
    SystemJS.import('systemjs-hot-reloader')
      .then(function(exports) {
        return new exports.HotReloader({
          listeners: [ new exports.BrowserSyncListener() ]
        }).attach();
      })
      .then(SystemJS.import('app'));
  } else {
    SystemJS.import('app');
  }
</script>
```

BrowserSyncListener options:

- eventName: event name, defaults to "system:change"
- eventPath: event path, defaults to "path"

### Chokidar Socket Emitter Listener ###

Install socket.io peer dependency:

```shell
npm install chokidar-socket-emitter --save-dev
jspm install socket.io-client --dev
```

Backend task:

```javascript
var chokidarSocketEmitter = require('chokidar-socket-emitter');
chokidarSocketEmitter({ port: 5776, path: '.' });
```

Frontend task:

```html
<script src="jspm_packages/system.js"></script>
<script src="jspm.config.js"></script>
<script>
  if (location.hostname === 'localhost') {
    Promise.all([
      SystemJS.import('systemjs-hot-reloader'),
      SystemJS.import('socket.io-client')
    ])
    .then(function(exports) {
      let reloader = exports[0];
      let socket = exports[1];
      return new reloader.HotReloader({
        listeners: [
          new reloader.SocketListener({
            socket: socket('http://localhost:5776'),
            eventPath: 'path',
            eventName: 'change'
          })
        ]
      }).attach();
    })
    .then(SystemJS.import('app'));
  } else {
    SystemJS.import('app');
  }
</script>
```

## Hook into existing 3rd party socket.io ##

Backend task: any socket.io emitter

Frontend task: any socket.io listener

```html
<script src="jspm_packages/system.js"></script>
<script src="jspm.config.js"></script>
<script>
  if (location.hostname === 'localhost') {
    SystemJS.import('systemjs-hot-reloader')
      .then(function(exports) {
        return new exports.HotReloader({
          listeners: [
            new exports.SocketListener({
              socket: ...
            })
          ]
        }).attach();
      })
      .then(SystemJS.import('app'));
  } else {
    SystemJS.import('app');
  }
</script>
```

SocketListener options:

- socket: socket.io instance
- eventName: event name, defaults to "change"
- eventPath: event path, defaults to "path"

## React root state reloader ##

Reloaded react components will loose their state if they don't have properly wired in redux, mobx etc.

But this small plugin will allow to persist root components state. Just as an example of how plugins could be used.

```html
<script src="jspm_packages/system.js"></script>
<script src="jspm.config.js"></script>
<script>
  if (location.hostname === 'localhost') {
    SystemJS.import('systemjs-hot-reloader')
      .then(function(exports) {
        return new exports.HotReloader({
          listeners: [ new exports.BrowserSyncListener() ],
          plugins: [ new exports.KeepReactRootStatePlugin() ]
        }).attach();
      })
      .then(SystemJS.import('app'));
  } else {
    SystemJS.import('app');
  }
</script>
```

## Debug hot reloader ##

Enable debug to show some information on console.

```html
<script src="jspm_packages/system.js"></script>
<script src="jspm.config.js"></script>
<script>
  if (location.hostname === 'localhost') {
    SystemJS.import('systemjs-hot-reloader')
      .then(function(exports) {
        return new exports.HotReloader({
          listeners: [ new exports.BrowserSyncListener() ],
          debug: true
        }).attach();
      })
      .then(SystemJS.import('app'));
  } else {
    SystemJS.import('app');
  }
</script>
```
