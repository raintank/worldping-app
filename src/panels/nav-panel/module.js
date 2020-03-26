import _ from 'lodash';
import '../../filters/all';
import '../../directives/all';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';
import DatasourceUpgrader from '../../components/config/dsUpgrade';
import { promiseToDigest } from '../../utils/promiseToDigest';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

class EndpointNavCtrl extends PanelCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $q, backendSrv, templateSrv, alertSrv, contextSrv, datasourceSrv) {
    super($scope, $injector);
    this.$location = $location;
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.datasourceSrv = datasourceSrv;
    this.alertSrv = alertSrv;
    this.endpointSlugs = [];

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
    this.datasourceUpgrader = new DatasourceUpgrader(contextSrv, backendSrv, $q, datasourceSrv);
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
    this.endpointSlugs = values;
    return values;
  }

  refresh() {
    var endpointSlugs = this.getEndpointSlugs();
    this.getEndpoints(endpointSlugs);
  }

  getEndpoints(endpointSlugs) {
    var self = this;
    promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints').then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get endpoint list.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.endpoints = [];
      self.isGoogleDemo = endpointSlugs.length === 1 && endpointSlugs[0] === '~google_com_demo';
      _.forEach(resp.body, function(endpoint) {
        if (_.indexOf(endpointSlugs, endpoint.slug) >= 0) {
          self.endpoints.push(endpoint);
        }
      });
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
