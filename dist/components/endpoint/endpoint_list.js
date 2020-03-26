"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EndpointListCtrl = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _jquery = _interopRequireDefault(require("jquery"));

var _promiseToDigest = require("../../utils/promiseToDigest");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var EndpointListCtrl =
/*#__PURE__*/
function () {
  /** @ngInject */
  function EndpointListCtrl($scope, $injector, $location, $q, backendSrv, contextSrv, alertSrv) {
    _classCallCheck(this, EndpointListCtrl);

    this.isOrgEditor = contextSrv.hasRole('Editor') || contextSrv.hasRole('Admin');
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.$q = $q;
    this.$scope = $scope;
    this.$location = $location;
    this.pageReady = false;
    this.filter = {
      'tag': ''
    };
    this.sort_field = 'name';
    this.endpoints = [];
    this.refresh();
    this.endpointState = {
      "0": 0,
      "1": 0,
      "2": 0,
      "-1": 0
    };
  }

  _createClass(EndpointListCtrl, [{
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
    value: function gotoDashboard(endpoint, evt) {
      var clickTargetIsLinkOrHasLinkParents = (0, _jquery["default"])(evt.target).closest('a').length > 0;

      if (clickTargetIsLinkOrHasLinkParents === false) {
        this.$location.path("/dashboard/db/worldping-endpoint-summary").search({
          "var-collector": "All",
          "var-endpoint": endpoint.slug
        });
      }
    }
  }, {
    key: "gotoEndpointURL",
    value: function gotoEndpointURL(endpoint) {
      this.$location.url('plugins/raintank-worldping-app/page/endpoint-details?endpoint=' + endpoint.id);
    }
  }]);

  return EndpointListCtrl;
}();

exports.EndpointListCtrl = EndpointListCtrl;
EndpointListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_list.html';
//# sourceMappingURL=endpoint_list.js.map
