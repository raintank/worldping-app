import _ from 'lodash';

class EndpointDetailsCtrl {
  /** @ngInject */
  constructor($scope, $injector, $location, backendSrv) {
    var self = this;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.pageReady = false;

    this.endpoints = [];
    this.monitors = {};
    this.monitor_types = {};
    this.monitor_types_by_name = {};
    this.endpoint = null;
    this.refreshTime = new Date();
    this.getMonitorTypes();
    var promise = this.getEndpoints();
    promise.then(function() {
      self.getEndpoint($location.search().endpoint);
    });
  }

  getEndpoints() {
    var self = this;
    var promise = this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints');
    promise.then(function(endpoints) {
      self.endpoints = endpoints;
    });
    return promise;
  }

  tagsUpdated() {
    this.backendSrv.post("api/plugin-proxy/worldping-app/api/endpoints", $scope.endpoint);
  }

  getMonitorTypes() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/worldping-app/api/monitor_types').then(function(types) {
      _.forEach(types, function(type) {
        self.monitor_types[type.id] = type;
        self.monitor_types_by_name[type.name] = type;
      });
    });
  }

  getEndpoint(id) {
    var self = this;
    _.forEach(this.endpoints, function(endpoint) {
      if (endpoint.id === parseInt(id)) {
        self.endpoint = endpoint;
        //get monitors for this endpoint.
        self.backendSrv.get('api/plugin-proxy/worldping-app/api/monitors?endpoint_id='+id).then(function(monitors) {
          _.forEach(monitors, function(monitor) {
            self.monitors[monitor.monitor_type_id] = monitor;
          });
          self.pageReady = true;
        });
      }
    });
  }

  getMonitorByTypeName(name) {
    if (name in this.monitor_types_by_name) {
      var type = this.monitor_types_by_name[name];
      return this.monitors[type.id];
    }
    return undefined;
  }

  //TODO: move to directive.
  monitorStateTxt(mon) {
    if (typeof(mon) !== "object") {
      return "disabled";
    }
    if (!mon.enabled) {
      return "disabled";
    }
    if (mon.state < 0 || mon.state > 2) {
      var sinceUpdate = new Date().getTime() - new Date(mon.updated).getTime();
      if (sinceUpdate < (mon.frequency * 5 * 1000)) {
        return 'pending';
      }
      return 'nodata';
    }
    var states = ["online", "warn", "critical"];
    return states[mon.state];
  }

  //TODO: move to directive.
  monitorStateClass(mon) {
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

  //TODO: move to directive.
  stateChangeStr(mon) {
    if (typeof(mon) !== "object") {
      return "";
    }
    var duration = new Date().getTime() - new Date(mon.state_change).getTime();
    if (duration < 10000) {
      return "a few seconds ago";
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

  setEndpoint(id) {
    this.$location.url('plugins/worldping-app/page/endpoint_details?endpoint='+id);
  }

  gotoDashboard(endpoint, type) {
    if (!type) {
      type = 'summary';
    }
    var search = {
      "var-collector": "All",
      "var-endpoint": this.endpoint.slug
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

  gotoEventDashboard(endpoint, type) {
    this.$location.path("/dashboard/db/worldping-events").search({
      "var-collector": "All",
      "var-endpoint": endpoint.slug,
      "var-monitor_type": type
    });
  }

  getNotificationEmails(checkType) {
    var mon = this.getMonitorByTypeName(checkType);
    if (!mon || mon.health_settings.notifications.addresses === "") {
      return [];
    }
    var addresses = mon.health_settings.notifications.addresses.split(',');
    var list = [];
    addresses.forEach(function(addr) {
      list.push(addr.trim());
    });
    return list;
  }

  getNotificationEmailsAsString(checkType) {
    var emails = this.getNotificationEmails(checkType);
    if (emails.length < 1) {
      return "No recipients specified";
    }
    var list = [];
    emails.forEach(function(email) {
      // if the email in the format `display name <email@address>`
      // then just show the display name.
      var res = email.match(/\"?(.+)\"?\s*<.*@.*>/);
      if (res && res.length === 2) {
        list.push(res[1]);
      } else {
        list.push(email);
      }
    });
    return list.join(", ");
  }

  refresh() {
    this.pageReady = false;
    this.getEndpoint(thiss.endpoint.id);
    this.refreshTime = new Date();
  }
}
EndpointDetailsCtrl.templateUrl = 'public/plugins/worldping-app/components/endpoint/partials/endpoint_details.html';

export {EndpointDetailsCtrl}