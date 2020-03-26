"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelCtrl = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _sdk = require("app/plugins/sdk");

var _dsUpgrade = _interopRequireDefault(require("../../components/config/dsUpgrade"));

var _promiseToDigest = require("../../utils/promiseToDigest");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

(0, _sdk.loadPluginCss)({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

var CallToActionCtrl =
/*#__PURE__*/
function (_PanelCtrl) {
  _inherits(CallToActionCtrl, _PanelCtrl);

  /** @ngInject */
  function CallToActionCtrl($scope, $injector, $location, $q, backendSrv, alertSrv, contextSrv, datasourceSrv) {
    var _this;

    _classCallCheck(this, CallToActionCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CallToActionCtrl).call(this, $scope, $injector));
    _this.backendSrv = backendSrv;
    _this.alertSrv = alertSrv;
    _this.$location = $location;
    _this.$q = $q;
    _this.datasourceSrv = datasourceSrv;
    _this.quotas = null;
    _this.endpointStatus = "scopeEndpoints";
    _this.collectorStatus = "scopeCollectors";
    _this.requiresUpgrade = null;
    _this.currentlyTrial = null;
    _this.aboveFreeTier = null;

    _this.getOrgDetails();

    _this.datasourceUpgrader = new _dsUpgrade["default"](contextSrv, backendSrv, $q, datasourceSrv);
    return _this;
  }

  _createClass(CallToActionCtrl, [{
    key: "setEndpointStatus",
    value: function setEndpointStatus() {
      if (!this.quotas) {
        return;
      }

      if (this.quotas.endpoint.used === 0) {
        this.endpointStatus = "noEndpoints";
        return;
      }

      if (this.quotas.endpoint.used >= 1) {
        this.endpointStatus = "hasEndpoints";
        return;
      } //default.


      this.endpointStatus = "hasEndpoints";
      return;
    }
  }, {
    key: "setCollectorStatus",
    value: function setCollectorStatus() {
      if (!this.quotas) {
        return;
      }

      if (this.quotas.probe.used === 0) {
        this.collectorStatus = "noCollectors";
        return;
      }

      if (this.quotas.probe.used >= 1) {
        this.collectorStatus = "hasCollectors";
        return;
      } //default.


      this.collectorStatus = "hasCollectors";
      return;
    }
  }, {
    key: "getOrgDetails",
    value: function getOrgDetails() {
      var self = this;
      var p = (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org'));
      p.then(function (resp) {
        self.org = resp;
        var millionChecksPerMonth = Math.ceil(parseInt(self.org.checksPerMonth, 10) / 100000) / 10;

        if (millionChecksPerMonth > 1000) {
          self.org.strChecksPerMonth = 'using ' + Math.ceil(millionChecksPerMonth / 1000) + ' Billion checks/mo';
        } else if (millionChecksPerMonth > 0) {
          self.org.strChecksPerMonth = 'using ' + millionChecksPerMonth + ' Million checks/mo';
        } else {
          self.org.strChecksPerMonth = 'not using any checks yet';
        }

        self.requiresUpgrade = self._requiresUpgrade();
        self.currentlyTrial = self._currentlyTrial();
        self.aboveFreeTier = self._aboveFreeTier();
      }, function (resp) {
        self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
      });
      return p;
    }
  }, {
    key: "_currentlyTrial",
    value: function _currentlyTrial() {
      if (!this.org) {
        return false;
      }

      if (this.org.wpPlan === 'trial') {
        return true;
      }

      return false;
    }
  }, {
    key: "_requiresUpgrade",
    value: function _requiresUpgrade() {
      if (!this.org) {
        return true;
      }

      if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free' && this.org.wpPlan !== 'trial') {
        return false;
      }

      return true;
    }
  }, {
    key: "_aboveFreeTier",
    value: function _aboveFreeTier() {
      if (!this.org) {
        return false;
      }

      if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free') {
        return false;
      }

      if (this.org.checksPerMonth / 1000000 > 1) {
        return true;
      }

      return false;
    }
  }, {
    key: "allDone",
    value: function allDone() {
      if (!this.quotas) {
        return false;
      }

      if (this.quotas.probe.used === 0) {
        return false;
      }

      if (this.quotas.endpoint.used === 0) {
        return false;
      } //default.


      return true;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var self = this;
      return (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then(function (resp) {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to get quotas.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }

        var quotaHash = {};

        _lodash["default"].forEach(resp.body, function (q) {
          quotaHash[q.target] = q;
        });

        self.quotas = quotaHash;
        self.setEndpointStatus();
        self.setCollectorStatus();
      }));
    }
  }]);

  return CallToActionCtrl;
}(_sdk.PanelCtrl);

exports.PanelCtrl = CallToActionCtrl;
CallToActionCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/call-to-action/module.html';
//# sourceMappingURL=module.js.map
