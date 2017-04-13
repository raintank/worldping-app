"use strict";

System.register(["lodash"], function (_export, _context) {
  "use strict";

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

      _export("EndpointDetailsCtrl", EndpointDetailsCtrl = function () {

        /** @ngInject */
        function EndpointDetailsCtrl($scope, $injector, $location, $q, backendSrv, contextSrv, alertSrv) {
          _classCallCheck(this, EndpointDetailsCtrl);

          this.isOrgEditor = contextSrv.hasRole("Admin") || contextSrv.hasRole("Editor");
          this.backendSrv = backendSrv;
          this.alertSrv = alertSrv;
          this.$location = $location;
          this.$q = $q;

          this.pageReady = false;
          this.endpoint = null;

          if ($location.search().endpoint) {
            this.getEndpoint($location.search().endpoint);
          } else {
            this.alertSrv.set("no endpoint id provided.", "", 'error', 10000);
          }

          this.checktypes = [{ name: 'DNS', dashName: 'worldping-endpoint-dns?' }, { name: 'Ping', dashName: 'worldping-endpoint-ping?' }, { name: 'HTTP', dashName: 'worldping-endpoint-web?var-protocol=http&' }, { name: 'HTTPS', dashName: 'worldping-endpoint-web?var-protocol=https&' }];
        }

        _createClass(EndpointDetailsCtrl, [{
          key: "tagsUpdated",
          value: function tagsUpdated() {
            this.backendSrv.post("api/plugin-proxy/raintank-worldping-app/api/endpoints", this.endpoint);
          }
        }, {
          key: "getEndpoint",
          value: function getEndpoint(id) {
            var self = this;

            self.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/' + id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get endpoint.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.endpoint = resp.body;
              var getProbes = false;
              _.forEach(self.endpoint.checks, function (check) {
                if (check.route.type === 'byTags') {
                  getProbes = true;
                }
              });
              if (getProbes) {
                self.getProbes().then(function () {
                  self.pageReady = true;
                });
              } else {
                self.pageReady = true;
              }
            });
          }
        }, {
          key: "getProbes",
          value: function getProbes() {
            var self = this;
            return self.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes').then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get probes.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.probes = resp.body;
            });
          }
        }, {
          key: "getMonitorByTypeName",
          value: function getMonitorByTypeName(name) {
            var check;
            _.forEach(this.endpoint.checks, function (c) {
              if (c.type.toLowerCase() === name.toLowerCase()) {
                check = c;
              }
            });
            return check;
          }
        }, {
          key: "monitorStateTxt",
          value: function monitorStateTxt(type) {
            var mon = this.getMonitorByTypeName(type);
            if ((typeof mon === "undefined" ? "undefined" : _typeof(mon)) !== "object") {
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
          key: "monitorStateClass",
          value: function monitorStateClass(type) {
            var mon = this.getMonitorByTypeName(type);
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
          key: "stateChangeStr",
          value: function stateChangeStr(type) {
            var mon = this.getMonitorByTypeName(type);
            if ((typeof mon === "undefined" ? "undefined" : _typeof(mon)) !== "object") {
              return "";
            }
            var duration = new Date().getTime() - new Date(mon.stateChange).getTime();
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
          key: "getProbesForCheck",
          value: function getProbesForCheck(type) {
            var check = this.getMonitorByTypeName(type);
            if ((typeof check === "undefined" ? "undefined" : _typeof(check)) !== "object") {
              return [];
            }
            if (check.route.type === "byIds") {
              return check.route.config.ids;
            } else if (check.route.type === "byTags") {
              var probeList = {};
              _.forEach(this.probes, function (p) {
                _.forEach(check.route.config.tags, function (t) {
                  if (_.indexOf(p.tags, t) !== -1) {
                    probeList[p.id] = true;
                  }
                });
              });
              return _.keys(probeList);
            } else {
              this.alertSrv("check has unknown routing type.", "unknown route type.", "error", 5000);
              return [];
            }
          }
        }, {
          key: "setEndpoint",
          value: function setEndpoint(id) {
            this.$location.url('plugins/raintank-worldping-app/page/endpoint_details?endpoint=' + id);
          }
        }, {
          key: "gotoDashboard",
          value: function gotoDashboard(endpoint, type) {
            if (!type) {
              type = 'summary';
            }
            var search = {
              "var-probe": "All",
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
          key: "gotoEventDashboard",
          value: function gotoEventDashboard(endpoint, type) {
            this.$location.url("/dashboard/db/worldping-events").search({
              "var-probe": "All",
              "var-endpoint": endpoint.slug,
              "var-monitor_type": type.toLowerCase()
            });
          }
        }, {
          key: "getNotificationEmails",
          value: function getNotificationEmails(checkType) {
            var mon = this.getMonitorByTypeName(checkType);
            if (!mon || mon.healthSettings.notifications.addresses === "") {
              return [];
            }
            var addresses = mon.healthSettings.notifications.addresses.split(',');
            var list = [];
            addresses.forEach(function (addr) {
              list.push(addr.trim());
            });
            return list;
          }
        }, {
          key: "getNotificationEmailsAsString",
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
        }]);

        return EndpointDetailsCtrl;
      }());

      EndpointDetailsCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_details.html';

      _export("EndpointDetailsCtrl", EndpointDetailsCtrl);
    }
  };
});
//# sourceMappingURL=endpoint_details.js.map
