let preprocessor = 'sass';

const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();

const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

const sass = require('gulp-sass');
const jade = require('gulp-jade');

const autoPrefixer = require('gulp-autoprefixer');

const cleancss = require('gulp-clean-css');

function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/' },
		notify: false,
		online: true
	})
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'app/js/app.js'
	])
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('app/sass/' + 'main.' + preprocessor + '')
		.pipe(eval(preprocessor)())
		.pipe(concat('app.min.css'))
		.pipe(autoPrefixer({}))
		.pipe(cleancss({level: {1: {specialComments: 0}}}))
		.pipe(dest('app/css/'))
		.pipe(browserSync.stream())
}

function jadify() {
	return src('app/**/*.jade')
		.pipe(jade())
		.pipe(dest('app'))
		.pipe(browserSync.stream())
}

function startwatch() {
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch('app/**/' + preprocessor + '/**/*', styles);
	watch('app/**/*.jade', jadify);
	watch('app/**/*.html').on('change', browserSync.reload);
}

function buildcopy() {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' })
	.pipe(dest('dist'))
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.startwatch = startwatch;
exports.cleandist = cleandist;
exports.build = series(styles, scripts, buildcopy);
exports.jade = jadify;

exports.default = parallel(browsersync, styles, scripts, jadify, startwatch);