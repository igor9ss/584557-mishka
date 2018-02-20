"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minifyCss = require("gulp-csso");
var rename = require("gulp-rename");
var imageMin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgStore = require("gulp-svgstore");
var postHtml = require("gulp-posthtml");
var include = require("posthtml-include");
var runSequence = require('run-sequence');
var htmlMin = require("gulp-htmlmin");
var del = require("del");
var typeOfCompression = 3;
var qualityOfImage = 90;

gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minifyCss())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png, jpg, svg}")
    .pipe(imageMin([
      imageMin.optipng({optimizationLevel: typeOfCompression}),
      imageMin.jpegtran({progressive: true}),
      imageMin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png, jpg}")
    .pipe(webp({quality: qualityOfImage}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/*.svg")
    .pipe(svgStore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(postHtml([
      include()
    ]))
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("build", function (done) {
  runSequence(
    "clean",
    "copy",
    "style",
    "sprite",
    "html",
    done
  );
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("build/*.html", ["html"]);
});
