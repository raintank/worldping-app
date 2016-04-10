'use strict';

System.register([], function (_export, _context) {
  return {
    setters: [],
    execute: function () {
      (function () {
        "use strict";

        // Tun on full stack traces in errors to help debugging

        Error.stackTraceLimit = Infinity;

        window.__karma__.loaded = function () {};

        System.config({
          baseURL: '/base/',
          defaultJSExtensions: true,
          paths: {}
        });

        function file2moduleName(filePath) {
          return filePath.replace(/\\/g, '/').replace(/^\/base\//, '').replace(/\.\w*$/, '');
        }

        function onlySpecFiles(path) {
          return (/specs.*/.test(path)
          );
        }

        // load specs
        return Promise.all(Object.keys(window.__karma__.files) // All files served by Karma.
        .filter(onlySpecFiles).map(file2moduleName).map(function (path) {
          // console.log(path);
          return System.import(path);
        })).then(function () {
          window.__karma__.start();
        }, function (error) {
          window.__karma__.error(error.stack || error);
        }).catch(function (error) {
          window.__karma__.error(error.stack || error);
        });
      })();
    }
  };
});
//# sourceMappingURL=main.js.map
