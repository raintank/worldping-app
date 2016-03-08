import configTemplate from './config.html!text';

class WorldPingConfigCtrl {
  constructor($scope, $injector, backendSrv) {
    this.backendSrv = backendSrv;
    var self = this;
    this.appEditCtrl.setPreUpdateHook(this.preUpdate())

    if (this.appModel.jsonData === null) {
      this.appModel.jsonData = {};
    }
  }

  preUpdate() {
    var self = this;
    return function() {
      var promises = [];
      //if the apiKey is being set, check and make sure that we have initialized our datasource and dashboards.
      if (self.appModel.secureJsonData && self.appModel.secureJsonData.apiKey) {
        self.appModel.jsonData.apiKeySet = true;
        if (!self.appModel.jsonData.datasourceSet) {
          promises.push(self.initDatasource().then(function() {
            self.appModel.jsonData.datasourceSet = true;
          }));
        }
        if (!self.appModel.jsonData.dashboardsLoaded) {
          promises.push(self.fetchDashboards().then(function() {
            self.appModel.jsonData.dashboardsLoaded = true;
          }));
        }
      }
      return Promise.all(promises)
    }
  }
  
  configureDatasource() {
    var self = this;
    this.ctrl.appModel.jsonData.datasourceSet = false;
    this.initDatasource().then(function() {
      self.ctrl.appModel.jsonData.datasourceSet = true;
      console.log("datasource initialized");
    });
  }

  initDatasource() {
    var self = this;
    //check for existing datasource.
    return self.backendSrv.get('/api/datasources').then(function(results) {
      var found = false;
      _.forEach(results, function(ds) {
        if (found) { return; }
        if (ds.name === "raintank") {
          found = true;
        }
      });
      if (!found) {
        // create datasource.
        var rt = {
          name: 'raintank',
          type: 'graphite',
          url: 'api/plugin-proxy/worldping-app/api/graphite',
          access: 'direct',
          jsonData: {}
        };
        return self.backendSrv.post('/api/datasources', rt);
      }
    });
  }

  importDashboards() {
    var self = this;
    this.appModel.jsonData.dashboardsLoaded = false;
    this.fetchDashboards().then(function() {
      self.appModel.jsonData.dashboardsLoaded = true;
    });
  }

  fetchDashboards() {
    var self = this;
    var dashboards = [
      "rt-endpoint-web",
      "rt-endpoint-ping",
      "rt-endpoint-dns",
      "rt-endpoint-summary",
      "rt-endpoint-comparison",
      "rt-collector-summary"
    ];
    var chain = Promise.resolve();
    _.forEach(dashboards, function(dash) {
      chain = chain.then(function() {
        return self.backendSrv.get("public/plugins/worldping-app/dashboards/litmus/"+dash+".json").then(function(loadedDash) {
          return self.backendSrv.saveDashboard(loadedDash, {overwrite: true});
        });
      });
    });
    return chain
  }
}

WorldPingConfigCtrl.template = configTemplate;

export {
  WorldPingConfigCtrl as ConfigCtrl
};
