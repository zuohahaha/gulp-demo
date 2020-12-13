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
const babel = require('gulp-babel');
const css_base64 = require('gulp-css-base64');

//压缩优化
const minifyHtml = require('gulp-htmlmin');
const minifyImage = require('gulp-imagemin');
const minifyJs = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');

//版本控制
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const delOriginal = require('gulp-rev-delete-original');

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
//生产生成路径
const buildPath = {
  root: 'build',
  html: 'build',
  images: 'build/images',
  css: 'build/css',
  less: 'build/less',
  js: 'build/js',
  library: 'build/library',
  manifest: 'build/**/*.json',
};


//生产环境
//第三方库
function libraryBuild() {
  return src(srcPath.library)
    .pipe(minifyJs())
    .pipe(dest(buildPath.library));
}

//css处理
function cssBuild() {
  return src([buildPath.manifest, buildPath.css + '/*.css'])
    .pipe(revCollector())
    .pipe(rev())
    .pipe(delOriginal())
    .pipe(dest(buildPath.css))
    .pipe(rev.manifest())
    .pipe(dest(buildPath.css))
}

function cssCompile() {
  return src([srcPath.css])
    .pipe(css_base64({
      maxWeightResource: 8 * 1024,
    }))
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(dest(buildPath.css))
}
//less处理
function lessBuild() {
  return src([buildPath.manifest, buildPath.less + '/*.css'])
    .pipe(revCollector())
    .pipe(rev())
    .pipe(delOriginal())
    .pipe(dest(buildPath.less))
    .pipe(rev.manifest())
    .pipe(dest(buildPath.less))
}

function lessCompile() {
  return src([srcPath.less])
    .pipe(css_base64({
      maxWeightResource: 8 * 1024,
    }))
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(dest(buildPath.less))
}

//js处理
function jsBuild() {
  return src(srcPath.js)
    .pipe(babel({
      presets: ['env'],
    }))
    .pipe(minifyJs())
    .pipe(rev())
    .pipe(dest(buildPath.js))
    .pipe(rev.manifest())
    .pipe(dest(buildPath.js))
}

//image 处理
function imagesBuild() {
  return src(srcPath.images)
    .pipe(minifyImage())
    .pipe(rev())
    .pipe(dest(buildPath.images))
    .pipe(rev.manifest())
    .pipe(dest(buildPath.images))
}
//html 处理
function htmlBuild() {
  return src([buildPath.manifest, ...srcPath.html])
    .pipe(include({}))
    .pipe(revCollector({
      replaceReved: true,
    }))
    .pipe(minifyHtml({
      collapseWhitespace: true,
    }))
    .pipe(dest(buildPath.html))
}

//清除build目录
function cleanBuild() {
  return src('build/*')
    .pipe(clean({
      read: false
    }))
}

//清除manifest
function cleanManifest() {
  return src('build/**/*.json')
    .pipe(clean({
      read: false
    }))
}

exports.build = series(cleanBuild, imagesBuild, jsBuild, libraryBuild, lessCompile,
  lessBuild, cssCompile, cssBuild, htmlBuild,
  cleanManifest)
