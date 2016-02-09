define([
  'app/features/panel/panel_ctrl',
],
function (panel) {
  'use strict';

   /** @ngInject */
  function EndpointList($scope, $injector) {
    panel.PanelCtrl.call(this, $scope, $injector);
    $scope.refreshtrigger = false;
    this.refresh = function() {
      $scope.refreshtrigger = !$scope.refreshtrigger;
    }
  }
  EndpointList.templateUrl = 'public/plugins/worldpingendpointlist/module.html'
  EndpointList.prototype = Object.create(panel.PanelCtrl.prototype);
  EndpointList.prototype.constructor = EndpointList;

  return {
    PanelCtrl: EndpointList
  };
});
