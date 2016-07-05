import _ from 'lodash';

export class ProbeDetailsCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location,$timeout, backendSrv, contextSrv) {
    var self = this;
    this.contextSrv = contextSrv;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.$timeout = $timeout;
    this.pageReady = false;
    this.collectors = [];
    this.collector = null;
    this.collectorUpdates = {};
    var promise = this.getCollectors();
    promise.then(function() {
      self.getCollector($location.search().probe);
    });
    $scope.$on("$destroy", function() {
      $timeout.cancel(self.poller);
    });
  }

  getCollectors() {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors').then(function(collectors) {
      self.collectors = collectors;
    });
  }

  save() {
    this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/collectors", this.collector);
  }

  getCollector(id) {
    var self = this;
    _.forEach(this.collectors, function(collector) {
      if (collector.id === parseInt(id)) {
        self.collector = collector;
        self.collectorUpdates = {
          "name": collector.name,
          "public": collector.public
        };
        if (!collector.online) {
          self.checkIfOnline();
        }
      }
    });
  }

  setEnabled(newState) {
    var self = this;
    this.collector.enabled = newState;
    this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/collectors', this.collector).then(function() {
      self.collector.enabled_change = new Date();
    });
  }

  update() {
    this.collector.name = this.collectorUpdates.name;
    this.collector.public = this.collectorUpdates.public;
    this.save();
  }

  remove(collector) {
    var self = this;
    this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/collectors/' + collector.id).then(function() {
      self.$location.path('plugins/raintank-worldping-app/page/probes');
    });
  }

  gotoDashboard(collector) {
    this.$location.path("/dashboard/db/worldping-probes").search({"var-probe": collector.slug, "var-endpoint": "All"});
  }

  gotoEventDashboard(collector) {
    this.$location.path("/dashboard/db/worldping-events").search({"var-probe": collector.slug, "var-endpoint": "All"});
  }

  getEventsDashboardLink() {
    if (!this.collector) {
      return "";
    }
    var path = "/dashboard-solo/db/worldping-events";
    var qstring = "?panelId=1&fullscreen&from=now-1d&to=now&var-probe="+this.collector.slug;
    return path + qstring;
  }

  checkIfOnline() {
    var self = this;
    this.verifyOnline = true;

    this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors/'+this.collector.id).then(function(res) {
      self.collector = res;
      if (!res.online) {
        self.poller = self.$timeout(function() {
          self.checkIfOnline();
        }, 1000);
      }
    });
  }
}

ProbeDetailsCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_details.html';
