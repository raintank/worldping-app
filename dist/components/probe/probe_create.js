'use strict';

System.register(['angular', 'lodash'], function (_export, _context) {
  "use strict";

  var angular, _, _createClass, defaults, ProbeCreateCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
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

      defaults = {
        name: '',
        enabled: true
      };

      _export('ProbeCreateCtrl', ProbeCreateCtrl = function () {

        /** @ngInject */
        function ProbeCreateCtrl($scope, $injector, $location, $window, $q, backendSrv, alertSrv) {
          _classCallCheck(this, ProbeCreateCtrl);

          var self = this;
          this.$window = $window;
          this.$q = $q;
          this.alertSrv = alertSrv;
          this.backendSrv = backendSrv;
          this.$location = $location;
          this.newProbe = false;
          this.installMethod = {
            deb: false,
            rpm: false,
            docker: false,
            manual: false
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

        _createClass(ProbeCreateCtrl, [{
          key: 'setInstallMethod',
          value: function setInstallMethod(newMethod) {
            var self = this;
            _.forEach(this.installMethod, function (enabled, method) {
              if (method === newMethod) {
                self.installMethod[method] = true;
              } else {
                self.installMethod[method] = false;
              }
            });
            console.log(this.installMethod);
          }
        }, {
          key: 'getProbe',
          value: function getProbe(id) {
            var self = this;
            return this.backendSrv.get("api/plugin-proxy/raintank-worldping-app/api/v2/probes/" + id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.probe = resp.body;
            });
          }
        }, {
          key: 'getOrgDetails',
          value: function getOrgDetails() {
            var self = this;
            var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org');
            p.then(function (resp) {
              self.org = resp;
              self.requiresUpgrade = self._requiresUpgrade();
            }, function (resp) {
              self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
            });
            return p;
          }
        }, {
          key: '_requiresUpgrade',
          value: function _requiresUpgrade() {
            if (!this.org) {
              return true;
            }

            if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free') {
              return false;
            }

            return true;
          }
        }, {
          key: 'reset',
          value: function reset() {
            this.probe = angular.copy(defaults);
          }
        }, {
          key: 'cancel',
          value: function cancel() {
            this.reset();
            this.ignoreChanges = true;
            this.$window.history.back();
          }
        }, {
          key: 'save',
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
          key: 'add',
          value: function add() {
            var self = this;
            return this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to add probe.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.newCollector = true;
              self.probe = resp.body;
            });
          }
        }, {
          key: 'configInfo',
          value: function configInfo() {
            this.showConfigInfo = true;
          }
        }, {
          key: 'defaultDistro',
          value: function defaultDistro() {
            this.showDistroConfig = false;
          }
        }, {
          key: 'otherDistro',
          value: function otherDistro() {
            this.showDistroConfig = true;
          }
        }]);

        return ProbeCreateCtrl;
      }());

      ProbeCreateCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_create.html';

      _export('ProbeCreateCtrl', ProbeCreateCtrl);
    }
  };
});
//# sourceMappingURL=probe_create.js.map
