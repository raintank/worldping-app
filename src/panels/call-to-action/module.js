import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';
import DatasourceUpgrader from '../../components/config/dsUpgrade';
import { promiseToDigest } from '../../utils/promiseToDigest';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

class CallToActionCtrl extends PanelCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $q, backendSrv, alertSrv, contextSrv, datasourceSrv) {
    super($scope, $injector);
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$location = $location;
    this.$q = $q;
    this.datasourceSrv = datasourceSrv;

    this.quotas = null;
    this.endpointStatus = "scopeEndpoints";
    this.collectorStatus = "scopeCollectors";
    this.requiresUpgrade = null;
    this.currentlyTrial = null;
    this.aboveFreeTier = null;

    this.getOrgDetails();
    this.datasourceUpgrader = new DatasourceUpgrader(contextSrv, backendSrv, $q, datasourceSrv);
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
    var p = promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org'));
    p.then((resp) => {
      self.org = resp;

      const millionChecksPerMonth = Math.ceil(parseInt(self.org.checksPerMonth, 10) / 100000) / 10;
      if (millionChecksPerMonth > 1000) {
        self.org.strChecksPerMonth = 'using ' + Math.ceil(millionChecksPerMonth / 1000) + ' Billion checks/mo';
      } else if (millionChecksPerMonth > 0) {
        self.org.strChecksPerMonth = 'using ' + millionChecksPerMonth + ' Million checks/mo';
      } else {
        self.org.strChecksPerMonth = 'not using any checks yet';
      }

      self.requiresUpgrade = self._requiresUpgrade();
      self.currentlyTrial = self._currentlyTrial();
      self.aboveFreeTier = self._aboveFreeTier();
    }, (resp) => {
      self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
    });
    return p;
  }

  _currentlyTrial() {
    if (!this.org) {
      return false;
    }

    if (this.org.wpPlan === 'trial') {
      return true;
    }

    return false;
  }

  _requiresUpgrade() {
    if (!this.org) {
      return true;
    }

    if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free' && this.org.wpPlan !== 'trial') {
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

    if (this.org.checksPerMonth / 1000000 > 1) {
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
    return promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then(function(resp) {
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
    }));
  }
}

CallToActionCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/call-to-action/module.html';

export {
  CallToActionCtrl as PanelCtrl
};
