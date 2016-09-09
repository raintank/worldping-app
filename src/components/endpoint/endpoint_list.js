import _ from 'lodash';
import $ from 'jquery';

class EndpointListCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $q, backendSrv, contextSrv, alertSrv) {
    this.isOrgEditor = contextSrv.hasRole('Editor') || contextSrv.hasRole('Admin');
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$q = $q;
    this.$location = $location;
    this.pageReady = false;
    this.filter = {'tag': ''};
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
  }

  getEndpoints() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints').then(function(resp) {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get endpoint list.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.endpoints = resp.body;
      self.pageReady = true;
    });
  }

  monitorStateTxt(endpoint, type) {
    var check;
    _.forEach(endpoint.checks, function(c) {
      if (c.type.toLowerCase() === type.toLowerCase()) {
        check = c;
      }
    });
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
    var check;
    _.forEach(endpoint.checks, function(c) {
      if (c.type.toLowerCase() === type.toLowerCase()) {
        check = c;
      }
    });
    if (typeof(check) !== "object") {
      return "";
    }

    var duration = new Date().getTime() - new Date(check.stateChange).getTime();
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

  gotoDashboard(endpoint, evt) {
    var clickTargetIsLinkOrHasLinkParents = $(evt.target).closest('a').length > 0;
    if (clickTargetIsLinkOrHasLinkParents === false) {
      this.$location.path("/dashboard/db/worldping-endpoint-summary").search({"var-collector": "All", "var-endpoint": endpoint.slug});
    }
  }

  gotoEndpointURL(endpoint) {
    this.$location.url('plugins/raintank-worldping-app/page/endpoint-details?endpoint='+ endpoint.id);
  }
}

EndpointListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_list.html';
export {EndpointListCtrl};
