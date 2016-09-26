import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

class CallToActionCtrl extends PanelCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $q, backendSrv, alertSrv) {
    super($scope, $injector);
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$location = $location;
    this.$q = $q;

    this.quotas = null;
    this.endpointStatus = "scopeEndpoints";
    this.collectorStatus = "scopeCollectors";
    this.requiresUpgrade = null;
    this.aboveFreeTier = null;

    this.getOrgDetails();
  }

  setEndpointStatus() {
    if (! this.quotas) {
      return;
    }
    if (this.quotas.endpoint.used === 0) {
      this.endpointStatus = "noEndpoints";
      return;
    }
    if (this.quotas.endpoint.used >= 1) {
      this.endpointStatus = "hasEndpoints";
      return;
    }
    //default.
    this.endpointStatus = "hasEndpoints";
    return;
  }

  setCollectorStatus() {
    if (! this.quotas) {
      return;
    }
    if (this.quotas.probe.used === 0) {
      this.collectorStatus = "noCollectors";
      return;
    }
    if (this.quotas.probe.used >= 1) {
      this.collectorStatus = "hasCollectors";
      return;
    }
    //default.
    this.collectorStatus = "hasCollectors";
    return;
  }

  getOrgDetails() {
    var self = this;
    var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org');
    p.then((resp) => {
      self.org = resp;
      self.requiresUpgrade = self._requiresUpgrade();
      self.aboveFreeTier = self._aboveFreeTier();
    }, (resp) => {
      self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
    });
    return p;
  }

  _requiresUpgrade() {
    if (!this.org) {
      return true;
    }

    if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free') {
      return false;
    }

    return true;
  }

  _aboveFreeTier() {
    if (!this.org) {
      return false;
    }

    if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free') {
      return false;
    }

    if (this.org.checksPerMonth / 1000000 > 3) {
      return true;
    }

    return false;
  }

  allDone() {
    if (! this.quotas) {
      return false;
    }
    if (this.quotas.probe.used === 0) {
      return false;
    }
    if (this.quotas.endpoint.used === 0) {
      return false;
    }
    //default.
    return true;
  }

  refresh() {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then(function(resp) {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get quotas.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      var quotaHash = {};
      _.forEach(resp.body, function(q) {
        quotaHash[q.target] = q;
      });
      self.quotas = quotaHash;
      self.setEndpointStatus();
      self.setCollectorStatus();
    });
  }
}

CallToActionCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/call-to-action/module.html';

export {
  CallToActionCtrl as PanelCtrl
};
