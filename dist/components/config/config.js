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

          this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
          this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));

          if (this.appModel.jsonData === null) {
            this.appModel.jsonData = {};
          }
        }

        _createClass(WorldPingConfigCtrl, [{
          key: 'preUpdate',
          value: function preUpdate() {
            var model = this.appModel;

            // if the apiKey is being set, check and make sure that
            // we have initialized our datasource and dashboards.
            if (model.secureJsonData && model.secureJsonData.apiKey) {
              model.jsonData.apiKeySet = true;

              if (!model.jsonData.datasourceSet) {
                return this.initDatasource().then(function () {
                  model.jsonData.datasourceSet = true;
                });
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

            return this.appEditCtrl.importDashboards().then(function () {
              return {
                url: "dashboard/db/worldping-home",
                message: "worldPing app installed!"
              };
            });
          }
        }, {
          key: 'configureDatasource',
          value: function configureDatasource() {
            var _this = this;

            this.ctrl.appModel.jsonData.datasourceSet = false;
            this.initDatasource().then(function () {
              _this.ctrl.appModel.jsonData.datasourceSet = true;
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
