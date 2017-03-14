module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-regex-replace');

  grunt.initConfig({

    clean: {
      dist: "dist",
      tmp: "tmp",
    },

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss'],
        dest: 'dist'
      },
      includes_to_dist: {
        cwd: 'includes',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss'],
        dest: 'dist'
      },
      pluginDef: {
        expand: true,
        src: ['README.md'],
        dest: 'dist',
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'README.md'],
        tasks: ['rebuild'],
        options: {spawn: false}
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets:  ["es2015"],
        plugins: ['transform-es2015-modules-systemjs', "transform-es2015-for-of"],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['**/*.js', '!src/directives/*.js', '!src/filters/*.js'],
          dest: 'dist',
          ext:'.js'
        }]
      },
    },

    curl: {
      worldmap: {
        src: 'https://grafana.com/api/plugins/grafana-worldmap-panel/versions/0.0.16/download',
        dest: 'tmp/worldmap.zip',
      },
    },

    unzip: {
      worldmap: {
        src: 'tmp/worldmap.zip',
        dest: 'dist/grafana-worldmap-panel',
        router: function (filepath) {
          var matches = filepath.match(/^.+?\/dist\/(.+)/);
          if (matches) {
            return matches[1];
          }

          return null;
        },
      },
    },

    "regex-replace": {
      worldmap: {
        src: 'dist/grafana-worldmap-panel/worldmap_ctrl.js',
        actions: [
          {
            name: 'module.html',
            search: "'module.html';",
            replace: "'../../plugins/grafana-worldmap-panel/module.html';",
          },
        ],
      },
    },

    jshint: {
      source: {
        files: {
          src: ['src/**/*.js'],
        }
      },
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish'),
        ignores: [
          'node_modules/*',
          'dist/*',
        ]
      }
    },

    jscs: {
      src: ['src/**/*.js'],
      options: {
        config: ".jscs.json",
      },
    },

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          "dist/css/worldping.dark.css": "src/sass/worldping.dark.scss",
          "dist/css/worldping.light.css": "src/sass/worldping.light.scss",
        }
      }
    }
  });

  grunt.registerTask('default', [
    'clean',
    'sass',
    'copy:src_to_dist',
    'copy:pluginDef',
    'babel',
    'curl:worldmap',
    'unzip:worldmap',
    'regex-replace:worldmap',
    'jshint',
    'jscs',
    ]);

  grunt.registerTask('rebuild', [
    'clean:dist',
    'sass',
    'copy:src_to_dist',
    'copy:pluginDef',
    'babel',
    'unzip:worldmap',
    'regex-replace:worldmap',
    'jshint',
    'jscs',
    ]);

  // does not have sass due to grafana file dependency
  grunt.registerTask('test', [
    'clean',
    'copy:src_to_dist',
    'copy:pluginDef',
    'babel',
    'jshint',
    'jscs',
    ]);
};
