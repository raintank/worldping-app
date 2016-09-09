import _ from 'lodash';
import angular from 'angular';

var defaultRoute = {
  type: "byIds",
  config: {
    ids: []
  }
};
var defaultHealthSettings = {
  num_collectors: 3,
  steps: 3
};

var defaultCheck = {
  settings: {},
  healthSettings: {
    notifications: {}
  },
  route: {
    type: "byIds",
    config: {
      "ids": []
    }
  }
};

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

    this.pageReady = false;
    this.showCreating = false;
    self.insufficientQuota = false;

    this.frequencyOpts = [];
    var freqOpt = [10, 30, 60, 120];
    _.forEach(freqOpt, function(f) {
      self.frequencyOpts.push({value: f, label: "Every "+f+"s"});
    });

    this.newEndpointName = "";
    this.checks = {};
    this.endpoint = {};
    this.probes = [];
    this.probesByTag = {};

    this.ignoreChanges = false;

    var promises = [];
    self.reset();
    if ("endpoint" in $location.search()) {
      promises.push(self.getEndpoint($location.search().endpoint));
    } else {
      // make sure we have sufficient quota.
      promises.push(self.checkQuota());
      this.endpoint = {name: ""};
    }

    promises.push(this.getProbes());
    $q.all(promises).then(function() {
      self.pageReady = true;
      $timeout(function() {
        $anchorScroll();
      }, 0, false);
    }, function(err) {
      alertSrv.set("endpoint config init failed", err, 'error', 10000);
    });

    if ($location.search().check) {
      switch($location.search().check) {
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
        var nextUrl = next.substring(baseLen);
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
    var self = this;
    var id = parseInt(idString);
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/'+id).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get endpoint.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.endpoint = resp.body;
      self.newEndpointName = self.endpoint.name;
      _.forEach(resp.body.checks, function(check) {
        self.checks[check.type] = _.cloneDeep(check);
      });
      var definedChecks = _.keys(self.checks);
      if (definedChecks.length < 4) {
        if (_.indexOf(definedChecks, "http") === -1) {
          self.checks["http"] = _.cloneDeep(defaultCheck);
          self.checks["http"].type = "http";
        }
        if (_.indexOf(definedChecks, "https") === -1) {
          self.checks["https"] = _.cloneDeep(defaultCheck);
          self.checks["https"].type = "https";
        }
        if (_.indexOf(definedChecks, "ping") === -1) {
          self.checks["ping"] = _.cloneDeep(defaultCheck);
          self.checks["ping"].type = "ping";
        }
        if (_.indexOf(definedChecks, "dns") === -1) {
          self.checks["dns"] = _.cloneDeep(defaultCheck);
          self.checks["dns"].type = "dns";
        }
      }
    });
  }

  checkQuota() {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get quotas.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      _.forEach(resp.body, function(q) {
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

  getProbes() {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/probes').then(function(resp) {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get getProbes.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.probes = resp.body;
      defaultRoute.config.ids = [];
      _.forEach(self.probes, function(probe) {
        defaultRoute.config.ids.push(probe.id);
        _.forEach(probe.tags, function(t) {
          if (!(t in self.probesByTag)) {
            self.probesByTag[t] = [];
          }
          self.probesByTag[t].push(probe);
        });
      });
    });
  }

  probeCount(check) {
    if (!check) {
      return 0;
    }
    return this.getProbesForCheck(check).length;
  }

  getProbesForCheck(check) {
    if (check.route.type === "byIds") {
      return check.route.config.ids;
    } else if (check.route.type === "byTags") {
      var probeList = {};
      _.forEach(this.probes, function(p) {
        _.forEach(check.route.config.tags, function(t) {
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

  totalChecks(check) {
    if (check === undefined) {
      var self = this;
      return _.reduce(self.checks, function(total, value) {
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

    return (30.5 * 24 * (3600/check.frequency) * probeCount / 1000000) + 0.5;
  }

  reset() {
    var self = this;
    this.discovered = false;
    this.discoveryInProgress = false;
    this.discoveryError = false;
    this.showConfig = false;
    this.showCreating = false;
    this.endpoint = {};
    self.checks = {};
  }

  cancel() {
    this.reset();
    this.ignoreChanges = true;
    this.$window.history.back();
  }

  remove(endpoint) {
    var self = this;
    return this.backendSrv.delete('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/' + endpoint.id).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to delete endpoint.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.$location.path('plugins/raintank-worldping-app/page/endpoints');
    });
  }

  updateEndpoint() {
    this.endpoint.name = this.newEndpointName;
    this.saveEndpoint();
  }

  tagsUpdated() {
    this.saveEndpoint();
  }

  savePending(nextUrl) {
    var self = this;
    _.forEach(this.checks, function(check) {
      if (!check.id && check.enabled) {
        //add the check
        self.endpoint.checks.push(check);
        return;
      }
      for (var i=0; i < self.endpoint.checks.length; i++) {
        if (self.endpoint.checks[i].id === check.id) {
          self.endpoint.checks[i] = _.cloneDeep(check);
        }
      }
    });
    return this.saveEndpoint().then(() => {
      self.ignoreChanges = true;
      if (nextUrl) {
        self.$location.path(nextUrl);
      } else {
        self.$location.path("plugins/raintank-worldping-app/page/endpoints");
      }
    });
  }

  saveEndpoint() {
    var self = this;
    return this.backendSrv.put('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints', this.endpoint).then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to update endpoint.", resp.meta.message, 'error', 10000);
        return self.$q.reject(resp.meta.message);
      }
      self.endpoint = resp.body;
    });
  }

  updateCheck(check) {
    var self = this;

    if (check.id) {
      for (var i=0; i < this.endpoint.checks.length; i++) {
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
    return this.saveEndpoint().then(() => {
      self.alertSrv.set(check.type + " check updated.", "", "success", 2000);
      _.forEach(self.endpoint.checks, function(c) {
        if (c.type === check.type) {
          self.checks[check.type] = _.cloneDeep(c);
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
    var self = this;
    this.discoveryInProgress = true;
    this.discoveryError = false;
    return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints/discover', endpoint).then(function(resp) {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to update endpoint.", resp.meta.message, 'error', 10000);
        this.discoveryError = "Failed to discover endpoint.";
        return self.$q.reject(resp.meta.message);
      }
      self.endpoint = resp.body;
      _.forEach(self.endpoint.checks, function(check) {
        check.route = _.cloneDeep(defaultRoute);
        check.healthSettings = _.cloneDeep(defaultHealthSettings);
        self.checks[check.type] = _.cloneDeep(check);
      });
      var definedChecks = _.keys(self.checks);
      if (definedChecks.length < 4) {
        if (_.indexOf(definedChecks, "http") === -1) {
          self.checks["http"] = _.cloneDeep(defaultCheck);
          self.checks["http"].type = "http";
        }
        if (_.indexOf(definedChecks, "https") === -1) {
          self.checks["https"] = _.cloneDeep(defaultCheck);
          self.checks["https"].type = "https";
        }
        if (_.indexOf(definedChecks, "ping") === -1) {
          self.checks["ping"] = _.cloneDeep(defaultCheck);
          self.checks["ping"].type = "ping";
        }
        if (_.indexOf(definedChecks, "dns") === -1) {
          self.checks["dns"] = _.cloneDeep(defaultCheck);
          self.checks["dns"].type = "dns";
        }
      }
      self.showConfig = true;
      self.discovered = true;
    }, function() {
      self.discoveryError = "Failed to discover endpoint.";
    }).finally(function() {
      self.discoveryInProgress = false;
    });
  }

  addEndpoint() {
    var self = this;
    var delay = 120;
    var newChecks = [];
    _.forEach(this.checks, function(check) {
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
    return this.backendSrv.post('api/plugin-proxy/raintank-worldping-app/api/v2/endpoints', this.endpoint)
    .then(function(resp) {
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
      self.$timeout(function() {
        self.endpointReady = true;
      }, delay * 1000);
    });
  }

  changesPending() {
    var self = this;
    var changes = false;
    var seenCheckTypes = {};

    //check if any existing checks have changed
    _.forEach(this.endpoint.checks, function(check) {
      seenCheckTypes[check.type] = true;
      if (!angular.equals(check, self.checks[check.type])) {
        changes = true;
      }
    });

    //check if any new checks added.
    _.forEach(_.keys(self.checks), function(type) {
      if (!(type in seenCheckTypes) && ("frequency" in self.checks[type])) {
        changes = true;
      }
    });

    return changes;
  }

  gotoDashboard(endpoint, type) {
    var self = this;
    if (!type) {
      type = 'summary';
    }
    var search = {
      "var-collector": "All",
      "var-endpoint": this.endpoint.slug
    };
    switch(type) {
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
}

EndpointConfigCtrl.templateUrl = 'public/plugins/raintank-worldping-app/components/endpoint/partials/endpoint_config.html';

export {EndpointConfigCtrl};
