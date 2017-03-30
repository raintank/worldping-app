import _ from 'lodash' ;

export default class DatasourceUpgrader {
  constructor(backendSrv, $q) {
    this.backendSrv = backendSrv;
    this.$q = $q;
    this.apiKey = "";
  }

  upgrade() {
    return this.configureDatasource();
  }

  getKey() {
    if (this.apiKey !== "") {
      return this.$q.resolove(this.apiKey);
    }
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/_key')
    .then((resp) => {
      if (resp.meta.code !== 200) {
        return self.$q.reject("failed to get current apiKey");
      }
      return resp.body.apiKey;
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
        basicAuthPassword: "",
        basicAuthUser: "",
        jsonData: {}
      };
      if (!datasources.graphite) {
        // create datasource.
        promises.push(self.getKey().then((apiKey) => {
          graphite.basicAuthUser = "api_key";
          graphite.basicAuthPassword = apiKey;
          return self.backendSrv.post('/api/datasources', graphite);
        }));
      } else if (!_.isMatch(datasources.graphite, graphite)) {
        // update datasource if necessary
        promises.push(self.getKey().then((apiKey) => {
          graphite.basicAuthUser = "api_key";
          graphite.basicAuthPassword = apiKey;
          return self.backendSrv.put('/api/datasources/' + datasources.graphite.id, _.merge({}, datasources.graphite, graphite));
        }));
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
        promises.push(self.getKey().then((apiKey) => {
          elastic.basicAuthUser = "api_key";
          elastic.basicAuthPassword = apiKey;
          return self.backendSrv.post('/api/datasources', elastic);
        }));
      } else if (!_.isMatch(datasources.elastic, elastic)) {
        // update datasource if necessary
        promises.push(self.getKey().then((apiKey) => {
          elastic.basicAuthUser = "api_key";
          elastic.basicAuthPassword = apiKey;
          return self.backendSrv.put('/api/datasources/' + datasources.elastic.id, _.merge({}, datasources.elastic, elastic));
        }));
      }

      return self.$q.all(promises);
    });
  }
}