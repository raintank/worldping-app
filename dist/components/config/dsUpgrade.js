'use strict';

System.register(['lodash'], function (_export, _context) {
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
        function DatasourceUpgrader(backendSrv, alertSrv, $q) {
          _classCallCheck(this, DatasourceUpgrader);

          this.backendSrv = backendSrv;
          this.alertSrv = alertSrv;
          this.$q = $q;
        }

        _createClass(DatasourceUpgrader, [{
          key: 'upgrade',
          value: function upgrade() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/_key').then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get current apiKey", resp.message, 'error', 10000);
                return self.$q.reject(resp.message);
              }
              return self.configureDatasource(resp.body.apiKey);
            });
          }
        }, {
          key: 'getDatasources',
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
          key: 'configureDatasource',
          value: function configureDatasource() {
            var self = this;
            //check for existing datasource.
            return this.getDatasources().then(function (datasources) {
              var promises = [];
              var graphite = {
                name: 'raintank',
                type: 'graphite',
                url: 'https://tsdb-gw.raintank.io/graphite/',
                access: 'proxy',
                basicAuth: true,
                basicAuthPassword: self.apiKey,
                basicAuthUser: "api_key",
                jsonData: {}
              };
              if (!datasources.graphite) {
                // create datasource.
                promises.push(self.backendSrv.post('/api/datasources', graphite));
              } else if (!_.isMatch(datasources.graphite, graphite)) {
                // update datasource if necessary
                promises.push(self.backendSrv.put('/api/datasources/' + datasources.graphite.id, _.merge({}, datasources.graphite, graphite)));
              }

              var elastic = {
                name: 'raintankEvents',
                type: 'elasticsearch',
                url: 'https://tsdb-gw.raintank.io/elasticsearch/',
                access: 'proxy',
                basicAuth: true,
                basicAuthPassword: self.apiKey,
                basicAuthUser: "api_key",
                database: '[events-]YYYY-MM-DD',
                jsonData: {
                  esVersion: 2,
                  interval: "Daily",
                  timeField: "timestamp"
                }
              };

              if (!datasources.elastic) {
                // create datasource.
                promises.push(self.backendSrv.post('/api/datasources', elastic));
              } else if (!_.isMatch(datasources.elastic, elastic)) {
                // update datasource if necessary
                promises.push(self.backendSrv.put('/api/datasources/' + datasources.elastic.id, _.merge({}, datasources.elastic, elastic)));
              }

              return self.$q.all(promises);
            });
          }
        }]);

        return DatasourceUpgrader;
      }();

      _export('default', DatasourceUpgrader);
    }
  };
});
//# sourceMappingURL=dsUpgrade.js.map
