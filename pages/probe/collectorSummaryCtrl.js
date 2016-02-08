define([
  'lodash',
  '../../module'
],
function (_, module) {
  'use strict';

  module.controller('CollectorSummaryCtrl', function($scope, $http, backendSrv, $location, $routeParams) {
    $scope.init = function() {
      $scope.collectors = [];
      $scope.monitors = {};
      $scope.collector = null;
      var promise = $scope.getCollectors();
      promise.then(function() {
        $scope.getCollector($routeParams.id);
      });
    };

    $scope.getCollectors = function() {
      var promise = backendSrv.get('api/plugin-proxy/worldping/api/collectors');
      promise.then(function(collectors) {
        $scope.collectors = collectors;
      });
      return promise;
    };

    $scope.tagsUpdated = function() {
      backendSrv.post("api/plugin-proxy/worldping/api/collectors", $scope.collector);
    };

    $scope.getCollector = function(id) {
      _.forEach($scope.collectors, function(collector) {
        if (collector.id === parseInt(id)) {
          $scope.collector = collector;
          //get monitors for this collector.
          backendSrv.get('api/plugin-proxy/worldping/api/monitors?collector_id='+id).then(function(monitors) {
            _.forEach(monitors, function(monitor) {
              $scope.monitors[monitor.monitor_type_id] = monitor;
            });
          });
        }
      });
    };

    $scope.setEnabled = function(newState) {
      $scope.collector.enabled = newState;
      backendSrv.post('api/plugin-proxy/worldping/api/collectors', $scope.collector);
    };

    $scope.setCollector = function(id) {
      $location.path('worldping/probes/summary/'+id);
    };

    $scope.gotoDashboard = function(collector) {
      $location.path("/dashboard/file/rt-collector-summary.json").search({"var-collector": collector.slug, "var-endpoint": "All"});
    };

    $scope.init();
  });
});
