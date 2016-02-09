define([
  'app/features/panel/panel_ctrl',
  "lodash"
], function(panel, _) {
  'use strict';

  function EndpointNavPanel($scope, $injector, $location, backendSrv, templateSrv) {
    panel.PanelCtrl.call(this, $scope, $injector);
    $scope.ctrl.panel.title = "";
    $scope.ctrl.panel.transparent = true;

    $scope.pageReady = false;
    $scope.statuses = [
      {label: "Ok", value: 0},
      {label: "Warning", value: 1},
      {label: "Error", value: 2},
      {label: "Unknown", value: -1},
    ];
    $scope.endpoints = [];
    $scope.endpointState = {
      "0": 0,
      "1": 0,
      "2": 0,
      "-1": 0,
    };

    this.getEndpointSlugs = function() {
      var values = null;
      _.forEach(templateSrv.variables, function(tmplVar) {
        if (tmplVar.name === 'endpoint') {
          values = tmplVar.current.value;
          if (!_.isArray(values)) {
            values = [values];
          }
          values;
        }
      });
      return values;
    }

    this.refresh = function() {
      var endpointSlugs = this.getEndpointSlugs();
      $scope.getEndpoints(endpointSlugs);
    };


    $scope.isEndPointReady = function(endpoint) {
      return endpoint && endpoint.hasOwnProperty('ready') &&  endpoint.ready;
    };

    $scope.getEndpoints = function(endpointSlugs) {
      backendSrv.get('api/plugin-proxy/worldping/api/endpoints').then(function(endpoints) {
        $scope.pageReady = true;
        $scope.endpoints = [];
        _.forEach(endpoints, function(endpoint) {
          if (_.indexOf(endpointSlugs, endpoint.slug) >= 0) {
            $scope.endpoints.push(endpoint);
            endpoint.states = [];
            endpoint.monitors = {};
            endpoint.ready = false;
            backendSrv.get('api/plugin-proxy/worldping/api/monitors', {"endpoint_id": endpoint.id}).then(function(monitors) {
              var seenStates = {};
              _.forEach(monitors, function(mon) {
                if (!mon.enabled) {
                  return;
                }
                seenStates[mon.state] = true;
                endpoint.monitors[mon.monitor_type_name.toLowerCase()] = mon;
              });
              for (var s in seenStates) {
                $scope.endpointState[s]++;
                endpoint.states.push(parseInt(s));
              }
              endpoint.ready = true;
            });
          }
        });
      });
    };
    
    $scope.monitorStateTxt = function(endpoint, type) {
      var mon = endpoint.monitors[type];
      if (typeof(mon) !== "object") {
        return "disabled";
      }
      if (!mon.enabled) {
        return "disabled";
      }
      if (mon.state < 0 || mon.state > 2) {
        return 'nodata';
      }
      var states = ["online", "warn", "critical"];
      return states[mon.state];
    };

    $scope.monitorStateChangeStr = function(endpoint, type) {
      var mon = endpoint.monitors[type];
      if (typeof(mon) !== "object") {
        return "";
      }
      var duration = new Date().getTime() - new Date(mon.state_change).getTime();
      if (duration < 10000) {
        return "for a few seconds ago";
      }
      if (duration < 60000) {
        var secs = Math.floor(duration/1000);
        return "for " + secs + " seconds";
      }
      if (duration < 3600000) {
        var mins = Math.floor(duration/1000/60);
        return "for " + mins + " minutes";
      }
      if (duration < 86400000) {
        var hours = Math.floor(duration/1000/60/60);
        return "for " + hours + " hours";
      }
      var days = Math.floor(duration/1000/60/60/24);
      return "for " + days + " days";
    };

    $scope.gotoDashboard = function(endpoint) {
      $location.path("/dashboard/file/rt-endpoint-summary.json").search({"var-collector": "All", "var-endpoint": endpoint.slug});
    };

    $scope.gotoEndpointURL = function (endpoint) {
      $location.path('worldping/endpoints/summary/'+ endpoint.id);
    };
  }

  EndpointNavPanel.templateUrl = 'public/plugins/worldpingendpointnav/module.html'
  EndpointNavPanel.prototype = Object.create(panel.PanelCtrl.prototype);
  EndpointNavPanel.prototype.constructor = EndpointNavPanel;

  return {
    PanelCtrl: EndpointNavPanel
  };
});
