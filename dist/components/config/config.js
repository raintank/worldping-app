'use strict';

System.register(['./config.html!text', 'lodash'], function (_export, _context) {
  var configTemplate, _, _createClass, WorldPingConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_configHtmlText) {
      configTemplate = _configHtmlText.default;
    }, function (_lodash) {
      _ = _lodash.default;
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
          this.validKey = false;
          this.quotas = {};
          this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
          this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));

          if (this.appModel.jsonData === null) {
            this.appModel.jsonData = {};
          }
          if (!this.appModel.secureJsonData) {
            this.appModel.secureJsonData = {};
          }
          if (this.appModel.enabled) {
            this.validateKey();
          }
        }

        _createClass(WorldPingConfigCtrl, [{
          key: 'validateKey',
          value: function validateKey() {
            var self = this;
            var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/org/quotas');
            p.then(function (quotas) {
              self.validKey = true;
              self.quotas = quotas;
            }, function () {
              if (self.appModel.enabled) {
                self.appModel.jsonData.apiKeySet = false;
                self.appModel.secureJsonData.apiKey = "";
                self.errorMsg = "invlid apiKey";
              }
            });
            return p;
          }
        }, {
          key: 'preUpdate',
          value: function preUpdate() {
            var model = this.appModel;
            if (!model.enabled) {
              return Promise.resolve();
            }

            if (!model.jsonData.apiKeySet && !model.secureJsonData.apiKey) {
              model.enabled = false;
              return Promise.reject("apiKey not set.");
            }
            // if the apiKey is being set, check and make sure that
            // we have initialized our datasource and dashboards.
            if (model.secureJsonData.apiKey) {
              model.jsonData.apiKeySet = true;

              if (!model.jsonData.datasourceSet) {
                var p = this.initDatasource();
                p.then(function () {
                  model.jsonData.datasourceSet = true;
                });
                return p;
              }
            }

            return Promise.resolve();
          }
        }, {
          key: 'postUpdate',
          value: function postUpdate() {
            if (!this.appModel.enabled) {
              return Promise.resolve();
            }
            var self = this;
            var p = this.validateKey();
            p.then(function () {
              return self.appEditCtrl.importDashboards().then(function () {
                return {
                  url: "dashboard/db/worldping-home",
                  message: "worldPing app installed!"
                };
              });
            });
            return p;
          }
        }, {
          key: 'configureDatasource',
          value: function configureDatasource() {
            var _this = this;

            this.appModel.jsonData.datasourceSet = false;
            this.initDatasource().then(function () {
              _this.appModel.jsonData.datasourceSet = true;
            });
          }
        }, {
          key: 'initDatasource',
          value: function initDatasource() {
            var self = this;
            //check for existing datasource.
            var p = self.backendSrv.get('/api/datasources');
            p.then(function (results) {
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
                  url: 'api/plugin-proxy/raintank-worldping-app/api/graphite',
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
                  url: 'api/plugin-proxy/raintank-worldping-app/api/elasticsearch',
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
            return p;
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
