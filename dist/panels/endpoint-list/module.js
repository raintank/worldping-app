"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelCtrl = void 0;

require("../../filters/all");

require("../../directives/all");

var _lodash = _interopRequireDefault(require("lodash"));

var _sdk = require("app/plugins/sdk");

var _promiseToDigest = require("../../utils/promiseToDigest");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

(0, _sdk.loadPluginCss)({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

var EndpointListCtrl =
/*#__PURE__*/
function (_PanelCtrl) {
  _inherits(EndpointListCtrl, _PanelCtrl);

  /** @ngInject */
  function EndpointListCtrl($scope, $injector, $location, $q, backendSrv, contextSrv, alertSrv) {
    var _this;

    _classCallCheck(this, EndpointListCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EndpointListCtrl).call(this, $scope, $injector));
    _this.isOrgEditor = contextSrv.hasRole('Editor') || contextSrv.hasRole('Admin');
    _this.backendSrv = backendSrv;
    _this.alertSrv = alertSrv;
    _this.$location = $location;
    _this.$q = $q;
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
    _this.filter = {
      'tag': '',
      'status': ''
    };
    _this.sort_field = 'name';
    _this.endpoints = [];

    _this.refresh();

    _this.endpointState = {
      "0": 0,
      "1": 0,
      "2": 0,
      "-1": 0
    };
    return _this;
  }

  _createClass(EndpointListCtrl, [{
    key: "initEditMode",
    value: function initEditMode() {
      _get(_getPrototypeOf(EndpointListCtrl.prototype), "initEditMode", this).call(this);

      this.icon = 'fa fa-text-width';
      this.addEditorTab('Options', 'public/plugins/raintank-worldping-app/panels/endpoint-list/editor.html');
      this.editorTabIndex = 1;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this.getEndpoints();
    }
  }, {
    key: "endpointTags",
    value: function endpointTags() {
      var map = {};

      _lodash["default"].forEach(this.endpoints, function (endpoint) {
        _lodash["default"].forEach(endpoint.tags, function (tag) {
          map[tag] = true;
        });
      });

      return Object.keys(map);
    }
  }, {
    key: "setTagFilter",
    value: function setTagFilter(tag) {
      this.filter.tag = tag;
    }
  }, {
    key: "setStatusFilter",
    value: function setStatusFilter(status) {
      if (status === this.filter.status) {
        status = "";
      }

      this.filter.status = status;
    }
  }, {
    key: "statusFilter",
    value: function statusFilter(actual, expected) {
      if (expected === "" || expected === null) {
        return true;
      }

      var equal = actual === expected;
      return equal;
    }
  }, {
    key: "getEndpoints",
    value: function getEndpoints() {
      var self = this;
      (0, _promiseToDigest.promiseToDigest)(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints').then(function (resp) {
        if (resp.meta.code !== 200) {
          self.alertSrv.set("failed to get endpoint list.", resp.meta.message, 'error', 10000);
          return self.$q.reject(resp.meta.message);
        }

        self.endpoints = resp.body;
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
    value: function gotoDashboard(endpoint) {
      this.$location.path("/dashboard/db/worldping-endpoint-summary").search({
        "var-collector": "All",
        "var-endpoint": endpoint.slug
      });
    }
  }, {
    key: "gotoEndpointURL",
    value: function gotoEndpointURL(endpoint) {
      this.$location.url('plugins/raintank-worldping-app/page/endpoint-details?endpoint=' + endpoint.id);
    }
  }]);

  return EndpointListCtrl;
}(_sdk.PanelCtrl);

exports.PanelCtrl = EndpointListCtrl;
EndpointListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_list.html';
//# sourceMappingURL=module.js.map
