module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                src: ['js/*.js','js/!*.min.js'],
                dest: 'js/main.min.js'
            }
        },
        stylus: {
            compile: {
                files: {
                    'css/dev/stylus.css': ['styl*//*.styl']
                },
                options: {
                    compress: false
                }
            }
        },
        cssmin: {
            compress: {
                files: {
                    'css/prod/main.min.css': ['css/dev/normalize.css', 'css/dev/*.css']
                }
            }
        },
        connect: {
            all: {
                options:{
                    port: 9000,
                    hostname: '127.0.0.1',
                    base: '.',
                    //keepalive: true,
                    livereload: true
                }
            }
        },
        watch: {
            stylus: {
                files: ['styl*//*.styl'],
                tasks: ['stylus']
            },
            /*cssmin: {
                files: ['css/dev*//*.css'],
                tasks: ['cssmin']
            },
            files: '*.html',*/
            options: {
                livereload: true
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['uglify', 'cssmin']);
    grunt.registerTask('dev',[
        'connect',
        'stylus',
        'watch'
    ]);

};