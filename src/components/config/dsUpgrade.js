import _ from 'lodash';
import { promiseToDigest } from '../../utils/promiseToDigest';

export default class DatasourceUpgrader {
  constructor(contextSrv, backendSrv, $q, datasourceSrv, $scope) {
    this.backendSrv = backendSrv;
    this.contextSrv = contextSrv;
    this.datasourceSrv = datasourceSrv;
    this.$q = $q;
    this.$scope = $scope;
    this.apiKey = "";
    this.keyRequest = null;
    this.upgraded = false;
  }

  needsUpgrade() {
    if (this.upgraded) {
      return false;
    }

    if (!this.datasourceSrv) {
      return false;
    }

    const datasources = this.datasourceSrv.getAll();

    const raintank = getDatasourceByName(datasources, 'raintank');

    if (!raintank || !/^\/api\/datasources\/proxy/.exec(raintank.url)) {
      return true;
    }

    const raintankEvents = getDatasourceByName(datasources, 'raintankEvents');

    if (!raintankEvents || !/^\/api\/datasources\/proxy/.exec(raintankEvents.url)) {
      return true;
    }

    return false;
  }

  canUpgrade() {
    // only admins can modify datasources.
    return this.contextSrv.hasRole("Admin");
  }

  upgrade() {
    if (this.canUpgrade()) {
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
    this.keyRequest = promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/_key')
    .then((resp) => {
      if (resp.meta.code !== 200) {
        return self.$q.reject("failed to get current apiKey");
      }
      return resp.body.apiKey;
    }));
    return this.keyRequest;
  }

  getDatasources() {
    var self = this;
    //check for existing datasource.
    return promiseToDigest(this.$scope)(
       self.backendSrv.get('/api/datasources')
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
      })
    );
  }

  configureDatasource() {
    var self = this;
    //check for existing datasource.
    return this.getDatasources().then((datasources) => {
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
        promise = promise.then(() => self.getKey().then((apiKey) => {
          graphite.basicAuthUser = "api_key";
          graphite.basicAuthPassword = apiKey;
          return promiseToDigest(this.$scope)(self.backendSrv.post('/api/datasources', graphite));
        }));
      } else if (!_.isMatch(datasources.graphite, graphite)) {
        // update datasource if necessary
        promise = promise.then(() => self.getKey().then((apiKey) => {
          graphite.basicAuthUser = "api_key";
          graphite.basicAuthPassword = apiKey;
          return promiseToDigest(this.$scope)
            (self.backendSrv.put('/api/datasources/' + datasources.graphite.id, _.merge({}, datasources.graphite, graphite)));
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
        promise = promise.then(() => self.getKey().then((apiKey) => {
          elastic.basicAuthUser = "api_key";
          elastic.basicAuthPassword = apiKey;
          return promiseToDigest(this.$scope)(self.backendSrv.post('/api/datasources', elastic));
        }));
      } else if (!_.isMatch(datasources.elastic, elastic)) {
        // update datasource if necessary
        promise = promise.then(() => self.getKey().then((apiKey) => {
          elastic.basicAuthUser = "api_key";
          elastic.basicAuthPassword = apiKey;
          return promiseToDigest(this.$scope)
            (self.backendSrv.put('/api/datasources/' + datasources.elastic.id, _.merge({}, datasources.elastic, elastic)));
        }));
      }

      return promise;
    }).then(result => {
      self.upgraded = true;

      return promiseToDigest(this.$scope)(this.backendSrv.get('/api/frontend/settings').then(settings => {
        // update datasource config
        var datasourceConfig = this.datasourceSrv.getAll();
        datasourceConfig.raintank = settings.datasources.raintank;
        datasourceConfig.raintankEvents = settings.datasources.raintankEvents;
        this.datasourceSrv.init();

        return result;
      }));
    });
  }
}

function getDatasourceByName(datasources, name) {
  if (_.isArray(datasources)) {
    return _.find(datasources, { name });
  } else {
    return datasources[name];
  }
}
