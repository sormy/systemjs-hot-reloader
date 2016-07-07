var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');

var tsProject = ts.createProject('tsconfig.json', {
  declaration: true
});

gulp.task('build', function () {
  var savedPipe = tsProject.src().pipe(ts(tsProject));

  return merge([
    savedPipe.dts.pipe(gulp.dest('dist')),
    savedPipe.js.pipe(gulp.dest('dist'))
  ]);
});
