'use strict';

System.register(['lodash'], function (_export, _context) {
  var _, _createClass, defaults, ProbeCreateCtrl;

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

      defaults = {
        name: '',
        enabled: true
      };

      _export('ProbeCreateCtrl', ProbeCreateCtrl = function () {
        /** @ngInject */

        function ProbeCreateCtrl($scope, $injector, $location, $timeout, backendSrv) {
          _classCallCheck(this, ProbeCreateCtrl);

          var self = this;
          this.backendSrv = backendSrv;
          this.$location = $location;
          this.$timeout = $timeout;
          this.newCollector = false;
          this.apiKey = "";

          this.collector = angular.copy(defaults);

          if ("probe" in $location.search()) {
            self.getCollector($location.search().probe);
          } else {
            self.reset();
          }
        }

        _createClass(ProbeCreateCtrl, [{
          key: 'getCollector',
          value: function getCollector(id) {
            var self = this;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/collectors/' + id).then(function (collector) {
              self.collector = collector;
            });
          }
        }, {
          key: 'reset',
          value: function reset() {
            this.collector = angular.copy(defaults);
          }
        }, {
          key: 'save',
          value: function save() {
            return this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/collectors', this.collector);
          }
        }, {
          key: 'add',
          value: function add() {
            var self = this;
            this.backendSrv.put('api/plugin-proxy/raintank-worldping-app/api/collectors', this.collector).then(function (resp) {
              self.collector = resp;
              self.newCollector = true;
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
        }, {
          key: 'apiKey',
          value: function apiKey() {
            var self = this;
            var token = {
              role: 'Editor',
              name: "collector:" + $scope.collector.name
            };
            this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/auth/keys', token).then(function (result) {
              self.apiKey = result.key;
              self.showApiKey = true;
            });
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
