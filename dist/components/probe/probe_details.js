"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var _createClass, ProbeDetailsCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [],
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

      _export("ProbeDetailsCtrl", ProbeDetailsCtrl = function () {

        /** @ngInject */
        function ProbeDetailsCtrl($scope, $injector, $location, $timeout, $q, backendSrv, contextSrv, alertSrv) {
          _classCallCheck(this, ProbeDetailsCtrl);

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
          $scope.$on("$destroy", function () {
            $timeout.cancel(self.poller);
          });
        }

        _createClass(ProbeDetailsCtrl, [{
          key: "save",
          value: function save() {
            var self = this;
            return this.backendSrv.put("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to save probe.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
            });
          }
        }, {
          key: "getProbe",
          value: function getProbe(id) {
            var self = this;
            return this.backendSrv.get("api/plugin-proxy/raintank-worldping-app/api/v2/probes/" + id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.probe = resp.body;
              self.probeUpdates = { name: self.probe.name, public: self.probe.public };
              if (!self.probe.online) {
                self.checkIfOnline();
              }
            });
          }
        }, {
          key: "setEnabled",
          value: function setEnabled(newState) {
            var self = this;
            this.probe.enabled = newState;
            return this.backendSrv.put('api/plugin-proxy/raintank-worldping-app/api/v2/probes', this.probe).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to update probe.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.probe = resp.body;
            });
          }
        }, {
          key: "update",
          value: function update() {
            this.probe.name = this.probeUpdates.name;
            this.probe.public = this.probeUpdates.public;
            this.save();
          }
        }, {
          key: "remove",
          value: function remove(probe) {
            var self = this;
            return this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/v2/probes/' + probe.id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to delete probe.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.$location.path('plugins/raintank-worldping-app/page/probes');
            });
          }
        }, {
          key: "gotoDashboard",
          value: function gotoDashboard(probe) {
            this.$location.path("/dashboard/db/worldping-probes").search({ "var-probe": probe.slug, "var-endpoint": "All" });
          }
        }, {
          key: "gotoEventDashboard",
          value: function gotoEventDashboard(probe) {
            this.$location.path("/dashboard/db/worldping-events").search({ "var-probe": probe.slug, "var-endpoint": "All" });
          }
        }, {
          key: "getEventsDashboardLink",
          value: function getEventsDashboardLink() {
            if (!this.probe) {
              return "";
            }
            var path = "/dashboard-solo/db/worldping-events";
            var qstring = "?panelId=2&from=now-1d&to=now&var-probe=" + this.probe.slug;
            return path + qstring;
          }
        }, {
          key: "checkIfOnline",
          value: function checkIfOnline() {
            var self = this;
            this.verifyOnline = true;

            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes/' + this.probe.id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
              } else {
                self.probe = resp.body;
              }
              if (!self.probe.online) {
                self.poller = self.$timeout(function () {
                  self.checkIfOnline();
                }, 1000);
              }
            });
          }
        }]);

        return ProbeDetailsCtrl;
      }());

      _export("ProbeDetailsCtrl", ProbeDetailsCtrl);

      ProbeDetailsCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_details.html';
    }
  };
});
//# sourceMappingURL=probe_details.js.map
