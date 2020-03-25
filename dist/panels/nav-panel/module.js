"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelCtrl = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

require("../../filters/all");

require("../../directives/all");

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

var EndpointNavCtrl =
/*#__PURE__*/
function (_PanelCtrl) {
  _inherits(EndpointNavCtrl, _PanelCtrl);

  /** @ngInject */
  function EndpointNavCtrl($scope, $injector, $location, $q, backendSrv, templateSrv, alertSrv, contextSrv, datasourceSrv) {
    var _this;

    _classCallCheck(this, EndpointNavCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EndpointNavCtrl).call(this, $scope, $injector));
    _this.$location = $location;
    _this.$q = $q;
    _this.backendSrv = backendSrv;
    _this.templateSrv = templateSrv;
    _this.datasourceSrv = datasourceSrv;
    _this.alertSrv = alertSrv;
    _this.endpointSlugs = [];
    $scope.ctrl.panel.title = "";
    $scope.ctrl.panel.transparent = true;
    _this.pageReady = false;
    _this.statuses = [{
      label: "Ok",
      value: 0
    }, {
      label: "Warning",
      value: 1
    }, {
      label: "Error",
      value: 2
    }, {
      label: "Unknown",
      value: -1
    }];
    _this.endpoints = [];
    _this.endpointState = {
      "0": 0,
      "1": 0,
      "2": 0,
      "-1": 0
    };
    _this.datasourceUpgrader = new _dsUpgrade["default"](contextSrv, backendSrv, $q, datasourceSrv);
    return _this;
  }

  _createClass(EndpointNavCtrl, [{
    key: "getEndpointSlugs",
    value: function getEndpointSlugs() {
      var values = null;

      _lodash["default"].forEach(this.templateSrv.variables, function (tmplVar) {
        if (tmplVar.name === 'endpoint') {
          values = tmplVar.current.value;

          if (!_lodash["default"].isArray(values)) {
            values = [values];
          }

          values;
        }
      });

      this.endpointSlugs = values;
      return values;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var endpointSlugs = this.getEndpointSlugs();
      this.getEndpoints(endpointSlugs);
    }
  }, {
    key: "getEndpoints",
    value: function getEndpoints(endpointSlugs) {
      var self = this;
      (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints').then(function (resp) {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to get endpoint list.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }

        self.endpoints = [];
        self.isGoogleDemo = endpointSlugs.length === 1 && endpointSlugs[0] === '~google_com_demo';

        _lodash["default"].forEach(resp.body, function (endpoint) {
          if (_lodash["default"].indexOf(endpointSlugs, endpoint.slug) >= 0) {
            self.endpoints.push(endpoint);
          }
        });

        self.pageReady = true;
      }));
    }
  }, {
    key: "monitorStateTxt",
    value: function monitorStateTxt(endpoint, type) {
      var check;

      _lodash["default"].forEach(endpoint.checks, function (c) {
        if (c.type.toLowerCase() === type.toLowerCase()) {
          check = c;
        }
      });

      if (_typeof(check) !== "object") {
        return "disabled";
      }

      if (!check.enabled) {
        return "disabled";
      }

      if (check.state < 0 || check.state > 2) {
        return 'nodata';
      }

      var states = ["online", "warn", "critical"];
      return states[check.state];
    }
  }, {
    key: "monitorStateChangeStr",
    value: function monitorStateChangeStr(endpoint, type) {
      var check;

      _lodash["default"].forEach(endpoint.checks, function (c) {
        if (c.type.toLowerCase() === type.toLowerCase()) {
          check = c;
        }
      });

      if (_typeof(check) !== "object") {
        return "";
      }

      var duration = new Date().getTime() - new Date(check.stateChange).getTime();

      if (duration < 10000) {
        return "for a few seconds ago";
      }

      if (duration < 60000) {
        var secs = Math.floor(duration / 1000);
        return "for " + secs + " seconds";
      }

      if (duration < 3600000) {
        var mins = Math.floor(duration / 1000 / 60);
        return "for " + mins + " minutes";
      }

      if (duration < 86400000) {
        var hours = Math.floor(duration / 1000 / 60 / 60);
        return "for " + hours + " hours";
      }

      var days = Math.floor(duration / 1000 / 60 / 60 / 24);
      return "for " + days + " days";
    }
  }, {
    key: "gotoDashboard",
    value: function gotoDashboard(endpoint, type) {
      if (!type) {
        type = 'summary';
      }

      var search = {
        "var-collector": "All",
        "var-endpoint": endpoint.slug
      };

      switch (type) {
        case "summary":
          this.$location.path("/dashboard/db/worldping-endpoint-summary").search(search);
          break;

        case "ping":
          this.$location.path("/dashboard/db/worldping-endpoint-ping").search(search);
          break;

        case "dns":
          this.$location.path("/dashboard/db/worldping-endpoint-dns").search(search);
          break;

        case "http":
          search['var-protocol'] = "http";
          this.$location.path("/dashboard/db/worldping-endpoint-web").search(search);
          break;

        case "https":
          search['var-protocol'] = "https";
          this.$location.path("/dashboard/db/worldping-endpoint-web").search(search);
          break;

        default:
          this.$location.path("/dashboard/db/worldping-endpoint-summary").search(search);
          break;
      }
    }
  }, {
    key: "gotoEndpointURL",
    value: function gotoEndpointURL(endpoint) {
      this.$location.path('plugins/raintank-worldping-app/page/endpoint-details?endpoint=' + endpoint.id);
    }
  }]);

  return EndpointNavCtrl;
}(_sdk.PanelCtrl);

exports.PanelCtrl = EndpointNavCtrl;
EndpointNavCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/nav-panel/module.html';
//# sourceMappingURL=module.js.map
