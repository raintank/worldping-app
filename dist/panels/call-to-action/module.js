'use strict';

System.register(['lodash', 'app/plugins/sdk', '../../components/config/dsUpgrade'], function (_export, _context) {
  "use strict";

  var _, PanelCtrl, loadPluginCss, DatasourceUpgrader, _createClass, CallToActionCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appPluginsSdk) {
      PanelCtrl = _appPluginsSdk.PanelCtrl;
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }, function (_componentsConfigDsUpgrade) {
      DatasourceUpgrader = _componentsConfigDsUpgrade.default;
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

      loadPluginCss({
        dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
        light: 'plugins/raintank-worldping-app/css/worldping.light.css'
      });

      _export('PanelCtrl', CallToActionCtrl = function (_PanelCtrl) {
        _inherits(CallToActionCtrl, _PanelCtrl);

        /** @ngInject */
        function CallToActionCtrl($scope, $injector, $location, $q, backendSrv, alertSrv, contextSrv, datasourceSrv) {
          _classCallCheck(this, CallToActionCtrl);

          var _this = _possibleConstructorReturn(this, (CallToActionCtrl.__proto__ || Object.getPrototypeOf(CallToActionCtrl)).call(this, $scope, $injector));

          _this.backendSrv = backendSrv;
          _this.alertSrv = alertSrv;
          _this.$location = $location;
          _this.$q = $q;
          _this.datasourceSrv = datasourceSrv;

          _this.quotas = null;
          _this.endpointStatus = "scopeEndpoints";
          _this.collectorStatus = "scopeCollectors";
          _this.requiresUpgrade = null;
          _this.currentlyTrial = null;
          _this.aboveFreeTier = null;

          _this.getOrgDetails();
          _this.datasourceUpgrader = new DatasourceUpgrader(contextSrv, backendSrv, $q, datasourceSrv);
          return _this;
        }

        _createClass(CallToActionCtrl, [{
          key: 'setEndpointStatus',
          value: function setEndpointStatus() {
            if (!this.quotas) {
              return;
            }
            if (this.quotas.endpoint.used === 0) {
              this.endpointStatus = "noEndpoints";
              return;
            }
            if (this.quotas.endpoint.used >= 1) {
              this.endpointStatus = "hasEndpoints";
              return;
            }
            //default.
            this.endpointStatus = "hasEndpoints";
            return;
          }
        }, {
          key: 'setCollectorStatus',
          value: function setCollectorStatus() {
            if (!this.quotas) {
              return;
            }
            if (this.quotas.probe.used === 0) {
              this.collectorStatus = "noCollectors";
              return;
            }
            if (this.quotas.probe.used >= 1) {
              this.collectorStatus = "hasCollectors";
              return;
            }
            //default.
            this.collectorStatus = "hasCollectors";
            return;
          }
        }, {
          key: 'getOrgDetails',
          value: function getOrgDetails() {
            var self = this;
            var p = this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org');
            p.then(function (resp) {
              self.org = resp;

              var millionChecksPerMonth = Math.ceil(parseInt(self.org.checksPerMonth, 10) / 100000) / 10;
              if (millionChecksPerMonth > 1000) {
                self.org.strChecksPerMonth = 'using ' + Math.ceil(millionChecksPerMonth / 1000) + ' Billion checks/mo';
              } else if (millionChecksPerMonth > 0) {
                self.org.strChecksPerMonth = 'using ' + millionChecksPerMonth + ' Million checks/mo';
              } else {
                self.org.strChecksPerMonth = 'not using any checks yet';
              }

              self.requiresUpgrade = self._requiresUpgrade();
              self.currentlyTrial = self._currentlyTrial();
              self.aboveFreeTier = self._aboveFreeTier();
            }, function (resp) {
              self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
            });
            return p;
          }
        }, {
          key: '_currentlyTrial',
          value: function _currentlyTrial() {
            if (!this.org) {
              return false;
            }

            if (this.org.wpPlan === 'trial') {
              return true;
            }

            return false;
          }
        }, {
          key: '_requiresUpgrade',
          value: function _requiresUpgrade() {
            if (!this.org) {
              return true;
            }

            if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free' && this.org.wpPlan !== 'trial') {
              return false;
            }

            return true;
          }
        }, {
          key: '_aboveFreeTier',
          value: function _aboveFreeTier() {
            if (!this.org) {
              return false;
            }

            if (this.org.wpPlan !== '' && this.org.wpPlan !== 'free') {
              return false;
            }

            if (this.org.checksPerMonth / 1000000 > 1) {
              return true;
            }

            return false;
          }
        }, {
          key: 'allDone',
          value: function allDone() {
            if (!this.quotas) {
              return false;
            }
            if (this.quotas.probe.used === 0) {
              return false;
            }
            if (this.quotas.endpoint.used === 0) {
              return false;
            }
            //default.
            return true;
          }
        }, {
          key: 'refresh',
          value: function refresh() {
            var self = this;
            return this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas').then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get quotas.", resp.meta.message, 'error', 10000);
                return self.$q.reject(resp.meta.message);
              }
              var quotaHash = {};
              _.forEach(resp.body, function (q) {
                quotaHash[q.target] = q;
              });
              self.quotas = quotaHash;
              self.setEndpointStatus();
              self.setCollectorStatus();
            });
          }
        }]);

        return CallToActionCtrl;
      }(PanelCtrl));

      CallToActionCtrl.templateUrl = 'public/plugins/raintank-worldping-app/panels/call-to-action/module.html';

      _export('PanelCtrl', CallToActionCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
