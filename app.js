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

  function WorldPingConfigCtrl($scope, $injector) {
    //$scope.appModel.secureJsonData = {};
    console.log($scope);
  }
  WorldPingConfigCtrl.templateUrl = 'public/plugins/worldping/partials/config.html';

  return {
    ConfigCtrl: WorldPingConfigCtrl
  };

});
