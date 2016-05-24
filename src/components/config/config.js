import configTemplate from './config.html!text';

import _ from 'lodash' ;

class WorldPingConfigCtrl {
  constructor($scope, $injector, backendSrv) {
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

  validateKey() {
    var self = this;
    var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/org/quotas');
    p.then((quotas) => {
      self.validKey = true;
      self.quotas = quotas;
    }, () => {
      if (self.appModel.enabled) {
        self.appModel.jsonData.apiKeySet = false;
        self.appModel.secureJsonData.apiKey = "";
        self.errorMsg = "invlid apiKey";
      }
    });
    return p;
  }

  preUpdate() {
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
        p.then(() => {
          model.jsonData.datasourceSet = true;
        });
        return p;
      }
    }

    return Promise.resolve();
  }

  postUpdate() {
    if (!this.appModel.enabled) {
      return Promise.resolve();
    }
    var self = this;
    return this.validateKey()
    .then(() => {
      return self.appEditCtrl.importDashboards().then(() => {
        return {
          url: "dashboard/db/worldping-home",
          message: "worldPing app installed!"
        };
      });
    });
  }

  configureDatasource() {
    this.appModel.jsonData.datasourceSet = false;
    this.initDatasource().then(() => {
      this.appModel.jsonData.datasourceSet = true;
    });
  }

  initDatasource() {
    var self = this;
    //check for existing datasource.
    var p = self.backendSrv.get('/api/datasources');
    p.then(function(results) {
      var foundGraphite = false;
      var foundElastic = false;
      _.forEach(results, function(ds) {
        if (foundGraphite && foundElastic) { return; }
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
}

WorldPingConfigCtrl.template = configTemplate;

export {
  WorldPingConfigCtrl as ConfigCtrl
};
