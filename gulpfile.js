var gulp = require('gulp');
var browserify = require('browserify');
var source = require("vinyl-source-stream");
var reactify = require('reactify');
var sass = require('gulp-ruby-sass');
var plumber = require('gulp-plumber');
var notify  = require('gulp-notify');
var babelify = require("babelify");
var handleErrors = require('./gulp/util/handleErrors');

gulp.task('browserify', function(){
  return browserify({
    entries: './src/js/main.js',
    debug: true,
  })
    .transform(babelify)
    // .transform(reactify, {es6: true})
    .bundle()
    .on('error', handleErrors)
    .pipe(source('bluff.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('sass', function(){
  return sass('./src/scss/', { style: 'expanded' })
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch',function(){
  gulp.watch(['./src/js/*'],['browserify']);
  gulp.watch(['./src/scss/*.scss'],['sass']);
});

gulp.task('default', ['browserify', 'sass', 'watch']);
