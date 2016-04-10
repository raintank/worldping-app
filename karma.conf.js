module.exports = function(config) {
  'use strict';

  config.set({
    basePath: __dirname + '/dist',

    frameworks: ['mocha', 'expect', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      'tests/main.js',
      {pattern: '**/*.js', included: false},
    ],

    // list of files to exclude
    exclude: [],

    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    captureTimeout: 2000,
    singleRun: true,
    autoWatchBatchDelay: 1000,
  });
};
