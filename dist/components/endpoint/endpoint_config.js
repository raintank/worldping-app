'use strict';

System.register(['lodash', 'angular'], function (_export, _context) {
  "use strict";

  var _, angular, _createClass, _defaultCheck, EndpointConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function defaultCheck(checkType) {
    var check = _.cloneDeep(_defaultCheck);
    switch (checkType) {
      case "http":
        check.type = "http";
        check.settings = {
          timeout: 5,
          port: 80,
          path: "/",
          headers: "User-Agent: worldping-api\nAccept-Encoding: gzip\n",
          method: "GET",
          host: ""
        };
        check.frequency = 120;
        break;
      case "https":
        check.type = "https";
        check.settings = {
          timeout: 5,
          port: 443,
          path: "/",
          headers: "User-Agent: worldping-api\nAccept-Encoding: gzip\n",
          method: "GET",
          host: "",
          validateCert: true
        };
        check.frequency = 120;
        break;
      case "ping":
        check.type = "ping";
        check.settings = {
          timeout: 5,
          hostname: ""
        };
        check.frequency = 60;
        break;
      case "dns":
        check.type = "dns";
        check.settings = {
          timeout: 5,
          name: "",
          port: 53,
          protocol: "udp",
          server: "",
          type: "A"
        };
        check.frequency = 120;
        break;
    }
    return check;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_angular) {
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

      _defaultCheck = {
        settings: {},
        healthSettings: {
          notifications: {},
          num_collectors: 3,
          steps: 3
        },
        route: {
          type: "byIds",
          config: {
            "ids": []
          }
        }
      };

      _export('EndpointConfigCtrl', EndpointConfigCtrl = function () {
        /** @ngInject */
        function EndpointConfigCtrl($scope, $injector, $rootScope, $location, $modal, $anchorScroll, $timeout, $window, $q, backendSrv, alertSrv) {
          _classCallCheck(this, EndpointConfigCtrl);

          var self = this;
          this.backendSrv = backendSrv;
          this.$location = $location;
          this.$timeout = $timeout;
          this.$q = $q;
          this.alertSrv = alertSrv;
          this.$window = $window;

          this.pageReady = false;
          this.showCreating = false;
          self.insufficientQuota = false;

          this.frequencyOpts = [];
          var freqOpt = [10, 30, 60, 120];
          _.forEach(freqOpt, function (f) {
            self.frequencyOpts.push({ value: f, label: "Every " + f + "s" });
          });

          this.newEndpointName = "";
          this.checks = {};
          this.endpoint = {};
          this.probes = [];
          this.probesByTag = {};
          this.org = null;

          this.ignoreChanges = false;

          var promises = [];
          self.reset();
          if ("endpoint" in $location.search()) {
            promises.push(self.getEndpoint($location.search().endpoint));
          } else {
            // make sure we have sufficient quota.
            promises.push(self.checkQuota());
            this.endpoint = { name: "" };
          }

          promises.push(this.getProbes());
          promises.push(this.getOrgDetails());

          $q.all(promises).then(function () {
            self.pageReady = true;
            $timeout(function () {
              $anchorScroll();
            }, 0, false);
          }, function (err) {
            alertSrv.set("endpoint config init failed", err, 'error', 10000);
          });

          if ($location.search().check) {
            switch ($location.search().check) {
              case "ping":
                self.showPing = true;
                break;
              case "dns":
                self.showDNS = true;
                break;
              case "http":
                self.showHTTP = true;
                break;
              case "https":
                self.showHTTPS = true;
                break;
            }
          }

          $window.onbeforeunload = function () {
            if (self.ignoreChanges) {
              return;
            }
            if (self.changesPending()) {
              return "There are unsaved changes to this dashboard";
            }
          };

          $scope.$on('$locationChangeStart', function (event, next) {
            if (!self.ignoreChanges && self.changesPending()) {
              event.preventDefault();
              var baseLen = $location.absUrl().length - $location.url().length;
              var nextUrl = next.substring(baseLen);
              var modalScope = $scope.$new();
              modalScope.ignore = function () {
                self.ignoreChanges = true;
                $location.url(nextUrl);
                return;
              };

              modalScope.save = function () {
                self.savePending(nextUrl);
              };

              $rootScope.appEvent('show-modal', {
                src: 'public/app/partials/unsaved-changes.html',
                modalClass: 'confirm-modal',
                scope: modalScope
              });
            }
          });
        }

        _createClass(EndpointConfigCtrl, [{
          key: 'getEndpoint',
          value: function getEndpoint(idString) {
            var self = this;
            var id = parseInt(idString);
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/' + id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get endpoint.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.endpoint = resp.body;
              self.newEndpointName = self.endpoint.name;
              _.forEach(resp.body.checks, function (check) {
                self.checks[check.type] = _.cloneDeep(check);
              });
              var definedChecks = _.keys(self.checks);
              if (definedChecks.length < 4) {
                if (_.indexOf(definedChecks, "http") === -1) {
                  self.checks["http"] = defaultCheck("http");
                }
                if (_.indexOf(definedChecks, "https") === -1) {
                  self.checks["https"] = defaultCheck("https");
                }
                if (_.indexOf(definedChecks, "ping") === -1) {
                  self.checks["ping"] = defaultCheck("ping");
                }
                if (_.indexOf(definedChecks, "dns") === -1) {
                  self.checks["dns"] = defaultCheck("dns");
                }
              }
            });
          }
        }, {
          key: 'checkQuota',
          value: function checkQuota() {
            var self = this;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get quotas.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              _.forEach(resp.body, function (q) {
                if (q.target === "endpoint") {
                  if (q.limit > 0 && q.used >= q.limit) {
                    self.insufficientQuota = true;
                  }
                }
              });
              if (self.insufficientQuota) {
                return self.$q.reject("Endpoint quota reached.");
              }
              return true;
            });
          }
        }, {
          key: 'getProbes',
          value: function getProbes() {
            var self = this;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes').then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get getProbes.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.probes = resp.body;
              _.forEach(self.probes, function (probe) {
                _.forEach(probe.tags, function (t) {
                  if (!(t in self.probesByTag)) {
                    self.probesByTag[t] = [];
                  }
                  self.probesByTag[t].push(probe);
                });
              });
            });
          }
        }, {
          key: 'getOrgDetails',
          value: function getOrgDetails() {
            var self = this;
            var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org');
            p.then(function (resp) {
              self.org = resp;
            }, function (resp) {
              self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
            });
            return p;
          }
        }, {
          key: 'probeCount',
          value: function probeCount(check) {
            if (!check) {
              return 0;
            }
            return this.getProbesForCheck(check).length;
          }
        }, {
          key: 'getProbesForCheck',
          value: function getProbesForCheck(check) {
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
          key: 'totalChecks',
          value: function totalChecks(check) {
            if (check === undefined) {
              var self = this;
              return _.reduce(self.checks, function (total, value) {
                if (!value.enabled) {
                  return total;
                }

                return total + self.totalChecks(value);
              }, 0);
            }

            var probeCount = this.probeCount(check);
            if (probeCount < 1 || check.frequency < 1) {
              return 0;
            }

            return 30.4375 * 24 * (3600 / check.frequency) * probeCount / 1000000;
          }
        }, {
          key: 'requiresUpgrade',
          value: function requiresUpgrade() {
            if (!this.org) {
              return true;
            }

            if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free') {
              return false;
            }

            if (this.org.checksPerMonth / 1000000 + this.totalChecks() > 3) {
              return true;
            }

            return false;
          }
        }, {
          key: 'reset',
          value: function reset() {
            var self = this;
            this.discovered = false;
            this.discoveryInProgress = false;
            this.discoveryError = false;
            this.showConfig = false;
            this.showCreating = false;
            this.endpoint = {};
            self.checks = {};
          }
        }, {
          key: 'cancel',
          value: function cancel() {
            this.reset();
            this.ignoreChanges = true;
            this.$window.history.back();
          }
        }, {
          key: 'remove',
          value: function remove(endpoint) {
            var self = this;
            return this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/' + endpoint.id).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to delete endpoint.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.$location.path('plugins/raintank-worldping-app/page/endpoints');
            });
          }
        }, {
          key: 'updateEndpoint',
          value: function updateEndpoint() {
            this.endpoint.name = this.newEndpointName;
            this.saveEndpoint();
          }
        }, {
          key: 'tagsUpdated',
          value: function tagsUpdated() {
            this.saveEndpoint();
          }
        }, {
          key: 'savePending',
          value: function savePending(nextUrl) {
            var self = this;
            _.forEach(this.checks, function (check) {
              if (!check.id && check.enabled) {
                //add the check
                self.endpoint.checks.push(check);
                return;
              }
              for (var i = 0; i < self.endpoint.checks.length; i++) {
                if (self.endpoint.checks[i].id === check.id) {
                  self.endpoint.checks[i] = _.cloneDeep(check);
                }
              }
            });
            return this.saveEndpoint().then(function () {
              self.ignoreChanges = true;
              if (nextUrl) {
                self.$location.path(nextUrl);
              } else {
                self.$location.path("plugins/raintank-worldping-app/page/endpoints");
              }
            });
          }
        }, {
          key: 'saveEndpoint',
          value: function saveEndpoint() {
            var self = this;
            return this.backendSrv.put('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints', this.endpoint).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to update endpoint.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.endpoint = resp.body;
            });
          }
        }, {
          key: 'updateCheck',
          value: function updateCheck(check) {
            var self = this;

            if (check.id) {
              for (var i = 0; i < this.endpoint.checks.length; i++) {
                if (this.endpoint.checks[i].id === check.id) {
                  this.endpoint.checks[i] = _.cloneDeep(check);
                }
              }
            } else {
              this.endpoint.checks.push(check);
            }
            if (check.enabled) {
              var numProbes = self.probeCount(check);
              if (numProbes < check.healthSettings.num_collector) {
                check.healthSettings.num_collectors = numProbes;
              }
            }
            return this.saveEndpoint().then(function () {
              self.alertSrv.set(check.type + " check updated.", "", "success", 2000);
              _.forEach(self.endpoint.checks, function (c) {
                if (c.type === check.type) {
                  self.checks[check.type] = _.cloneDeep(c);
                }
              });
            });
          }
        }, {
          key: 'skipDiscovery',
          value: function skipDiscovery() {
            this.discoveryInProgress = false;
            this.showConfig = true;
            this.discoveryError = false;
          }
        }, {
          key: 'discover',
          value: function discover(endpoint) {
            if (!endpoint.name) {
              return;
            }
            var self = this;
            this.discoveryInProgress = true;
            this.discoveryError = false;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/discover', endpoint).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to update endpoint.", resp.meta.message, 'error', 10000);
                this.discoveryError = "Failed to discover endpoint.";
                return self.$q.reject(resp.meta.message);
              }
              self.endpoint = resp.body;
              _.forEach(self.endpoint.checks, function (check) {
                self.checks[check.type] = _.cloneDeep(check);
              });
              var definedChecks = _.keys(self.checks);
              if (definedChecks.length < 4) {
                if (_.indexOf(definedChecks, "http") === -1) {
                  self.checks["http"] = defaultCheck("http");
                }
                if (_.indexOf(definedChecks, "https") === -1) {
                  self.checks["https"] = defaultCheck("https");
                }
                if (_.indexOf(definedChecks, "ping") === -1) {
                  self.checks["ping"] = defaultCheck("ping");
                }
                if (_.indexOf(definedChecks, "dns") === -1) {
                  self.checks["dns"] = defaultCheck("dns");
                }
              }
              self.showConfig = true;
              self.discovered = true;
            }, function () {
              self.discoveryError = "Failed to discover endpoint.";
            }).finally(function () {
              self.discoveryInProgress = false;
            });
          }
        }, {
          key: 'addEndpoint',
          value: function addEndpoint() {
            var self = this;
            var delay = 120;
            var newChecks = [];
            _.forEach(this.checks, function (check) {
              if (check.enabled) {
                if (check.frequency < delay) {
                  delay = check.frequency;
                }
                var numProbes = self.probeCount(check);
                if (numProbes < 3) {
                  check.healthSettings.num_collectors = numProbes;
                }
                newChecks.push(check);
              }
            });
            this.endpoint.checks = newChecks;
            return this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints', this.endpoint).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to add endpoint.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              self.endpoint.id = resp.body.id;
              self.endpoint.slug = resp.body.slug;
              self.ignoreChanges = true;
              self.alertSrv.set("endpoint added", '', 'success', 3000);
              self.showCreating = true;
              self.endpointReadyDelay = delay;
              self.endpointReady = false;
              self.$timeout(function () {
                self.endpointReady = true;
              }, delay * 1000);
            });
          }
        }, {
          key: 'changesPending',
          value: function changesPending() {
            var self = this;
            var changes = false;
            var seenCheckTypes = {};

            //check if any existing checks have changed
            _.forEach(this.endpoint.checks, function (check) {
              seenCheckTypes[check.type] = true;
              if (!angular.equals(check, self.checks[check.type])) {
                changes = true;
              }
            });

            //check if any new checks added.
            _.forEach(_.keys(self.checks), function (type) {
              if (!(type in seenCheckTypes) && "frequency" in self.checks[type]) {
                changes = true;
              }
            });

            return changes;
          }
        }, {
          key: 'gotoDashboard',
          value: function gotoDashboard(endpoint, type) {
            var self = this;
            if (!type) {
              type = 'summary';
            }
            var search = {
              "var-collector": "All",
              "var-endpoint": this.endpoint.slug
            };
            switch (type) {
              case "summary":
                self.$location.path("/dashboard/db/worldping-endpoint-summary").search(search);
                break;
              case "ping":
                self.$location.path("/dashboard/db/worldping-endpoint-ping").search(search);
                break;
              case "dns":
                self.$location.path("/dashboard/db/worldping-endpoint-dns").search(search);
                break;
              case "http":
                search['var-protocol'] = "http";
                self.$location.path("/dashboard/db/worldping-endpoint-web").search(search);
                break;
              case "https":
                search['var-protocol'] = "https";
                self.$location.path("/dashboard/db/worldping-endpoint-web").search(search);
                break;
              default:
                self.$location.path("/dashboard/db/worldping-endpoint-summary").search(search);
                break;
            }
          }
        }]);

        return EndpointConfigCtrl;
      }());

      EndpointConfigCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_config.html';

      _export('EndpointConfigCtrl', EndpointConfigCtrl);
    }
  };
});
//# sourceMappingURL=endpoint_config.js.map
