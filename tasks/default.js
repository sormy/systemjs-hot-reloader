var gulp = require('gulp');
var sequence = require('gulp-sequence');

gulp.task('default', sequence('clean', 'build'));
