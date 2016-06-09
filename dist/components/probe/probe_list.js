'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, ProbeListCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('ProbeListCtrl', ProbeListCtrl = function () {

        /** @ngInject */

        function ProbeListCtrl($scope, $injector, $location, $filter, backendSrv, contextSrv) {
          _classCallCheck(this, ProbeListCtrl);

          this.isOrgAdmin = contextSrv.hasRole('Admin');
          this.backendSrv = backendSrv;
          this.$filter = $filter;
          this.$location = $location;
          this.pageReady = false;
          this.statuses = [{ label: "Online", value: { online: true, enabled: true }, id: 2 }, { label: "Offline", value: { online: false, enabled: true }, id: 3 }, { label: "Disabled", value: { enabled: false }, id: 4 }];

          this.filter = { tag: "", status: "" };
          this.sort_field = "name";
          this.collectors = [];
          this.getCollectors();
        }

        _createClass(ProbeListCtrl, [{
          key: 'collectorTags',
          value: function collectorTags() {
            var map = {};
            _.forEach(this.collectors, function (collector) {
              _.forEach(collector.tags, function (tag) {
                map[tag] = true;
              });
            });
            return Object.keys(map);
          }
        }, {
          key: 'setCollectorFilter',
          value: function setCollectorFilter(tag) {
            this.filter.tag = tag;
          }
        }, {
          key: 'statusFilter',
          value: function statusFilter() {
            var self = this;
            return function (actual) {
              if (!self.filter.status) {
                return true;
              }
              var res = self.$filter('filter')([actual], self.filter.status);
              return res.length > 0;
            };
          }
        }, {
          key: 'getCollectors',
          value: function getCollectors() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors').then(function (collectors) {
              self.pageReady = true;
              self.collectors = collectors;
            });
          }
        }, {
          key: 'remove',
          value: function remove(loc) {
            var self = this;
            this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/collectors/' + loc.id).then(function () {
              self.getCollectors();
            });
          }
        }, {
          key: 'gotoDashboard',
          value: function gotoDashboard(collector) {
            this.$location.path("/dashboard/db/worldping-collector-summary").search({ "var-collector": collector.slug, "var-endpoint": "All" });
          }
        }]);

        return ProbeListCtrl;
      }());

      ProbeListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_list.html';

      _export('ProbeListCtrl', ProbeListCtrl);
    }
  };
});
//# sourceMappingURL=probe_list.js.map
