"use strict";

System.register(["lodash"], function (_export, _context) {
  var _, _typeof, _createClass, EndpointListCtrl;

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
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

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

      _export("EndpointListCtrl", EndpointListCtrl = function () {
        /** @ngInject */

        function EndpointListCtrl($scope, $injector, $location, backendSrv) {
          _classCallCheck(this, EndpointListCtrl);

          this.backendSrv = backendSrv;
          this.$location = $location;
          this.pageReady = false;
          this.statuses = [{ label: "Ok", value: 0 }, { label: "Warning", value: 1 }, { label: "Error", value: 2 }, { label: "Unknown", value: -1 }];
          this.filter = { 'tag': '', 'status': '' };
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
            this.getMonitorTypes();
          }
        }, {
          key: "endpointTags",
          value: function endpointTags() {
            var map = {};
            _.forEach(this.endpoints, function (endpoint) {
              _.forEach(endpoint.tags, function (tag) {
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
          key: "getMonitorTypes",
          value: function getMonitorTypes() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/monitor_types').then(function (types) {
              var typesMap = {};
              _.forEach(types, function (type) {
                typesMap[type.id] = type;
              });
              self.monitor_types = typesMap;
            });
          }
        }, {
          key: "isEndPointReady",
          value: function isEndPointReady(endpoint) {
            return endpoint && endpoint.hasOwnProperty('ready') && endpoint.ready;
          }
        }, {
          key: "getEndpoints",
          value: function getEndpoints() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/endpoints').then(function (endpoints) {
              self.pageReady = true;
              _.forEach(endpoints, function (endpoint) {
                endpoint.states = [];
                endpoint.monitors = {};
                endpoint.ready = false;
                self.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/monitors', { "endpoint_id": endpoint.id }).then(function (monitors) {
                  var seenStates = {};
                  _.forEach(monitors, function (mon) {
                    if (!mon.enabled) {
                      return;
                    }
                    seenStates[mon.state] = true;
                    endpoint.monitors[self.monitor_types[mon.monitor_type_id].name.toLowerCase()] = mon;
                  });
                  for (var s in seenStates) {
                    self.endpointState[s]++;
                    endpoint.states.push(parseInt(s));
                  }
                  endpoint.ready = true;
                });
              });
              self.endpoints = endpoints;
            });
          }
        }, {
          key: "remove",
          value: function remove(endpoint) {
            var self = this;
            this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/endpoints/' + endpoint.id).then(function () {
              self.getEndpoints();
            });
          }
        }, {
          key: "monitorStateTxt",
          value: function monitorStateTxt(endpoint, type) {
            var mon = endpoint.monitors[type];
            if ((typeof mon === "undefined" ? "undefined" : _typeof(mon)) !== "object") {
              return "disabled";
            }
            if (!mon.enabled) {
              return "disabled";
            }
            if (mon.state < 0 || mon.state > 2) {
              return 'nodata';
            }
            var states = ["online", "warn", "critical"];
            return states[mon.state];
          }
        }, {
          key: "monitorStateChangeStr",
          value: function monitorStateChangeStr(endpoint, type) {
            var mon = endpoint.monitors[type];
            if ((typeof mon === "undefined" ? "undefined" : _typeof(mon)) !== "object") {
              return "";
            }
            var duration = new Date().getTime() - new Date(mon.state_change).getTime();
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
            this.$location.path("/dashboard/db/worldping-endpoint-summary").search({ "var-collector": "All", "var-endpoint": endpoint.slug });
          }
        }, {
          key: "gotoEndpointURL",
          value: function gotoEndpointURL(endpoint) {
            this.$location.url('plugins/raintank-worldping-app/page/endpoint-details?endpoint=' + endpoint.id);
          }
        }]);

        return EndpointListCtrl;
      }());

      EndpointListCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_list.html';

      _export("EndpointListCtrl", EndpointListCtrl);
    }
  };
});
//# sourceMappingURL=endpoint_list.js.map
