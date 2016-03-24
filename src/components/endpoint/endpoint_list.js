import _ from 'lodash';

class EndpointListCtrl {
  /** @ngInject */
  constructor($scope, $injector, $location, backendSrv) {
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
  }

  refresh() {
    this.getEndpoints();
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
  
  isEndPointReady(endpoint) {
    return endpoint && endpoint.hasOwnProperty('ready') &&  endpoint.ready;
  };

  getEndpoints() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints').then(function(endpoints) {
      self.endpoints = endpoints;
      self.pageReady = true;
    });
  }

  remove(endpoint) {
    var self = this;
    this.backendSrv.delete('api/plugin-proxy/worldping-app/api/endpoints/' + endpoint.id).then(function() {
      self.getEndpoints();
    });
  }

  getCheck(endpoint, type) {
    var c;
    _.forEach(endpoint.checks, function(check) {
      if (check.type === type) {
        c = check;
      }
    });
    return c;
  }

  monitorStateTxt(endpoint, type) {
    var check = getCheck(endpoint, type);
    if (typeof(check) !== "object") {
      return "disabled";
    }
    if (!check.enabled) {
      return "disabled";
    }
    if (check.state < 0 || check.state > 2) {
      return 'nodata';
    }
    var states = ["online", "warn", "critical"];
    return states[check.state];
  }

  monitorStateChangeStr(endpoint, type) {
    var check = getCheck(endpoint, type);
    if (typeof(check) !== "object") {
      return "";
    }
    var duration = new Date().getTime() - new Date(check.state_change).getTime();
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

export {EndpointListCtrl}