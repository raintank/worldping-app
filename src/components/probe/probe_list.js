import _ from 'lodash';

class ProbeListCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $filter, backendSrv, contextSrv, $q) {
    this.isOrgAdmin = contextSrv.hasRole('Admin');
    this.backendSrv = backendSrv;
    this.$filter = $filter;
    this.$location = $location;
    this.$q = $q;
    this.pageReady = false;
    this.statuses = [
      {label: "Online", value: {online: true, enabled: true}, id: 2},
      {label: "Offline", value: {online: false, enabled: true}, id: 3},
      {label: "Disabled", value: {enabled: false}, id: 4},
    ];

    this.filter = {tag: "", status: ""};
    this.sort_field = "name";
    this.probes = [];
    this.getProbes();
  }

  probeTags() {
    var map = {};
    _.forEach(this.probes, function(probe) {
      _.forEach(probe.tags, function(tag) {
        map[tag] = true;
      });
    });
    return Object.keys(map);
  }

  setProbeFilter(tag) {
    this.filter.tag = tag;
  }

  statusFilter() {
    var self = this;
    return function(actual) {
      if (!self.filter.status) {
        return true;
      }
      var res = self.$filter('filter')([actual], self.filter.status);
      return res.length > 0;
    };
  }

  getProbes() {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes').then(function(resp) {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get probes.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.pageReady = true;
      self.probes = resp.body;
    });
  }

  gotoDashboard(collector) {
    this.$location.path("/dashboard/db/worldping-collector-summary").search({"var-collector": collector.slug, "var-endpoint": "All"});
  }
}

ProbeListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_list.html';
export {ProbeListCtrl};
