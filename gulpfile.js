const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const path = require('path');

gulp.task('js', () => {
    return gulp
        .src([
            './src/*.js',
            './src/**/*.js'
        ])
        .pipe(plumber())
        .pipe(babel({ presets: ['env'] }))
        .pipe(concat('rapidsockets.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['js']);

gulp.task('watch', () => {
    gulp.start(['js']);

    watch([
        './src/**/*.js',
        './src/*.js',
    ], () => {
        gulp.start(['js']);
    })
});
