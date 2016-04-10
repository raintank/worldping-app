import _ from 'lodash';
import '../../filters/all';
import '../../directives/all';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

class EndpointNavCtrl extends PanelCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, backendSrv, templateSrv) {
    super($scope, $injector);
    this.$location = $location;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;

    $scope.ctrl.panel.title = "";
    $scope.ctrl.panel.transparent = true;

    this.pageReady = false;
    this.statuses = [
      {label: "Ok", value: 0},
      {label: "Warning", value: 1},
      {label: "Error", value: 2},
      {label: "Unknown", value: -1},
    ];
    this.endpoints = [];
    this.endpointState = {
      "0": 0,
      "1": 0,
      "2": 0,
      "-1": 0,
    };
  }

  getEndpointSlugs() {
    var values = null;
    _.forEach(this.templateSrv.variables, function(tmplVar) {
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

  refresh() {
    var endpointSlugs = this.getEndpointSlugs();
    this.getEndpoints(endpointSlugs);
  }

  isEndPointReady(endpoint) {
    return endpoint && endpoint.hasOwnProperty('ready') &&  endpoint.ready;
  }

  getEndpoints(endpointSlugs) {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/endpoints').then(function(endpoints) {
      self.pageReady = true;
      self.endpoints = [];
      _.forEach(endpoints, function(endpoint) {
        if (_.indexOf(endpointSlugs, endpoint.slug) >= 0) {
          self.endpoints.push(endpoint);
          endpoint.states = [];
          endpoint.monitors = {};
          endpoint.ready = false;

          self.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/monitors', {"endpoint_id": endpoint.id})
            .then(function(monitors) {
            var seenStates = {};
            _.forEach(monitors, function(mon) {
              if (!mon.enabled) {
                return;
              }
              seenStates[mon.state] = true;
              endpoint.monitors[mon.monitor_type_name.toLowerCase()] = mon;
            });
            for (var s in seenStates) {
              self.endpointState[s]++;
              endpoint.states.push(parseInt(s));
            }
            endpoint.ready = true;
          });
        }
      });
    });
  }

  monitorStateTxt(endpoint, type) {
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
  }

  monitorStateChangeStr(endpoint, type) {
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
  }

  gotoDashboard(endpoint, type) {
    if (!type) {
      type = 'summary';
    }
    var search = {
      "var-collector": "All",
      "var-endpoint": endpoint.slug
    };
    switch(type) {
      case "summary":
        this.$location.path("/dashboard/db/worldping-endpoint-summary").search(search);
        break;
      case "ping":
        this.$location.path("/dashboard/db/worldping-endpoint-ping").search(search);
        break;
      case "dns":
        this.$location.path("/dashboard/db/worldping-endpoint-dns").search(search);
        break;
      case "http":
        search['var-protocol'] = "http";
        this.$location.path("/dashboard/db/worldping-endpoint-web").search(search);
        break;
      case "https":
        search['var-protocol'] = "https";
        this.$location.path("/dashboard/db/worldping-endpoint-web").search(search);
        break;
      default:
        this.$location.path("/dashboard/db/worldping-endpoint-summary").search(search);
        break;
    }
  }

  gotoEndpointURL(endpoint) {
    this.$location.path('plugins/raintank-worldping-app/page/endpoint-details?endpoint='+ endpoint.id);
  }
}

EndpointNavCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/nav-panel/module.html';
export {
  EndpointNavCtrl as PanelCtrl
};
