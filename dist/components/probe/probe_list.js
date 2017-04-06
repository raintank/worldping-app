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
        function ProbeListCtrl($scope, $injector, $location, $filter, backendSrv, contextSrv, $q) {
          _classCallCheck(this, ProbeListCtrl);

          this.isOrgAdmin = contextSrv.hasRole('Admin');
          this.backendSrv = backendSrv;
          this.$filter = $filter;
          this.$location = $location;
          this.$q = $q;
          this.pageReady = false;
          this.statuses = [{ label: "Online", value: { online: true, enabled: true }, id: 2 }, { label: "Offline", value: { online: false, enabled: true }, id: 3 }, { label: "Disabled", value: { enabled: false }, id: 4 }];

          this.filter = { tag: "", status: "" };
          this.sort_field = "name";
          this.probes = [];
          this.getProbes();
        }

        _createClass(ProbeListCtrl, [{
          key: 'probeTags',
          value: function probeTags() {
            var map = {};
            _.forEach(this.probes, function (probe) {
              _.forEach(probe.tags, function (tag) {
                map[tag] = true;
              });
            });
            return Object.keys(map);
          }
        }, {
          key: 'setProbeFilter',
          value: function setProbeFilter(tag) {
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
          key: 'getProbes',
          value: function getProbes() {
            var self = this;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes').then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get probes.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.pageReady = true;
              self.probes = resp.body;
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
