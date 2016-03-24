import _ from 'lodash';

class EndpointConfigCtrl {
   /** @ngInject */
  constructor($scope, $injector, $location, $modal, $anchorScroll, $timeout, $window, backendSrv, alertSrv) {
    var self = this;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.alertSrv = alertSrv;
    this.pageReady = false;
    this.monitorLastState = {};

    this.frequencyOpts = [];
    var freqOpt = [10, 30, 60, 120];
    _.forEach(freqOpt, function(f) {
      self.frequencyOpts.push({value: f, label: "Every "+f+"s"});
    });

    this.timeoutRegex = /^([1-9](\.\d)?|10)$/;
    this.editor = {index: 0};
    this.newEndpointName = "";
    this.allCollectors = [];
    this.collectorsOption = {selection: "all"};
    this.collectorsByTag = {};
    this.global_collectors = {collector_ids: [], collector_tags: []};
    this.ignoreChanges = false;
    this.originalState = {};
    this.discovered = false;
    this.discoveryInProgress = false;
    this.discoveryError = false;
    this.showConfig = false;
    
    this.defaultChecks = {
      http: {
        type: "http",
        settings: {
          "timeout": 5,
          "hostname": "",
          "port": 80,
          "path": "/",
          "method": "GET",
          "headers": "User-Agent: worldping-probe\nAccept-Encoding: gzip\n",
          "expectRegex": ""
        },
        enabled: false,
        frequency: 60,
        healthSettings: {
          steps: 3,
          numCollectors: 1,
          notifications: {
            enabled: false,
            addresses: ""
          }
        }
      },
      https: {
        type: "https",
        settings: {
          "timeout": 5,
          "hostname": "",
          "port": 443,
          "path": "/",
          "method": "GET",
          "headers": "User-Agent: worldping-probe\nAccept-Encoding: gzip\n",
          "expectRegex": "",
          "validateCert": true
        },
        enabled: false,
        frequency: 60,
        healthSettings: {
          steps: 3,
          numCollectors: 1,
          notifications: {
            enabled: false,
            addresses: ""
          }
        }
      },
      dns: {
        type: "dns",
        settings: {
          "timeout": 5,
          "hostname": "",
          "type": "A",
          "server": "8.8.8.8",
          "port": 53,
          "protocol": "udp"
        },
        enabled: false,
        frequency: 60,
        healthSettings: {
          steps: 3,
          numCollectors: 1,
          notifications: {
            enabled: false,
            addresses: ""
          }
        }
      },
      ping: {
        type: "ping",
        settings: {
          "hostname": "",
          "timeout": 5
        },
        enabled: false,
        frequency: 10,
        healthSettings: {
          steps: 3,
          numCollectors: 1,
          notifications: {
            enabled: false,
            addresses: ""
          }
        }
      }
    };
    this.endpoint = {"name": "", checks: _.values(this.defaultChecks)};
    this.endpoint_orig = {"name": "", checks: _.values(this.defaultChecks)};

    var promises = [];
    if ("endpoint" in $location.search()) {
      promises.push(this.getEndpoint($location.search().endpoint));
    } else {
      this.endpoint = {name: "", checks: _.values(this.defaultChecks)};
      this.pageReady = true;
    }

    promises.push(this.getCollectors());
    Promise.all(promises).then(function() {
      self.pageReady = true;
  
      $timeout(function() {
        $anchorScroll();
      }, 0, false);
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
  }

  getCollectors() {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/worldping-app/api/probes').then(function(collectors) {
      self.collectors = collectors;
      _.forEach(collectors, function(c) {
        self.allCollectors.push(c.id);
        _.forEach(c.tags, function(t) {
          if (!(t in self.collectorsByTag)) {
            self.collectorsByTag[t] = [];
          }
          self.collectorsByTag[t].push(c);
        });
      });
      self.global_collectors = {collector_ids: self.allCollectors, collector_tags: []};
    });
  }

  collectorCount(monitor) {
    var self = this;
    if (!monitor) {
      return 0;
    }
    var ids = {};
    _.forEach(monitor.collector_ids, function(id) {
      ids[id] = true;
    });
    _.forEach(monitor.collector_tags, function(t) {
      _.forEach(self.collectorsByTag[t], function(c) {
        ids[c.id] = true;
      });
    });
    return Object.keys(ids).length;
  }

  reset() {
    var self = this;
    this.discovered = false;
    this.discoveryInProgress = false;
    this.discoveryError = false;
    this.showConfig = false;
  }

  cancel() {
    this.reset();
    this.ignoreChanges = true;
    window.history.back();
  }

  getEndpoint(id) {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints/'+id).then(function(endpoint) {
      self.endpoint = endpoint;
      self.endpoint_orig = _.cloneDeep(endpoint);
    });
  }

  remove(endpoint) {
    var self = this;
    this.backendSrv.delete('api/plugin-proxy/worldping-app/api/endpoints/' + endpoint.id).then(function() {
      self.$location.path('plugins/worldping-app/page/endpoints');
    });
  }

  changeName() {
    this.endpoint_orig.name = this.endpoint.name;
    this.backendSrv.put('api/plugin-proxy/worldping-app/api/endpoints', this.endpoint_orig);
  }

  updateMonitor(check) {
    var self = this;
    for (var i = 0; i < this.endpoint_orig.checks.length; i++) {
      if (this.endpoint_orig.checks[i].type === check.type) {
        this.endpoint_orig.checks[i] = check;
      }
    }
    this.backendSrv.put('api/plugin-proxy/worldping-app/api/endpoints', this.endpoint_orig);
  }

  save(location) {
    var self = this;
    var promises = [];

    self.backendSrv.post('api/plugin-proxy/worldping-app/api/endpoints', self.endpoint).then(function() {
      if (location) {
        self.$location.path(location);
      } else {
        self.$location.path("plugins/worldping-app/page/endpoints");
      }
    });
  }

  parseSuggestions(suggestions) {
    var self = this;
    _.forEach(suggestions, function(c) {
      _.defaults(c, self.defaultChecks[c.type]);
    });
    this.endpoint.checks = suggestions;
  }

  skipDiscovery() {
    this.discoveryInProgress = false;
    this.showConfig = true;
    this.discoveryError = false;
  };

  monitors(type) {
    var check;
    _.forEach(this.endpoint.checks, function(c) {
      if (c.type === type) {
        check = c;
      }
    });
    return check;
  }

  orderChecks(check) {
    var order = {
      dns: 1,
      ping: 2,
      http: 3,
      https: 4
    };
    return order[check.type];
  }

  discover(endpoint) {
    var self = this;
    this.discoveryInProgress = true;
    this.discoveryError = false;
    this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints/discover', {name: endpoint.name}).then(function(resp) {
      if (!self.showConfig) {
        if (endpoint.name.indexOf("://") > -1) {
          //endpoint name is in the form scheme://domain
          var parser = document.createElement('a');
          parser.href = endpoint.name;
          endpoint.name = parser.hostname;
        }
        self.showConfig = true;
        self.discovered = true;
        self.parseSuggestions(resp);
      }
    }, function() {
      self.discoveryError = "Failed to discover endpoint.";
    }).finally(function() {
      self.discoveryInProgress = false;
    });
  }

  addEndpoint() {
    var self = this;
    this.backendSrv.post('api/plugin-proxy/worldping-app/api/endpoints', this.endpoint).then(function(resp) {
      self.endpoint = resp;
      self.endpoint_orig = _.cloneDeep(resp);

      self.ignoreChanges = true;
      self.alertSrv.set("endpoint added", '', 'success', 3000);
      self.$location.path("plugins/worldping-app/page/endpoints");
    });
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

EndpointConfigCtrl.templateUrl = 'public/plugins/worldping-app/components/endpoint/partials/endpoint_config.html';

export {EndpointConfigCtrl}