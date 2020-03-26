import angular from 'angular';
import _ from 'lodash';
import { promiseToDigest } from '../../utils/promiseToDigest';

var defaults = {
  name: '',
  enabled: true,
};

class ProbeCreateCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $window, $q, backendSrv, alertSrv) {
    var self = this;
    this.$window = $window;
    this.$q = $q;
    this.$scope = $scope;
    this.alertSrv = alertSrv;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.newProbe = false;
    this.installMethod = {
      deb: false,
      rpm: false,
      docker: false,
      manual: false,
    };
    this.probe = angular.copy(defaults);
    this.org = null;
    this.requiresUpgrade = null;

    if ("probe" in $location.search()) {
      self.getProbe($location.search().probe);
    } else {
      self.reset();
    }

    self.getOrgDetails();
  }

  setInstallMethod(newMethod) {
    var self = this;
    _.forEach(this.installMethod, function(enabled, method) {
      if (method === newMethod) {
        self.installMethod[method] = true;
      } else {
        self.installMethod[method] = false;
      }
    });
    console.log(this.installMethod);
  }

  getProbe(id) {
    var self = this;
    return promiseToDigest(this.$scope)
      (this.backendSrv.get("api/plugin-proxy/raintank-worldping-app/api/v2/probes/"+id).then((resp) => {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }
        self.probe = resp.body;
      })
    );
  }

  getOrgDetails() {
    var self = this;
    var p = promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org'));
    p.then((resp) => {
      self.org = resp;
      self.requiresUpgrade = self._requiresUpgrade();
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

  reset() {
    this.probe = angular.copy(defaults);
  }

  cancel() {
    this.reset();
    this.ignoreChanges = true;
    this.$window.history.back();
  }

  save() {
    var self = this;
    return promiseToDigest(this.$scope)
      (this.backendSrv.put("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then((resp) => {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to save probe.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }
      })
    );
  }

  add() {
    var self = this;
    return promiseToDigest(this.$scope)
      (this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then((resp) => {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to add probe.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }
        self.newCollector = true;
        self.probe = resp.body;
      })
    );
  }

  configInfo() {
    this.showConfigInfo = true;
  }

  defaultDistro() {
    this.showDistroConfig = false;
  }

  otherDistro() {
    this.showDistroConfig = true;
  }
}

ProbeCreateCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_create.html';
export {
  ProbeCreateCtrl
};
