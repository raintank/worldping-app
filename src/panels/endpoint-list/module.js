import '../../filters/all';
import '../../directives/all';
import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';
import { promiseToDigest } from '../../utils/promiseToDigest';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

class EndpointListCtrl extends PanelCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $q, backendSrv, contextSrv, alertSrv) {
    super($scope, $injector);
    this.isOrgEditor = contextSrv.hasRole('Editor') || contextSrv.hasRole('Admin');
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$location = $location;
    this.$q = $q;
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
    this.addEditorTab('Options', 'public/plugins/raintank-worldping-app/panels/endpoint-list/editor.html');
    this.editorTabIndex = 1;
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

  getEndpoints() {
    const self = this;
    promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints').then(function(resp) {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get endpoint list.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.endpoints = resp.body;
      self.pageReady = true;
    }));
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

  gotoDashboard(endpoint) {
    this.$location.path("/dashboard/db/worldping-endpoint-summary").search({"var-collector": "All", "var-endpoint": endpoint.slug});
  }

  gotoEndpointURL(endpoint) {
    this.$location.url('plugins/raintank-worldping-app/page/endpoint-details?endpoint='+ endpoint.id);
  }
}

EndpointListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_list.html';

export {
  EndpointListCtrl as PanelCtrl
};
