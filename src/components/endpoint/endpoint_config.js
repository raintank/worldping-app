import _ from 'lodash';
import angular from 'angular';
import { promiseToDigest } from '../../utils/promiseToDigest';

var _defaultCheck = {
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
        body: '',
        method: "GET",
        host: "",
        downloadLimit: '',
        expectRegex: ""
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
        body: '',
        method: "GET",
        host: "",
        validateCert: true,
        downloadLimit: '',
        expectRegex: ""
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
        type: "A",
        expectRegex: "",
      };
      check.frequency = 120;
      break;
  }
  return check;
}

class EndpointConfigCtrl {
  /** @ngInject */
  constructor($scope, $injector, $rootScope, $location, $modal, $anchorScroll, $timeout, $window, $q, backendSrv, alertSrv) {
    var self = this;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.$timeout = $timeout;
    this.$q = $q;
    this.alertSrv = alertSrv;
    this.$window = $window;
    this.$scope = $scope;

    this.pageReady = false;
    this.showCreating = false;
    this.insufficientQuota = false;

    this.frequencyOpts = [];
    var freqOpt = [10, 30, 60, 120];
    _.forEach(freqOpt, f => {
      this.frequencyOpts.push({value: f, label: "Every "+f+"s"});
    });

    this.newEndpointName = "";
    this.checks = {};
    this.endpoint = {};
    this.probes = [];
    this.probesByTag = {};
    this.org = null;
    this.quotas = {};

    this.ignoreChanges = false;

    var promises = [];
    this.reset();
    if ("endpoint" in $location.search()) {
      promises.push(this.getEndpoint($location.search().endpoint));
      promises.push(this.getQuotas());
    } else {
      // make sure we have sufficient quota.
      promises.push(this.checkQuota());
      this.endpoint = {name: ""};
    }

    promises.push(this.getProbes());
    promises.push(this.getOrgDetails());

    $q.all(promises).then(() => {
      this.pageReady = true;
      $timeout(function() {
        $anchorScroll();
      }, 0, false);
    }, function(err) {
      alertSrv.set("endpoint config init failed", err, 'error', 10000);
    });

    if ($location.search().check) {
      switch($location.search().check) {
        case "ping":
          this.showPing = true;
          break;
        case "dns":
          this.showDNS = true;
          break;
        case "http":
          this.showHTTP = true;
          break;
        case "https":
          this.showHTTPS = true;
          break;
      }
    }

    $window.onbeforeunload = function() {
      if (self.ignoreChanges) { return; }
      if (self.changesPending()) {
        return "There are unsaved changes to this dashboard";
      }
    };

    $scope.$on('$locationChangeStart', function(event, next) {
      if ((!self.ignoreChanges) && (self.changesPending())) {
        event.preventDefault();
        var baseLen = $location.absUrl().length - $location.url().length;
        console.log("next: ", next);
        console.log("baseLen: ", baseLen);
        var nextUrl = next.substring(baseLen);
        console.log("nexUrl: ", nextUrl);
        var modalScope = $scope.$new();
        modalScope.ignore = function() {
          self.ignoreChanges = true;
          $location.url(nextUrl);
          return;
        };

        modalScope.save = function() {
          self.savePending(nextUrl);
        };

        $rootScope.appEvent('show-modal', {
          src: 'public/app/partials/unsaved-changes.html',
          modalClass: 'confirm-modal',
          scope: modalScope,
        });
      }
    });
  }

  getEndpoint(idString) {
    var id = parseInt(idString);
    return promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/'+id).then(resp => {
      if (resp.meta.code !== 200) {
        this.alertSrv.set("failed to get endpoint.", resp.meta.message, 'error', 10000);
        return this.$q.reject(resp.meta.message);
      }
      this.endpoint = resp.body;
      this.newEndpointName = this.endpoint.name;
      _.forEach(resp.body.checks, check => {
        this.checks[check.type] = _.cloneDeep(check);
      });
      var definedChecks = _.keys(this.checks);
      if (definedChecks.length < 4) {
        if (_.indexOf(definedChecks, "http") === -1) {
          this.checks["http"] = defaultCheck("http");
        }
        if (_.indexOf(definedChecks, "https") === -1) {
          this.checks["https"] = defaultCheck("https");
        }
        if (_.indexOf(definedChecks, "ping") === -1) {
          this.checks["ping"] = defaultCheck("ping");
        }
        if (_.indexOf(definedChecks, "dns") === -1) {
          this.checks["dns"] = defaultCheck("dns");
        }
      }
    }));
  }

  getQuotas() {
    return promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then(resp => {
      if (resp.meta.code !== 200) {
        this.alertSrv.set("failed to get quotas.", resp.meta.message, 'error', 10000);
        return this.$q.reject(resp.meta.message);
      }
      _.forEach(resp.body, q => {
        this.quotas[q.target] = q;
      });
      return this.quotas;
    }));
  }

  checkQuota() {
    return this.getQuotas().then(quotas => {
      if (quotas.endpoint) {
        const q = quotas.endpoint;
        this.insufficientQuota = q.limit > 0 && q.used >= q.limit;
      }
      if (this.insufficientQuota) {
        return this.$q.reject("Endpoint quota reached.");
      }
      return true;
    });
  }

  getProbes() {
    return promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes').then(resp => {
      if (resp.meta.code !== 200) {
        this.alertSrv.set("failed to get getProbes.", resp.meta.message, 'error', 10000);
        return this.$q.reject(resp.meta.message);
      }
      this.probes = resp.body;
      _.forEach(this.probes, probe => {
        _.forEach(probe.tags, t => {
          if (!(t in this.probesByTag)) {
            this.probesByTag[t] = [];
          }
          this.probesByTag[t].push(probe);
        });
      });
    }));
  }

  getOrgDetails() {
    return promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org').then(
      resp => {
        this.org = resp;
      },
      resp => {
        this.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
      }
    ));
  }

  probeCount(check) {
    if (!check) {
      return 0;
    }
    return this.getProbesForCheck(check).length;
  }

  getProbesForCheck(check) {
    if (check.route.type === "byIds") {
      return check.route.config.ids || [];
    }

    if (check.route.type === "byTags") {
      var probeList = {};
      _.forEach(this.probes, p => {
        _.forEach(check.route.config.tags, t => {
          if (_.indexOf(p.tags, t) !== -1) {
            probeList[p.id] = true;
          }
        });
      });
      return _.keys(probeList);
    }

    this.alertSrv("check has unknown routing type.", "unknown route type.", "error", 5000);
    return [];
  }

  totalChecks(check) {
    if (check === undefined) {
      return _.reduce(this.checks, (total, value) => {
        if (!value.enabled) {
          return total;
        }

        return total + this.totalChecks(value);
      }, 0);
    }

    var probeCount = this.probeCount(check);
    if (probeCount < 1 || check.frequency < 1) {
      return 0;
    }

    return (30.4375 * 24 * (3600/check.frequency) * probeCount / 1000000);
  }

  formatSize(size) {
    if (size > 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + ' MB';
    }
    if (size > 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    }
    return size;
  }

  currentlyTrial() {
    if (!this.org) {
      return false;
    }

    if (this.org.wpPlan === 'trial') {
      return true;
    }

    return false;
  }

  requiresUpgrade() {
    if (!this.org) {
      return true;
    }

    if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free' && this.org.wpPlan !== 'trial') {
      return false;
    }

    if (this.org.checksPerMonth / 1000000 + this.totalChecks() > 1) {
      return true;
    }

    return false;
  }

  reset() {
    this.discovered = false;
    this.discoveryInProgress = false;
    this.discoveryError = false;
    this.showConfig = false;
    this.showCreating = false;
    this.endpoint = {};
    this.checks = {};
  }

  cancel() {
    this.reset();
    this.ignoreChanges = true;
    this.$window.history.back();
  }

  remove(endpoint) {
    return promiseToDigest(this.$scope)
      (this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/' + endpoint.id).then(resp => {
        if (resp.meta.code !== 200) {
          this.alertSrv.set("failed to delete endpoint.", resp.meta.message, 'error', 10000);
          return this.$q.reject(resp.meta.message);
        }
        this.$location.path('plugins/raintank-worldping-app/page/endpoints');
      })
    );
  }

  updateEndpoint() {
    this.endpoint.name = this.newEndpointName;
    this.saveEndpoint();
  }

  tagsUpdated() {
    this.saveEndpoint();
  }

  savePending(nextUrl) {
    _.forEach(this.checks, check => {
      if (!check.id && check.enabled) {
        //add the check
        this.endpoint.checks.push(check);
        return;
      }
      for (var i=0; i < this.endpoint.checks.length; i++) {
        if (this.endpoint.checks[i].id === check.id) {
          this.endpoint.checks[i] = _.cloneDeep(check);
        }
      }
    });
    return this.saveEndpoint().then(() => {
      this.ignoreChanges = true;
      if (nextUrl) {
        this.$location.url(nextUrl);
      } else {
        this.$location.path("plugins/raintank-worldping-app/page/endpoints");
      }
    });
  }

  saveEndpoint() {
    return promiseToDigest(this.$scope)
    (this.backendSrv.put('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints', this.endpoint).then(resp => {
        if (resp.meta.code !== 200) {
          this.alertSrv.set("failed to update endpoint.", resp.meta.message, 'error', 10000);
          return this.$q.reject(resp.meta.message);
        }
        this.endpoint = resp.body;
      })
    );
  }

  updateCheck(check) {
    if (check.enabled) {
      var numProbes = this.probeCount(check);
      if (numProbes < check.healthSettings.num_collector) {
        check.healthSettings.num_collectors = numProbes;
      }
      if (check.type === "http" || check.type === "https") {
        if (['PUT', 'POST', 'DELETE', 'PATCH'].indexOf(check.settings.method) < 0) {
          check.settings.body = "";
        }
      }
    }
    var found = false;
    for (var i=0; i < this.endpoint.checks.length; i++) {
      if (this.endpoint.checks[i].type === check.type) {
        this.endpoint.checks[i] = _.cloneDeep(check);
        found = true;
        break;
      }
    }
    if (!found) {
      this.endpoint.checks.push(check);
    }
    return this.saveEndpoint().then(() => {
      this.alertSrv.set(check.type + " check updated.", "", "success", 2000);
      _.forEach(this.endpoint.checks, c => {
        if (c.type === check.type) {
          this.checks[check.type] = _.cloneDeep(c);
        }
      });
    });
  }

  skipDiscovery() {
    this.discoveryInProgress = false;
    this.showConfig = true;
    this.discoveryError = false;
  }

  discover(endpoint) {
    if (!endpoint.name){
      return;
    }
    this.discoveryInProgress = true;
    this.discoveryError = false;
    return promiseToDigest(this.$scope)
      (this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/discover', endpoint).then(
        resp => {
          if (resp.meta.code !== 200) {
            this.alertSrv.set("failed to update endpoint.", resp.meta.message, 'error', 10000);
            this.discoveryError = "Failed to discover endpoint.";
            return this.$q.reject(resp.meta.message);
          }
          this.endpoint = resp.body;
          _.forEach(this.endpoint.checks, check => {
            this.checks[check.type] = _.cloneDeep(check);
          });
          var definedChecks = _.keys(this.checks);
          if (definedChecks.length < 4) {
            if (_.indexOf(definedChecks, "http") === -1) {
              this.checks["http"] = defaultCheck("http");
            }
            if (_.indexOf(definedChecks, "https") === -1) {
              this.checks["https"] = defaultCheck("https");
            }
            if (_.indexOf(definedChecks, "ping") === -1) {
              this.checks["ping"] =defaultCheck("ping");
            }
            if (_.indexOf(definedChecks, "dns") === -1) {
              this.checks["dns"] = defaultCheck("dns");
            }
          }
          this.showConfig = true;
          this.discovered = true;
        },
        () => {
          this.discoveryError = "Failed to discover endpoint.";
        }
      ).finally(() => {
        this.discoveryInProgress = false;
      })
    );
  }

  addEndpoint() {
    var self = this;
    var delay = 120;
    var newChecks = [];
    _.forEach(this.checks, check => {
      if (check.enabled) {
        if (check.frequency < delay) {
          delay = check.frequency;
        }
        var numProbes = this.probeCount(check);
        if (numProbes < 3) {
          check.healthSettings.num_collectors = numProbes;
        }
        newChecks.push(check);
      }
    });
    this.endpoint.checks = newChecks;
    return promiseToDigest(this.$scope)
      (this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints', this.endpoint).then(resp => {
        if (resp.meta.code !== 200) {
          this.alertSrv.set("failed to add endpoint.", resp.meta.message, 'error', 10000);
          return this.$q.reject(resp.meta.message);
        }
        this.endpoint.id = resp.body.id;
        this.endpoint.slug = resp.body.slug;
        this.ignoreChanges = true;
        this.alertSrv.set("endpoint added", '', 'success', 3000);
        this.showCreating = true;
        this.endpointReadyDelay = delay;
        this.endpointReady = false;
        this.$timeout(function() {
          self.endpointReady = true;
        }, delay * 1000);
      })
    );
  }

  changesPending() {
    var changes = false;
    var seenCheckTypes = {};

    //check if any existing checks have changed
    _.forEach(this.endpoint.checks, check => {
      seenCheckTypes[check.type] = true;
      if (!angular.equals(check, this.checks[check.type])) {
        changes = true;
      }
    });

    //check if any new checks added.
    _.forEach(this.checks, check => {
      if (!(check.type in seenCheckTypes) && ("frequency" in check) && check.enabled) {
        changes = true;
      }
    });

    return changes;
  }

  gotoDashboard(endpoint, type) {
    if (!type) {
      type = 'summary';
    }
    var search = {
      "var-collector": "All",
      "var-endpoint": this.endpoint.slug
    };
    switch(type) {
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
}

EndpointConfigCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_config.html';

export {EndpointConfigCtrl};
