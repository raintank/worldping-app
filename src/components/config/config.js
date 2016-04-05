import configTemplate from './config.html!text';

import _ from 'lodash' ;

class WorldPingConfigCtrl {
  constructor($scope, $injector, backendSrv) {
    this.backendSrv = backendSrv;

    this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));

    if (this.appModel.jsonData === null) {
      this.appModel.jsonData = {};
    }
  }

  preUpdate() {
    var model = this.appModel;

    // if the apiKey is being set, check and make sure that
    // we have initialized our datasource and dashboards.
    if (model.secureJsonData && model.secureJsonData.apiKey) {
      model.jsonData.apiKeySet = true;

      if (!model.jsonData.datasourceSet) {
        return this.initDatasource().then(() => {
          model.jsonData.datasourceSet = true;
        });
      }
    }

    return Promise.resolve();
  }

  postUpdate() {
    if (!this.appModel.enabled) {
      return Promise.resolve();
    }

    return this.appEditCtrl.importDashboards().then(() => {
      return {
        url: "dashboard/db/worldping-home",
        message: "worldPing app installed!"
      };
    });
  }

  configureDatasource() {
    this.appModel.jsonData.datasourceSet = false;
    this.initDatasource().then(() => {
      this.appModel.jsonData.datasourceSet = true;
      console.log("datasource initialized");
    });
  }

  initDatasource() {
    var self = this;
    //check for existing datasource.
    return self.backendSrv.get('/api/datasources').then(function(results) {
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
  }
}

WorldPingConfigCtrl.template = configTemplate;

export {
  WorldPingConfigCtrl as ConfigCtrl
};
