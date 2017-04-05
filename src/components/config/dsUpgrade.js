import _ from 'lodash' ;

export default class DatasourceUpgrader {
  constructor(contextSrv, backendSrv, $q, datasourceSrv) {
    this.backendSrv = backendSrv;
    this.contextSrv = contextSrv;
    this.datasourceSrv = datasourceSrv;
    this.$q = $q;
    this.apiKey = "";
    this.keyRequest = null;
    this.upgradeed = false;
  }

  needsUpgrade() {
    if (this.upgraded) {
      console.log('datasources upgraded');
      return false;
    }

    if (!this.datasourceSrv) {
      console.log('no datasource srv');
      return false;
    }

    var datasources = this.datasourceSrv.getAll();

    if (!datasources.raintank || !/^\/api\/datasources\/proxy/.exec(datasources.raintank.url)) {
      console.log('raintank needs upgrade');
      return true;
    }

    if (!datasources.raintankEvents || !/^\/api\/datasources\/proxy/.exec(datasources.raintankEvents.url)) {
      console.log('raintankEvents needs upgrade');
      return true;
    }

    console.log('datasources up to date');
    return false;
  }

  canUpgrade() {
    // only admins can modify datasources.
    return this.contextSrv.hasRole("Admin");
  }

  upgrade() {
    if (this.needsUpgrade() && this.canUpgrade()) {
      return this.configureDatasource();
    } else {
      return this.$q.when();
    }
  }

  getKey() {
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
    this.keyRequest = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/_key')
    .then((resp) => {
      if (resp.meta.code !== 200) {
        return self.$q.reject("failed to get current apiKey");
      }
      return resp.body.apiKey;
    });
    return this.keyRequest;
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
    return this.getDatasources().then((datasources) => {
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

      return self.$q.all(promises).then(result => {self.upgraded = true; return result});
    });
  }
}