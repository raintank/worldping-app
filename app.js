define([
  'angular',
  'app/app',
  './module',
  './pages/all',
  './directives/all',
  './filters/all',
], function(angular, app, module)  {

  app.useModule(module);

  module.config(function($routeProvider) {
    $routeProvider
      .when('/worldping/probes', {
        templateUrl: 'public/plugins/worldping/pages/probe/partials/collectors.html',
        controller : 'CollectorCtrl',
      })
      .when('/worldping/probes/summary/:id', {
        templateUrl: 'public/plugins/worldping/pages/probe/partials/collectors_summary.html',
        controller : 'CollectorConfCtrl',
      })
      .when('/worldping/probes/init/:id', {
        templateUrl: 'public/plugins/worldping/pages/probe/partials/collectors_new.html',
        controller : 'CollectorConfCtrl',
      })
      .when('/worldping/probes/new', {
        templateUrl: 'public/plugins/worldping/pages/probe/partials/collectors_new.html',
        controller : 'CollectorConfCtrl',
      })
      .when('/worldping/endpoints', {
        templateUrl: 'public/plugins/worldping/pages/endpoint/partials/endpoints.html',
        controller : 'EndpointsCtrl',
      })
      .when('/worldping/endpoints/new', {
        templateUrl: 'public/plugins/worldping/pages/endpoint/partials/endpoints_new.html',
        controller : 'EndpointConfCtrl',
      })
      .when('/worldping/endpoints/summary/:id', {
        templateUrl: 'public/plugins/worldping/pages/endpoint/partials/endpoints_summary.html',
        controller : 'EndpointSummaryCtrl',
      })
      .when('/worldping/endpoints/edit/:id', {
        templateUrl: 'public/plugins/worldping/pages/endpoint/partials/endpoints_edit.html',
        controller : 'EndpointConfCtrl',
      })
      .when('/worldping/endpoints/new_endpoint', {
        templateUrl: 'public/plugins/worldping/pages/endpoint/partials/endpoints_new.html',
        controller : 'EndpointConfCtrl',
      });
  });

  function WorldPingConfigCtrl($scope, $injector, $q, backendSrv) {
    var parentUpdate = this.appEditCtrl.update;
    if (this.appModel.jsonData === null) {
      this.appModel.jsonData = {};
    }

    this.appEditCtrl.update = function(options) {
      var self = this;
      var promises = [];
      //if the apiKey is being set, check and make sure that we have initialized our datasource and dashboards.
      if (this.appModel.secureJsonData && this.appModel.secureJsonData.apiKey) {
        this.appModel.jsonData.apiKeySet = true;
        if (!this.appModel.jsonData.datasourceSet) {
          promises.push($scope.initDatasource().then(function() {
            self.appModel.jsonData.datasourceSet = true;
          }));
        }
        if (!this.appModel.jsonData.dashboardsLoaded) {
          promises.push($scope.fetchDashboards().then(function() {
            self.appModel.jsonData.dashboardsLoaded = true;
          }));
        }
      }
      $q.all(promises).then(function() {
        parentUpdate.call(self, options);
      });
    };

    $scope.configureDatasource = function() {
      console.log($scope);
      $scope.ctrl.appModel.jsonData.datasourceSet = false;
      $scope.initDatasource().then(function() {
        $scope.ctrl.appModel.jsonData.datasourceSet = true;
        console.log("datasource initialized");
      });
    };

    $scope.initDatasource = function() {
      //check for existing datasource.
      return backendSrv.get('/api/datasources').then(function(results) {
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
            url: 'api/plugin-proxy/worldping/api/graphite',
            access: 'direct',
            jsonData: {}
          };
          return backendSrv.post('/api/datasources', rt);
        }
      });
    };

    $scope.importDashboards = function() {
      $scope.ctrl.appModel.jsonData.dashboardsLoaded = false;
      $scope.fetchDashboards().then(function() {
        $scope.ctrl.appModel.jsonData.dashboardsLoaded = true;
      });
    };

    $scope.fetchDashboards = function() {
      var dashboards = [
        "rt-endpoint-web",
        "rt-endpoint-ping",
        "rt-endpoint-dns",
        "rt-endpoint-summary",
        "rt-endpoint-comparison",
        "rt-collector-summary"
      ];
      var chain = $q.when();
      _.forEach(dashboards, function(dash) {
        chain = chain.then(function() {
          return backendSrv.get("public/plugins/worldping/dashboards/litmus/"+dash+".json").then(function(loadedDash) {
            return backendSrv.saveDashboard(loadedDash, {overwrite: true});
          });
        });
      });
      return chain
    };
  }

  WorldPingConfigCtrl.templateUrl = 'public/plugins/worldping/partials/config.html';

  return {
    ConfigCtrl: WorldPingConfigCtrl
  };

});
