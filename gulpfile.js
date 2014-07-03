var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var livereload = require('gulp-livereload');

var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var assign = require('lodash-node/modern/objects/assign');
var find = require('lodash-node/modern/collections/find');

var basePath = __dirname + '/src';

gulp.task('sass', function () {
    gulp.src('./src/css/main.scss')
        .pipe(sass({
            // FIXME:
            // https://github.com/sindresorhus/gulp-ruby-sass/pull/68
            // sourcemap: true
        }))
        .pipe(gulp.dest('./target/css'));
});

gulp.task('copy', function () {
    gulp.src('./src/images/**')
        .pipe(gulp.dest('./target/images'));
    // TODO: jspm bundle
    // https://github.com/jspm/jspm-cli/issues/43
    // TODO: Concatenate with polyfills
    gulp.src('./src/jspm_packages/**')
        .pipe(gulp.dest('./target/jspm_packages'));
    // SystemJS config
    gulp.src('./src/config.js')
        .pipe(gulp.dest('./target'));
    gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('./target/js'));
    gulp.src('./src/enhanced-views/**/*.ejs')
        .pipe(gulp.dest('./target/enhanced-views'));
});


gulp.task('generate', function () {
    generatePages();
});

gulp.task('watch', function () {
    var server = livereload();
    gulp.watch('./src/css/**/*.scss', ['sass']);
    gulp.watch('./src/**/*.ejs', ['generate']);
    gulp.watch('./src/js/**/*.js', ['copy']);
    gulp.watch('./src/images/**', ['copy']);
    gulp.watch('./src/enhanced-views/**/*.ejs', ['copy']);

    gulp.watch('./target/**').on('change', function (file) {
        server.changed(file.path);
    });
});

gulp.task('default', ['sass', 'copy', 'generate']);

var talks = require('./src/content/talks.json');
var authors = require('./src/content/authors.json');
var jobs = require('./src/content/jobs.json');

var pages = [
    {
        title: 'Home',
        fileBasename: 'index.ejs'
    },
    {
        title: 'Open Source',
        fileBasename: 'open-source.ejs'
    },
    {
        title: 'Events & Talks',
        fileBasename: 'events-&-talks.ejs',
        talks: talks
    },
    {
        title: 'Join the Team',
        fileBasename: 'join-the-team.ejs',
        jobs: jobs
    }
];

function createMd5Hash(emailAddress) {
    var crypto = require('crypto');
    return crypto.createHash('md5').update(emailAddress).digest('hex');
}

function generatePages() {
    pages.forEach(function (page) {
        var rootScope = {
            pages: pages,
            findAuthorByName: function (authorName) {
                return find(authors, { name: authorName });
            },
            momentFilter: function (dateString, formatString) {
                var moment = require('moment');
                return moment(dateString).format(formatString);
            },
            getGravatarUrl: function (emailAddress) {
                return 'http://www.gravatar.com/avatar/' + createMd5Hash(emailAddress);
            }
        };
        var pageScope = Object.create(rootScope);
        assign(pageScope, page);
        var filename = path.join(basePath, page.fileBasename);
        var file = fs.readFileSync(filename, { encoding: 'utf8' });
        var output = ejs.render(file, {
            // Needed by EJS
            filename: filename,
            scope: pageScope
        });

        fs.writeFileSync('./target/' + page.fileBasename.replace(/\.ejs$/, '.html'),
            output, { encoding: 'utf8' });
    });
}
