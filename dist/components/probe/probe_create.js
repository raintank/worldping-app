"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProbeCreateCtrl = void 0;

var _angular = _interopRequireDefault(require("angular"));

var _lodash = _interopRequireDefault(require("lodash"));

var _promiseToDigest = require("../../utils/promiseToDigest");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var defaults = {
  name: '',
  enabled: true
};

var ProbeCreateCtrl =
/*#__PURE__*/
function () {
  /** @ngInject */
  function ProbeCreateCtrl($scope, $injector, $location, $window, $q, backendSrv, alertSrv) {
    _classCallCheck(this, ProbeCreateCtrl);

    var self = this;
    this.$window = $window;
    this.$q = $q;
    this.$scope = $scope;
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
    this.probe = _angular["default"].copy(defaults);
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
    key: "setInstallMethod",
    value: function setInstallMethod(newMethod) {
      var self = this;

      _lodash["default"].forEach(this.installMethod, function (enabled, method) {
        if (method === newMethod) {
          self.installMethod[method] = true;
        } else {
          self.installMethod[method] = false;
        }
      });

      console.log(this.installMethod);
    }
  }, {
    key: "getProbe",
    value: function getProbe(id) {
      var self = this;
      return (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.get("api/plugin-proxy/raintank-worldping-app/api/v2/probes/" + id).then(function (resp) {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to get probe.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }

        self.probe = resp.body;
      }));
    }
  }, {
    key: "getOrgDetails",
    value: function getOrgDetails() {
      var self = this;
      var p = (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org'));
      p.then(function (resp) {
        self.org = resp;
        self.requiresUpgrade = self._requiresUpgrade();
      }, function (resp) {
        self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
      });
      return p;
    }
  }, {
    key: "_requiresUpgrade",
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
    key: "reset",
    value: function reset() {
      this.probe = _angular["default"].copy(defaults);
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.reset();
      this.ignoreChanges = true;
      this.$window.history.back();
    }
  }, {
    key: "save",
    value: function save() {
      var self = this;
      return (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.put("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then(function (resp) {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to save probe.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }
      }));
    }
  }, {
    key: "add",
    value: function add() {
      var self = this;
      return (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/v2/probes", this.probe).then(function (resp) {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to add probe.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }

        self.newCollector = true;
        self.probe = resp.body;
      }));
    }
  }, {
    key: "configInfo",
    value: function configInfo() {
      this.showConfigInfo = true;
    }
  }, {
    key: "defaultDistro",
    value: function defaultDistro() {
      this.showDistroConfig = false;
    }
  }, {
    key: "otherDistro",
    value: function otherDistro() {
      this.showDistroConfig = true;
    }
  }]);

  return ProbeCreateCtrl;
}();

exports.ProbeCreateCtrl = ProbeCreateCtrl;
ProbeCreateCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/probe/partials/probe_create.html';
//# sourceMappingURL=probe_create.js.map
