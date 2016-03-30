import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import {loadPluginCss} from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

class CallToActionCtrl extends PanelCtrl {
  /** @ngInject */
  constructor($scope, $injector, $location, backendSrv) {
    super($scope, $injector);
    this.backendSrv = backendSrv;
    this.$location = $location;

    this.quotas = null;
    this.endpointStatus = "scopeEndpoints";
    this.userStatus = "scopeUsers";
    this.collectorStatus = "scopeCollectors";
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

  setUserStatus() {
    if (! this.quotas) {
      return;
    }
    if (this.quotas.org_user.used <= 1) {
      this.userStatus = "noTeam";
      return;
    }
    if (this.quotas.org_user.used >= 2) {
      this.userStatus = "hasTeam";
      return;
    }
    //default.
    this.userStatus = "hasTeam";
    return;
  }

  setCollectorStatus() {
    if (! this.quotas) {
      return;
    }
    if (this.quotas.collector.used === 0) {
      this.collectorStatus = "noCollectors";
      return;
    }
    if (this.quotas.collector.used >= 1) {
      this.collectorStatus = "hasCollectors";
      return;
    }
    //default.
    this.collectorStatus = "hasCollectors";
    return;
  }

  allDone() {
    if (! this.quotas) {
      return false;
    }
    if (this.quotas.collector.used === 0) {
      return false;
    }
    if (this.quotas.org_user.used <= 1) {
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
    this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/org/quotas').then(function(quotas) {
      var quotaHash = {};
      _.forEach(quotas, function(q) {
        quotaHash[q.target] = q;
      });
      self.quotas = quotaHash;
      self.setEndpointStatus();
      self.setUserStatus();
      self.setCollectorStatus();
    });
  }
}

CallToActionCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/call-to-action/module.html'

export {CallToActionCtrl as PanelCtrl}
