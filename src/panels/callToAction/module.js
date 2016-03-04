define([
  'app/features/panel/panel_ctrl',
  "lodash"
], function(panel, _) {

  /** @ngInject */
  function CallToActionPanel($scope, $injector, backendSrv) {
    panel.PanelCtrl.call(this, $scope, $injector);

    $scope.endpointStatus = "scopeEndpoints";
    $scope.userStatus = "scopeUsers";
    $scope.collectorStatus = "scopeCollectors";

    $scope.setEndpointStatus = function() {
      if (! $scope.quotas) {
        return;
      }
      if ($scope.quotas.endpoint.used === 0) {
        $scope.endpointStatus = "noEndpoints";
        return;
      }
      if ($scope.quotas.endpoint.used >= 1) {
        $scope.endpointStatus = "hasEndpoints";
        return;
      }
      //default.
      $scope.endpointStatus = "hasEndpoints";
      return;
    };

    $scope.setUserStatus = function() {
      if (! $scope.quotas) {
        return;
      }
      if ($scope.quotas.org_user.used <= 1) {
        $scope.userStatus = "noTeam";
        return;
      }
      if ($scope.quotas.org_user.used >= 2) {
        $scope.userStatus = "hasTeam";
        return;
      }
      //default.
      $scope.userStatus = "hasTeam";
      return;
    };

    $scope.setCollectorStatus = function() {
      if (! $scope.quotas) {
        return;
      }
      if ($scope.quotas.collector.used === 0) {
        $scope.collectorStatus = "noCollectors";
        return;
      }
      if ($scope.quotas.collector.used >= 1) {
        $scope.collectorStatus = "hasCollectors";
        return;
      }
      //default.
      $scope.collectorStatus = "hasCollectors";
      return;
    };

    $scope.allDone = function() {
      if (! $scope.quotas) {
        return false;
      }
      if ($scope.quotas.collector.used === 0) {
        return false;
      }
      if ($scope.quotas.org_user.used <= 1) {
        return false;
      }
      if ($scope.quotas.endpoint.used === 0) {
        return false;
      }
      //default.
      return true;
    };

    this.refresh = function() {
      backendSrv.get('api/plugin-proxy/worldping/api/org/quotas').then(function(quotas) {
        var quotaHash = {};
        _.forEach(quotas, function(q) {
          quotaHash[q.target] = q;
        });
        $scope.quotas = quotaHash;
        $scope.setEndpointStatus();
        $scope.setUserStatus();
        $scope.setCollectorStatus();
      });
    };
  }

  CallToActionPanel.templateUrl = 'public/plugins/worldpingcta/module.html'
  CallToActionPanel.prototype = Object.create(panel.PanelCtrl.prototype);
  CallToActionPanel.prototype.constructor = CallToActionPanel;

  return {
    PanelCtrl: CallToActionPanel
  };
});
