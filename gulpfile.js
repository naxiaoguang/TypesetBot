var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var concat = require('gulp-concat');

gulp.task('default', ['uglify'], function () {

});

gulp.task('uglify', function() {
    return gulp.src([
        'dependencies/jQuery/jquery-2.2.0.min.js',
        'src/source/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('src/build'));
});