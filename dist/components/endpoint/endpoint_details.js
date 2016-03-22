'use strict';

System.register(['lodash'], function (_export, _context) {
  var _, _typeof, _createClass, EndpointDetailsCtrl;

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

      _export('EndpointDetailsCtrl', EndpointDetailsCtrl = function () {
        /** @ngInject */

        function EndpointDetailsCtrl($scope, $injector, $location, backendSrv) {
          _classCallCheck(this, EndpointDetailsCtrl);

          var self = this;
          this.backendSrv = backendSrv;
          this.$location = $location;
          this.pageReady = false;

          this.endpoints = [];
          this.monitors = {};
          this.monitor_types = {};
          this.monitor_types_by_name = {};
          this.endpoint = null;
          this.refreshTime = new Date();
          this.getMonitorTypes();
          var promise = this.getEndpoints();
          promise.then(function () {
            self.getEndpoint($location.search().endpoint);
          });
        }

        _createClass(EndpointDetailsCtrl, [{
          key: 'getEndpoints',
          value: function getEndpoints() {
            var self = this;
            var promise = this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints');
            promise.then(function (endpoints) {
              self.endpoints = endpoints;
            });
            return promise;
          }
        }, {
          key: 'tagsUpdated',
          value: function tagsUpdated() {
            this.backendSrv.post("api/plugin-proxy/worldping-app/api/endpoints", $scope.endpoint);
          }
        }, {
          key: 'getMonitorTypes',
          value: function getMonitorTypes() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/worldping-app/api/monitor_types').then(function (types) {
              _.forEach(types, function (type) {
                self.monitor_types[type.id] = type;
                self.monitor_types_by_name[type.name] = type;
              });
            });
          }
        }, {
          key: 'getEndpoint',
          value: function getEndpoint(id) {
            var self = this;
            _.forEach(this.endpoints, function (endpoint) {
              if (endpoint.id === parseInt(id)) {
                self.endpoint = endpoint;
                //get monitors for this endpoint.
                self.backendSrv.get('api/plugin-proxy/worldping-app/api/monitors?endpoint_id=' + id).then(function (monitors) {
                  _.forEach(monitors, function (monitor) {
                    self.monitors[monitor.monitor_type_id] = monitor;
                  });
                  self.pageReady = true;
                });
              }
            });
          }
        }, {
          key: 'getMonitorByTypeName',
          value: function getMonitorByTypeName(name) {
            if (name in this.monitor_types_by_name) {
              var type = this.monitor_types_by_name[name];
              return this.monitors[type.id];
            }
            return undefined;
          }
        }, {
          key: 'monitorStateTxt',
          value: function monitorStateTxt(type) {
            var mon = this.getMonitorByTypeName(type);
            if ((typeof mon === 'undefined' ? 'undefined' : _typeof(mon)) !== "object") {
              return "disabled";
            }
            if (!mon.enabled) {
              return "disabled";
            }
            if (mon.state < 0 || mon.state > 2) {
              var sinceUpdate = new Date().getTime() - new Date(mon.updated).getTime();
              if (sinceUpdate < mon.frequency * 5 * 1000) {
                return 'pending';
              }
              return 'nodata';
            }
            var states = ["online", "warn", "critical"];
            return states[mon.state];
          }
        }, {
          key: 'monitorStateClass',
          value: function monitorStateClass(type) {
            var mon = this.getMonitorByTypeName(type);
            if ((typeof mon === 'undefined' ? 'undefined' : _typeof(mon)) !== "object") {
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
          key: 'stateChangeStr',
          value: function stateChangeStr(type) {
            var mon = this.getMonitorByTypeName(type);
            if ((typeof mon === 'undefined' ? 'undefined' : _typeof(mon)) !== "object") {
              return "";
            }
            var duration = new Date().getTime() - new Date(mon.state_change).getTime();
            if (duration < 10000) {
              return "a few seconds ago";
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
          key: 'setEndpoint',
          value: function setEndpoint(id) {
            this.$location.url('plugins/worldping-app/page/endpoint_details?endpoint=' + id);
          }
        }, {
          key: 'gotoDashboard',
          value: function gotoDashboard(endpoint, type) {
            if (!type) {
              type = 'summary';
            }
            var search = {
              "var-collector": "All",
              "var-endpoint": this.endpoint.slug
            };
            switch (type.toLowerCase()) {
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
          key: 'gotoEventDashboard',
          value: function gotoEventDashboard(endpoint, type) {
            this.$location.path("/dashboard/db/worldping-events").search({
              "var-collector": "All",
              "var-endpoint": endpoint.slug,
              "var-monitor_type": type.toLowerCase()
            });
          }
        }, {
          key: 'getNotificationEmails',
          value: function getNotificationEmails(checkType) {
            var mon = this.getMonitorByTypeName(checkType);
            if (!mon || mon.health_settings.notifications.addresses === "") {
              return [];
            }
            var addresses = mon.health_settings.notifications.addresses.split(',');
            var list = [];
            addresses.forEach(function (addr) {
              list.push(addr.trim());
            });
            return list;
          }
        }, {
          key: 'getNotificationEmailsAsString',
          value: function getNotificationEmailsAsString(checkType) {
            var emails = this.getNotificationEmails(checkType);
            if (emails.length < 1) {
              return "No recipients specified";
            }
            var list = [];
            emails.forEach(function (email) {
              // if the email in the format `display name <email@address>`
              // then just show the display name.
              var res = email.match(/\"?(.+)\"?\s*<.*@.*>/);
              if (res && res.length === 2) {
                list.push(res[1]);
              } else {
                list.push(email);
              }
            });
            return list.join(", ");
          }
        }, {
          key: 'refresh',
          value: function refresh() {
            this.pageReady = false;
            this.getEndpoint(thiss.endpoint.id);
            this.refreshTime = new Date();
          }
        }]);

        return EndpointDetailsCtrl;
      }());

      EndpointDetailsCtrl.templateUrl = 'public/plugins/worldping-app/components/endpoint/partials/endpoint_details.html';

      _export('EndpointDetailsCtrl', EndpointDetailsCtrl);
    }
  };
});
//# sourceMappingURL=endpoint_details.js.map
