import _ from 'lodash';

var defaults = {
  name: '',
  enabled: true,
};

class ProbeCreateCtrl {
 /** @ngInject */
  constructor($scope, $injector, $location, $timeout, backendSrv) {
    var self = this;
    this.backendSrv = backendSrv;
    this.$location = $location;
    this.$timeout = $timeout;

    this.apiKey = "";

    this.collector = angular.copy(defaults);

    if ("probe" in $location.search()) {
      self.getCollector($location.search().probe);
    } else {
      self.reset();
    }
  }

  getCollector(id) {
    var self = this;
    return this.backendSrv.get('api/plugin-proxy/worldping-app/api/collectors/'+id).then(function(collector) {
      self.collector = collector;
    });
  }

  reset() {
    this.collector = angular.copy(defaults);
  }

  save() {
    return this.backendSrv.post('api/plugin-proxy/worldping-app/api/collectors', this.collector);
  };

  add() {
    var self = this;
    this.backendSrv.put('api/plugin-proxy/worldping-app/api/collectors', this.collector)
      .then(function(resp) {
        self.collector = resp;
      });
  };

  configInfo() {
    this.showConfigInfo = true;
  };

  defaultDistro() {
    this.showDistroConfig = false;
  }

  otherDistro() {
    this.showDistroConfig = true;
  }

  apiKey() {
    var self = this;
    var token = {
      role: 'Editor',
      name: "collector:" + $scope.collector.name
    };
    this.backendSrv.post('api/plugin-proxy/worldping-app/api/auth/keys', token).then(function(result) {
      self.apiKey = result.key;
      self.showApiKey = true;
    });
  };
}

ProbeCreateCtrl.templateUrl = 'public/plugins/worldping-app/components/probe/partials/probe_create.html'

export {ProbeCreateCtrl}

