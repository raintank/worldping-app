'use strict';

System.register(['angular'], function (_export, _context) {
  var angular, _createClass, defaults, ProbeCreateCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_angular) {
      angular = _angular.default;
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

        function ProbeCreateCtrl($scope, $injector, $location, $q, backendSrv, alertSrv) {
          _classCallCheck(this, ProbeCreateCtrl);

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

        _createClass(ProbeCreateCtrl, [{
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
          key: 'reset',
          value: function reset() {
            this.probe = angular.copy(defaults);
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
