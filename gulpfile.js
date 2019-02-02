var gulp      = require('gulp'), // Подключаем Gulp
    sass        = require('gulp-sass'), //Подключаем Sass пакет,
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов
    // babel       = require('gulp-babel');

gulp.task('sass', function() { // Создаем таск "sass"
  return gulp.src(['public/sass/**/*.sass']) // Берем источник
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    .pipe(gulp.dest('public/styles')) // Выгружаем результата в папку css
    // .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
  });



gulp.task('watch',[ 'sass'], function() {
  gulp.watch(['public/sass/**/*.sass'], ['sass']); // Наблюдение за sass файлами в папке sass
});

gulp.task('default', ['watch']);
