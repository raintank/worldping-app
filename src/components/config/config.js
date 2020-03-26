import configTemplate from './config.html!text';
import DatasourceUpgrader from './dsUpgrade';
import { promiseToDigest } from '../../utils/promiseToDigest';

class WorldPingConfigCtrl {
  constructor($scope, $injector, $q, backendSrv, alertSrv, contextSrv, datasourceSrv) {
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.alertSrv = alertSrv;
    this.validKey = false;
    this.quotas = {};
    this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));
    this.org = null;
    this.datasourceUpgrader = new DatasourceUpgrader(contextSrv, backendSrv, $q, datasourceSrv, $scope);
    this.$scope = $scope;

    if (this.appModel.jsonData === null) {
      this.appModel.jsonData = {};
    }
    if (!this.appModel.secureJsonData) {
      this.appModel.secureJsonData = {};
    }
    if (this.appModel.enabled) {
      this.validateKey();
    }
  }

  reset() {
    this.appModel.jsonData.apiKeySet=false;
    this.validKey = false;
    this.errorMsg = "";
    this.org = null;
  }

  validateKey() {
    const self = this;
    const p = promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/v2/quotas'));
    p.then((resp) => {
      if (resp.meta.code !== 200) {
        self.alertSrv.set("failed to get Quotas", resp.message, 'error', 10000);
        return self.$q.reject(resp.message);
      }
      self.validKey = true;
      self.errorMsg = "";
      self.quotas = resp.body;

      self.getOrgDetails();
    }, (resp) => {
      if (self.appModel.enabled) {
        self.alertSrv.set("failed to verify apiKey", resp.statusText, 'error', 10000);
        self.appModel.enabled = false;
        self.appModel.jsonData.apiKeySet = false;
        self.appModel.secureJsonData.apiKey = "";
        self.errorMsg = "invalid apiKey";
        self.validKey = false;
      }
    });
    return p;
  }

  getOrgDetails() {
    const self = this;
    const p = promiseToDigest(this.$scope)(this.backendSrv.get('api/plugin-proxy/raintank-worldping-app/api/grafana-net/profile/org'));
    p.then((resp) => {
      self.org = resp;

      const millionChecksPerMonth = Math.ceil(parseInt(self.org.checksPerMonth, 10) / 100000) / 10;
      if (millionChecksPerMonth > 1000) {
        self.org.strChecksPerMonth = Math.ceil(millionChecksPerMonth / 1000) + ' Billion';
      } else if (millionChecksPerMonth > 0) {
        self.org.strChecksPerMonth = millionChecksPerMonth + ' Million';
      } else {
        self.org.strChecksPerMonth = 'N/A';
      }
    }, (resp) => {
      self.alertSrv.set("failed to get Org Details", resp.statusText, 'error', 10000);
    });
    return p;
  }

  preUpdate() {
    var model = this.appModel;
    if (!model.enabled) {
      model.jsonData.apiKeySet = false;
      model.secureJsonData.apiKey = "";
      return this.$q.resolve();
    }

    if (!model.jsonData.apiKeySet && !model.secureJsonData.apiKey) {
      model.enabled = false;
      this.errorMsg = "apiKey not set";
      this.validKey = false;
      return this.$q.reject("apiKey not set.");
    }

    this.datasourceUpgrader.upgraded = true;
    model.jsonData.apiKeySet = true;
    return this.$q.resolve();
  }

  postUpdate() {
    if (!this.appModel.enabled) {
      return this.$q.resolve();
    }
    var self = this;
    return this.validateKey()
    .then(() => {
      return self.datasourceUpgrader.upgrade().then(() => {
        self.appEditCtrl.importDashboards().then(() => {
          return {
            url: "dashboard/db/worldping-home",
            message: "worldPing app installed!"
          };
        });
      });
    });
  }
}

WorldPingConfigCtrl.template = configTemplate;

export {
  WorldPingConfigCtrl as ConfigCtrl
};
