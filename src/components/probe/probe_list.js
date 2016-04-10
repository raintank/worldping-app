import _ from 'lodash';

class ProbeListCtrl {

  /** @ngInject */
  constructor($scope, $injector, $location, $filter, backendSrv) {
    this.backendSrv = backendSrv;
    this.$filter = $filter;
    this.$location = $location;
    this.pageReady = false;
    this.statuses = [
      {label: "Online", value: {online: true, enabled: true}, id: 2},
      {label: "Offline", value: {online: false, enabled: true}, id: 3},
      {label: "Disabled", value: {enabled: false}, id: 4},
    ];

    this.filter = {tag: "", status: ""};
    this.sort_field = "name";
    this.collectors = [];
    this.getCollectors();
  }

  collectorTags() {
    var map = {};
    _.forEach(this.collectors, function(collector) {
      _.forEach(collector.tags, function(tag) {
        map[tag] = true;
      });
    });
    return Object.keys(map);
  }

  setCollectorFilter(tag) {
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

  getCollectors() {
    var self = this;
    this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors').then(function(collectors) {
      self.pageReady = true;
      self.collectors = collectors;
    });
  }

  remove(loc) {
    var self = this;
    this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/collectors/' + loc.id).then(function() {
      self.getCollectors();
    });
  }

  gotoDashboard(collector) {
    this.$location.path("/dashboard/db/worldping-collector-summary").search({"var-collector": collector.slug, "var-endpoint": "All"});
  }
}

ProbeListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_list.html';
export {ProbeListCtrl};
