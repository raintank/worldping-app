"use strict";

System.register(["lodash"], function (_export, _context) {
  "use strict";

  var _, _createClass, DatasourceUpgrader;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
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

      DatasourceUpgrader = function () {
        function DatasourceUpgrader(contextSrv, backendSrv, $q, datasourceSrv) {
          _classCallCheck(this, DatasourceUpgrader);

          this.backendSrv = backendSrv;
          this.contextSrv = contextSrv;
          this.datasourceSrv = datasourceSrv;
          this.$q = $q;
          this.apiKey = "";
          this.keyRequest = null;
          this.upgradeed = false;
        }

        _createClass(DatasourceUpgrader, [{
          key: "needsUpgrade",
          value: function needsUpgrade() {
            if (this.upgraded) {
              return false;
            }

            if (!this.datasourceSrv) {
              return false;
            }

            var datasources = this.datasourceSrv.getAll();

            if (!datasources.raintank || !/^\/api\/datasources\/proxy/.exec(datasources.raintank.url)) {
              return true;
            }

            if (!datasources.raintankEvents || !/^\/api\/datasources\/proxy/.exec(datasources.raintankEvents.url)) {
              return true;
            }

            return false;
          }
        }, {
          key: "canUpgrade",
          value: function canUpgrade() {
            // only admins can modify datasources.
            return this.contextSrv.hasRole("Admin");
          }
        }, {
          key: "upgrade",
          value: function upgrade() {
            if (this.canUpgrade()) {
              return this.configureDatasource();
            } else {
              return this.$q.when();
            }
          }
        }, {
          key: "getKey",
          value: function getKey() {
            // if we have already fetched the key, they just return it.
            if (this.apiKey !== "") {
              return this.$q.when(this.apiKey);
            }
            // if we are currently fetching the key, then just return the promise.
            // when it resolves, it will provide the key.
            if (this.keyRequest) {
              return this.keyRequest;
            }

            // fetch the key from the worldping-api
            var self = this;
            this.keyRequest = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/_key').then(function (resp) {
              if (resp.meta.code !== 200) {
                return self.$q.reject("failed to get current apiKey");
              }
              return resp.body.apiKey;
            });
            return this.keyRequest;
          }
        }, {
          key: "getDatasources",
          value: function getDatasources() {
            var self = this;
            //check for existing datasource.
            return self.backendSrv.get('/api/datasources').then(function (results) {
              var datasources = {
                graphite: null,
                elastic: null
              };
              _.forEach(results, function (ds) {
                if (ds.name === "raintank") {
                  datasources.graphite = ds;
                }
                if (ds.name === "raintankEvents") {
                  datasources.elastic = ds;
                }
              });
              return datasources;
            });
          }
        }, {
          key: "configureDatasource",
          value: function configureDatasource() {
            var _this = this;

            var self = this;
            //check for existing datasource.
            return this.getDatasources().then(function (datasources) {
              var promise = self.$q.when();

              var graphite = {
                name: 'raintank',
                type: 'graphite',
                url: 'https://tsdb-gw.raintank.io/graphite/',
                access: 'proxy',
                basicAuth: true,
                basicAuthPassword: "",
                basicAuthUser: "",
                jsonData: {}
              };
              if (!datasources.graphite) {
                // create datasource.
                promise = promise.then(function () {
                  return self.getKey().then(function (apiKey) {
                    graphite.basicAuthUser = "api_key";
                    graphite.basicAuthPassword = apiKey;
                    return self.backendSrv.post('/api/datasources', graphite);
                  });
                });
              } else if (!_.isMatch(datasources.graphite, graphite)) {
                // update datasource if necessary
                promise = promise.then(function () {
                  return self.getKey().then(function (apiKey) {
                    graphite.basicAuthUser = "api_key";
                    graphite.basicAuthPassword = apiKey;
                    return self.backendSrv.put('/api/datasources/' + datasources.graphite.id, _.merge({}, datasources.graphite, graphite));
                  });
                });
              }

              var elastic = {
                name: 'raintankEvents',
                type: 'elasticsearch',
                url: 'https://tsdb-gw.raintank.io/elasticsearch/',
                access: 'proxy',
                basicAuth: true,
                basicAuthPassword: "",
                basicAuthUser: "",
                database: '[events-]YYYY-MM-DD',
                jsonData: {
                  esVersion: 2,
                  interval: "Daily",
                  timeField: "timestamp"
                }
              };

              if (!datasources.elastic) {
                // create datasource.
                promise = promise.then(function () {
                  return self.getKey().then(function (apiKey) {
                    elastic.basicAuthUser = "api_key";
                    elastic.basicAuthPassword = apiKey;
                    return self.backendSrv.post('/api/datasources', elastic);
                  });
                });
              } else if (!_.isMatch(datasources.elastic, elastic)) {
                // update datasource if necessary
                promise = promise.then(function () {
                  return self.getKey().then(function (apiKey) {
                    elastic.basicAuthUser = "api_key";
                    elastic.basicAuthPassword = apiKey;
                    return self.backendSrv.put('/api/datasources/' + datasources.elastic.id, _.merge({}, datasources.elastic, elastic));
                  });
                });
              }

              return promise;
            }).then(function (result) {
              self.upgraded = true;

              return _this.backendSrv.get('/api/frontend/settings').then(function (settings) {
                // update datasource config
                var datasourceConfig = _this.datasourceSrv.getAll();
                datasourceConfig.raintank = settings.datasources.raintank;
                datasourceConfig.raintankEvents = settings.datasources.raintankEvents;
                _this.datasourceSrv.init();

                return result;
              });
            });
          }
        }]);

        return DatasourceUpgrader;
      }();

      _export("default", DatasourceUpgrader);
    }
  };
});
//# sourceMappingURL=dsUpgrade.js.map
