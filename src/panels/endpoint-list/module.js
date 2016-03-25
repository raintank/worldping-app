import '../../filters/all';
import '../../directives/all';
import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/worldping-app/css/worldping.dark.css',
  light: 'plugins/worldping-app/css/worldping.light.css'
});

class EndpointListCtrl extends PanelCtrl {
  /** @ngInject */
  constructor($scope, $injector, $location, backendSrv) {
    super($scope, $injector);
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.pageReady = false;
    this.statuses = [
      {label: "Ok", value: 0},
      {label: "Warning", value: 1},
      {label: "Error", value: 2},
      {label: "Unknown", value: -1},
    ];
    this.filter = {'tag': '', 'status': ''};
    this.sort_field = 'name';
    this.endpoints = [];
    this.refresh();
    this.endpointState = {
      "0": 0,
      "1": 0,
      "2": 0,
      "-1": 0,
    };
  }

  initEditMode() {
    super.initEditMode();
    this.icon = 'fa fa-text-width';
    this.addEditorTab('Options', 'public/plugins/worldping-app/panels/endpoint-list/editor.html');
    this.editorTabIndex = 1;
  }

  refresh() {
    this.getEndpoints();
    this.getMonitorTypes();
  }

   endpointTags() {
    var map = {};
    _.forEach(this.endpoints, function(endpoint) {
      _.forEach(endpoint.tags, function(tag) {
        map[tag] = true;
      });
    });
    return Object.keys(map);
  }

  setTagFilter(tag) {
    this.filter.tag = tag;
  };

  setStatusFilter(status) {
    if (status === this.filter.status) {
      status = "";
    }
    this.filter.status = status;
  }

  statusFilter(actual, expected) {
    if (expected === "" || expected === null) {
      return true;
    }
    var equal = (actual === expected);
    return equal;
  }

  getMonitorTypes() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/worldping-app/api/monitor_types').then(function(types) {
      var typesMap = {};
      _.forEach(types, function(type) {
        typesMap[type.id] = type;
      });
      self.monitor_types = typesMap;
    });
  }

  isEndPointReady(endpoint) {
    return endpoint && endpoint.hasOwnProperty('ready') &&  endpoint.ready;
  };

  getEndpoints() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints').then(function(endpoints) {
      self.pageReady = true;
      _.forEach(endpoints, function(endpoint) {
        endpoint.states = [];
        endpoint.monitors = {};
        endpoint.ready = false;
        self.backendSrv.get('api/plugin-proxy/worldping-app/api/monitors', {"endpoint_id": endpoint.id}).then(function(monitors) {
          var seenStates = {};
          _.forEach(monitors, function(mon) {
            if (!mon.enabled) {
              return;
            }
            seenStates[mon.state] = true;
            endpoint.monitors[self.monitor_types[mon.monitor_type_id].name.toLowerCase()] = mon;
          });
          for (var s in seenStates) {
            self.endpointState[s]++;
            endpoint.states.push(parseInt(s));
          }
          endpoint.ready = true;
        });
      });
      self.endpoints = endpoints;
    });
  }

  remove(endpoint) {
    var self = this;
    this.backendSrv.delete('api/plugin-proxy/worldping-app/api/endpoints/' + endpoint.id).then(function() {
      self.getEndpoints();
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

  gotoDashboard(endpoint) {
    this.$location.path("/dashboard/db/worldping-endpoint-summary").search({"var-collector": "All", "var-endpoint": endpoint.slug});
  }

  gotoEndpointURL(endpoint) {
    this.$location.url('plugins/worldping-app/page/endpoint-details?endpoint='+ endpoint.id);
  };
}
EndpointListCtrl.templateUrl = 'public/plugins/worldping-app/components/endpoint/partials/endpoint_list.html'


export {EndpointListCtrl as PanelCtrl}