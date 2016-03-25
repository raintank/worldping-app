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
      var foundGraphite = false;
      var foundElastic = false
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
}

WorldPingConfigCtrl.template = configTemplate;

export {
  WorldPingConfigCtrl as ConfigCtrl
};
