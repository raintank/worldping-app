export class ProbeDetailsCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $timeout, $q, backendSrv, contextSrv, alertSrv) {
    var self = this;
    this.contextSrv = contextSrv;
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$location = $location;
    this.$timeout = $timeout;
    this.$q = $q;
    this.pageReady = false;
    this.probe = null;
    this.probeUpdates = {};
    this.showDestroy = false;
    if ($location.search().probe) {
      this.getProbe($location.search().probe);
    } else {
      this.alertSrv.set("no probe id provided.", "", 'error', 10000);
    }
    $scope.$on("$destroy", function() {
      $timeout.cancel(self.poller);
    });
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

  getProbe(id) {
    var self = this;
    return this.backendSrv.get("api/plugin-proxy/raintank-worldping-app/api/v2/probes/"+id).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.probe = resp.body;
      self.probeUpdates = {name: self.probe.name, public: self.probe.public};
      if (!self.probe.online) {
        self.checkIfOnline();
      }
    });
  }

  setEnabled(newState) {
    var self = this;
    this.probe.enabled = newState;
    return this.backendSrv.put('api/plugin-proxy/raintank-worldping-app/api/v2/probes', this.probe).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to update probe.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.probe = resp.body;
    });
  }

  update() {
    this.probe.name = this.probeUpdates.name;
    this.probe.public = this.probeUpdates.public;
    this.save();
  }

  remove(probe) {
    var self = this;
    return this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/v2/probes/' + probe.id).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to delete probe.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.$location.path('plugins/raintank-worldping-app/page/probes');
    });
  }

  gotoDashboard(probe) {
    this.$location.path("/dashboard/db/worldping-probes").search({"var-probe": probe.slug, "var-endpoint": "All"});
  }

  gotoEventDashboard(probe) {
    this.$location.path("/dashboard/db/worldping-events").search({"var-probe": probe.slug, "var-endpoint": "All"});
  }

  getEventsDashboardLink() {
    if (!this.probe) {
      return "";
    }
    var path = "/dashboard-solo/db/worldping-events";
    var qstring = "?panelId=2&from=now-1d&to=now&var-probe="+this.probe.slug;
    return path + qstring;
  }

  checkIfOnline() {
    var self = this;
    this.verifyOnline = true;

    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes/'+this.probe.id).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
      } else {
        self.probe = resp.body;
      }
      if (!self.probe.online) {
        self.poller = self.$timeout(function() {
          self.checkIfOnline();
        }, 1000);
      }
    });
  }
}

ProbeDetailsCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_details.html';
