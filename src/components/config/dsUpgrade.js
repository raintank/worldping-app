import _ from 'lodash' ;

export default class DatasourceUpgrader {
  constructor(backendSrv, alertSrv, $q) {
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$q = $q;
  }

  upgrade() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/_key')
    .then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get current apiKey", resp.message, 'error', 10000);
        return self.$q.reject(resp.message);
      }
      return self.configureDatasource(resp.body.apiKey);
    });
  }

  getDatasources() {
    var self = this;
    //check for existing datasource.
    return self.backendSrv.get('/api/datasources')
    .then((results) => {
      var datasources = {
        graphite: null,
        elastic: null
      };
      _.forEach(results, function(ds) {
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

  configureDatasource() {
    var self = this;
    //check for existing datasource.
    return this.getDatasources().then(function(datasources) {
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
}