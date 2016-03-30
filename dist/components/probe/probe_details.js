'use strict';

System.register(['lodash'], function (_export, _context) {
  var _, _createClass, ProbeDetailsCtrl;

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

      _export('ProbeDetailsCtrl', ProbeDetailsCtrl = function () {
        /** @ngInject */

        function ProbeDetailsCtrl($scope, $injector, $location, $timeout, backendSrv, contextSrv) {
          _classCallCheck(this, ProbeDetailsCtrl);

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
          promise.then(function () {
            self.getCollector($location.search().probe);
          });
          $scope.$on("$destroy", function () {
            $timeout.cancel(self.poller);
          });
        }

        _createClass(ProbeDetailsCtrl, [{
          key: 'getCollectors',
          value: function getCollectors() {
            var self = this;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors').then(function (collectors) {
              self.collectors = collectors;
            });
          }
        }, {
          key: 'save',
          value: function save() {
            this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/collectors", this.collector);
          }
        }, {
          key: 'getCollector',
          value: function getCollector(id) {
            var self = this;
            _.forEach(this.collectors, function (collector) {
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
        }, {
          key: 'setEnabled',
          value: function setEnabled(newState) {
            var self = this;
            this.collector.enabled = newState;
            this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/collectors', this.collector).then(function () {
              self.collector.enabled_change = new Date();
            });
          }
        }, {
          key: 'update',
          value: function update() {
            this.collector.name = this.collectorUpdates.name;
            this.collector.public = this.collectorUpdates.public;
            this.save();
          }
        }, {
          key: 'gotoDashboard',
          value: function gotoDashboard(collector) {
            this.$location.path("/dashboard/db/worldping-collector-summary").search({ "var-probe": collector.slug, "var-endpoint": "All" });
          }
        }, {
          key: 'gotoEventDashboard',
          value: function gotoEventDashboard(collector) {
            this.$location.path("/dashboard/db/worldping-events").search({ "var-probe": collector.slug, "var-endpoint": "All" });
          }
        }, {
          key: 'getEventsDashboardLink',
          value: function getEventsDashboardLink() {
            if (!this.collector) {
              return "";
            }
            var path = "/dashboard-solo/db/worldping-events";
            var qstring = "?panelId=1&fullscreen&from=now-1d&to=now&var-probe=" + this.collector.slug;
            return path + qstring;
          }
        }, {
          key: 'checkIfOnline',
          value: function checkIfOnline() {
            var self = this;
            this.verifyOnline = true;

            this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors/' + this.collector.id).then(function (res) {
              self.collector = res;
              if (!res.online) {
                self.poller = self.$timeout(function () {
                  self.checkIfOnline();
                }, 1000);
              }
            });
          }
        }]);

        return ProbeDetailsCtrl;
      }());

      ProbeDetailsCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_details.html';

      _export('ProbeDetailsCtrl', ProbeDetailsCtrl);
    }
  };
});
//# sourceMappingURL=probe_details.js.map
