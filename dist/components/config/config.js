'use strict';

System.register(['./config.html!text'], function (_export, _context) {
  var configTemplate, _createClass, WorldPingConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_configHtmlText) {
      configTemplate = _configHtmlText.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('ConfigCtrl', WorldPingConfigCtrl = function () {
        function WorldPingConfigCtrl($scope, $injector, backendSrv) {
          _classCallCheck(this, WorldPingConfigCtrl);

          this.backendSrv = backendSrv;
          var self = this;
          this.appEditCtrl.setPreUpdateHook(this.preUpdate());

          if (this.appModel.jsonData === null) {
            this.appModel.jsonData = {};
          }
        }

        _createClass(WorldPingConfigCtrl, [{
          key: 'preUpdate',
          value: function preUpdate() {
            var self = this;
            return function () {
              var promises = [];
              //if the apiKey is being set, check and make sure that we have initialized our datasource and dashboards.
              if (self.appModel.secureJsonData && self.appModel.secureJsonData.apiKey) {
                self.appModel.jsonData.apiKeySet = true;
                if (!self.appModel.jsonData.datasourceSet) {
                  promises.push(self.initDatasource().then(function () {
                    self.appModel.jsonData.datasourceSet = true;
                  }));
                }
              }
              return Promise.all(promises);
            };
          }
        }, {
          key: 'configureDatasource',
          value: function configureDatasource() {
            var self = this;
            this.ctrl.appModel.jsonData.datasourceSet = false;
            this.initDatasource().then(function () {
              self.ctrl.appModel.jsonData.datasourceSet = true;
              console.log("datasource initialized");
            });
          }
        }, {
          key: 'initDatasource',
          value: function initDatasource() {
            var self = this;
            //check for existing datasource.
            return self.backendSrv.get('/api/datasources').then(function (results) {
              var foundGraphite = false;
              var foundElastic = false;
              _.forEach(results, function (ds) {
                if (foundGraphite && foundElastic) {
                  return;
                }
                if (ds.name === "raintank") {
                  foundGraphite = true;
                }
                if (ds.name === "raintankEvents") {
                  foundElastic = true;
                }
              });
              var promises = [];
              if (!foundGraphite) {
                // create datasource.
                var graphite = {
                  name: 'raintank',
                  type: 'graphite',
                  url: 'api/plugin-proxy/worldping-app/api/graphite',
                  access: 'direct',
                  jsonData: {}
                };
                promises.push(self.backendSrv.post('/api/datasources', graphite));
              }
              if (!foundElastic) {
                // create datasource.
                var elastic = {
                  name: 'raintankEvents',
                  type: 'elasticsearch',
                  url: 'api/plugin-proxy/worldping-app/api/elasticsearch',
                  access: 'direct',
                  database: '[events-]YYYY-MM-DD',
                  jsonData: {
                    esVersion: 1,
                    interval: "Daily",
                    timeField: "timestamp"
                  }
                };
                promises.push(self.backendSrv.post('/api/datasources', elastic));
              }
              return Promise.all(promises);
            });
          }
        }]);

        return WorldPingConfigCtrl;
      }());

      WorldPingConfigCtrl.template = configTemplate;

      _export('ConfigCtrl', WorldPingConfigCtrl);
    }
  };
});
//# sourceMappingURL=config.js.map
