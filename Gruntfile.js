module.exports = (grunt) => {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: [
        './src/js/*.js'
      ],
      options: {
        configFile: './eslint.json',
        globals: ['$', 'nearlib'],
      },
    },
    browserify: {
      target: {
        src: [ './src/js/*.js' ],
        dest: './src/main.js',
      },
    },
    uglify: {
      target: {
        src: './src/main.js',
        dest: './src/main.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.registerTask('default', [
    'eslint',
    'browserify',
    'uglify',
  ]);
};
