import _ from 'lodash';

class EndpointDetailsCtrl {
  /** @ngInject */
  constructor($scope, $injector, $location, backendSrv) {
    var self = this;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.pageReady = false;

    this.endpoint = {};
    this.refreshTime = new Date();
    this.getEndpoint($location.search().endpoint);
  }

  getEndpoint(id) {
    var self = this;
    var promise = this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints/'+id);
    promise.then(function(endpoint) {
      self.endpoint = endpoint;
    });
    return promise;
  }

  tagsUpdated() {
    this.backendSrv.post("api/plugin-proxy/worldping-app/api/endpoints", $scope.endpoint);
  }

  orderChecks(check) {
    var order = {
      dns: 1,
      ping: 2,
      http: 3,
      https: 4
    };
    return order[check.type];
  }

  //TODO: move to directive.
  monitorStateTxt(mon) {
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
    switch(type.toLowerCase()) {
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
      "var-monitor_type": type.toLowerCase()
    });
  }

  getNotificationEmails(mon) {
    if (!mon || mon.healthSettings.notifications.addresses === "") {
      return [];
    }
    var addresses = mon.healthSettings.notifications.addresses.split(',');
    var list = [];
    addresses.forEach(function(addr) {
      list.push(addr.trim());
    });
    return list;
  }

  getNotificationEmailsAsString(check) {
    var emails = this.getNotificationEmails(check);
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
    this.getEndpoint(this.endpoint.id);
    this.refreshTime = new Date();
  }
}
EndpointDetailsCtrl.templateUrl = 'public/plugins/worldping-app/components/endpoint/partials/endpoint_details.html';

export {EndpointDetailsCtrl}