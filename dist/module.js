"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ConfigCtrl", {
  enumerable: true,
  get: function get() {
    return _config.ConfigCtrl;
  }
});
Object.defineProperty(exports, "EndpointListCtrl", {
  enumerable: true,
  get: function get() {
    return _endpoint_list.EndpointListCtrl;
  }
});
Object.defineProperty(exports, "EndpointDetailsCtrl", {
  enumerable: true,
  get: function get() {
    return _endpoint_details.EndpointDetailsCtrl;
  }
});
Object.defineProperty(exports, "EndpointConfigCtrl", {
  enumerable: true,
  get: function get() {
    return _endpoint_config.EndpointConfigCtrl;
  }
});
Object.defineProperty(exports, "ProbeListCtrl", {
  enumerable: true,
  get: function get() {
    return _probe_list.ProbeListCtrl;
  }
});
Object.defineProperty(exports, "ProbeDetailsCtrl", {
  enumerable: true,
  get: function get() {
    return _probe_details.ProbeDetailsCtrl;
  }
});
Object.defineProperty(exports, "ProbeCreateCtrl", {
  enumerable: true,
  get: function get() {
    return _probe_create.ProbeCreateCtrl;
  }
});

var _config = require("./components/config/config");

var _endpoint_list = require("./components/endpoint/endpoint_list");

var _endpoint_details = require("./components/endpoint/endpoint_details");

var _endpoint_config = require("./components/endpoint/endpoint_config");

var _probe_list = require("./components/probe/probe_list");

var _probe_details = require("./components/probe/probe_details");

var _probe_create = require("./components/probe/probe_create");

var _sdk = require("app/plugins/sdk");

require("./filters/all");

require("./directives/all");

(0, _sdk.loadPluginCss)({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});
//# sourceMappingURL=module.js.map
