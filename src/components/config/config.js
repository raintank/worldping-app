import configTemplate from './config.html!text';

import _ from 'lodash' ;

class WorldPingConfigCtrl {
  constructor($scope, $injector, $q, backendSrv, alertSrv) {
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.validKey = false;
    this.quotas = {};
    this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));
    this.org = null;

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

  reset() {
    this.appModel.jsonData.apiKeySet=false;
    this.validKey = false;
    this.org = null;
  }

  validateKey() {
    var self = this;
    var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas');
    p.then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get Quotas", resp.message, 'error', 10000);
        return self.$q.reject(resp.message);
      }
      self.validKey = true;
      self.quotas = resp.body;

      self.getOrgDetails();
    }, (resp) => {
      if (self.appModel.enabled) {
        self.alertSrv.set("failed to verify apiKey", resp.statusText, 'error', 10000);
        self.appModel.enabled = false;
        self.appModel.jsonData.apiKeySet = false;
        self.appModel.secureJsonData.apiKey = "";
        self.errorMsg = "invalid apiKey";
        self.validKey = false;
      }
    });
    return p;
  }

  getOrgDetails() {
    var self = this;
    var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org');
    p.then((resp) => {
      self.org = resp;

      const millionChecksPerMonth = Math.ceil(parseInt(self.org.checksPerMonth, 10) / 100000) / 10;
      if (millionChecksPerMonth > 1000) {
        self.org.strChecksPerMonth = Math.ceil(millionChecksPerMonth / 1000) + ' Billion';
      } else if (millionChecksPerMonth > 0) {
        self.org.strChecksPerMonth = millionChecksPerMonth + ' Million';
      } else {
        self.org.strChecksPerMonth = 'N/A';
      }
    }, (resp) => {
      self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
    });
    return p;
  }

  preUpdate() {
    var model = this.appModel;
    if (!model.enabled) {
      return this.$q.resolve();
    }

    if (!model.jsonData.apiKeySet && !model.secureJsonData.apiKey) {
      model.enabled = false;
      this.errorMsg = "apiKey not set";
      this.validKey = false;
      return this.$q.reject("apiKey not set.");
    }
    model.jsonData.apiKeySet = true;
    return this.initDatasource();
  }

  postUpdate() {
    if (!this.appModel.enabled) {
      return this.$q.resolve();
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
      return self.$q.all(promises);
    });
    return p;
  }
}

WorldPingConfigCtrl.template = configTemplate;

export {
  WorldPingConfigCtrl as ConfigCtrl
};
