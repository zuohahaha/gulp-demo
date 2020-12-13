const gulp = require('gulp');
const {
  series,
  parallel,
  watch,
  src,
  dest
} = require('gulp');
//工具
const autoprefixer = require('gulp-autoprefixer');
const include = require('gulp-file-include');
const clean = require('gulp-clean');

//转码
const less = require('gulp-less');

//浏览器
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

//源文件路径
const srcPath = {
  root: 'src',
  html: ['src/**/*.html', '!src/include/**/*.html'],
  images: 'src/images/*',
  css: 'src/css/*.css',
  less: 'src/less/*.less',
  js: 'src/js/*.js',
  library: 'src/library/*.js'
};
//开发生成路径
const distPath = {
  root: 'dist',
  html: 'dist',
  images: 'dist/images',
  css: 'dist/css',
  less: 'dist/less',
  js: 'dist/js',
  library: 'dist/library',
  manifest: 'dist/**/*.json',
};

//开发环境
//css处理
function cssDev() {
  return src(srcPath.css)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(dest(distPath.css))
    .pipe(reload({
      stream: true
    }))
}
//less处理
function lessDev() {
  return src(srcPath.less)
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(dest(distPath.less))
    .pipe(reload({
      stream: true
    }))
}
//js处理
function jsDev() {
  return gulp.src(srcPath.js)
    .pipe(dest(distPath.js))
    .pipe(reload({
      stream: true
    }))
}
//library 处理
function libraryDev() {
  return src(srcPath.library)
    .pipe(dest(distPath.library))
    .pipe(reload({
      stream: true
    }))
}

//image 处理
function imagesDev() {
  return src(srcPath.images)
    .pipe(dest(distPath.images))
    .pipe(reload({
      stream: true
    }))
}
//html 处理
function htmlDev() {
  return src(srcPath.html)
    .pipe(include({}))
    .pipe(dest(distPath.html))
    .pipe(reload({
      stream: true
    }))
}

//清除dist目录
function cleanDir() {
  return src('dist/*')
    .pipe(clean({
      read: false
    }))
}

//静态服务器
function browser() {
  browserSync.init({
    server: {
      baseDir: './dist',
    }
  })
  watchDev();
}

function watchDev() {
  console.log("开始监控")
  watch(srcPath.css, function(cb) {
    cssDev()
  });
  watch(srcPath.less, function(cb) {
    lessDev()
  });
  watch(srcPath.html, function(cb) {
    htmlDev()
  });
  watch(srcPath.js, function(cb) {
    jsDev()
  });
  watch(srcPath.library, function(cb) {
    libraryDev()
  });
  watch(srcPath.images, function(cb) {
    imagesDev()
  });
}
exports.dev = series(cleanDir, parallel(libraryDev, cssDev, lessDev, imagesDev, jsDev, htmlDev), browser)