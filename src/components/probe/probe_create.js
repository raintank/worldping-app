import angular from 'angular';

var defaults = {
  name: '',
  enabled: true,
};

class ProbeCreateCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $q, backendSrv, alertSrv) {
    var self = this;
    this.$q = $q;
    this.alertSrv = alertSrv;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.newProbe = false;

    this.probe = angular.copy(defaults);

    if ("probe" in $location.search()) {
      self.getProbe($location.search().probe);
    } else {
      self.reset();
    }
  }

  getProbe(id) {
    var self = this;
    return this.backendSrv.get("api/plugin-proxy/raintank-worldping-app/api/v2/probes/"+id).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.probe = resp.body;
    });
  }

  reset() {
    this.probe = angular.copy(defaults);
  }

  save() {
    var self = this;
    return this.backendSrv.put("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to save probe.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
    });
  }

  add() {
    var self = this;
    return this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to add probe.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.newCollector = true;
      self.probe = resp.body;
    });
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

