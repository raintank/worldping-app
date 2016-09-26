'use strict';

System.register(['./components/config/config', './components/endpoint/endpoint_list', './components/endpoint/endpoint_details', './components/endpoint/endpoint_config', './components/probe/probe_list', './components/probe/probe_details', './components/probe/probe_create', 'app/plugins/sdk', './filters/all', './directives/all'], function (_export, _context) {
  "use strict";

  var ConfigCtrl, EndpointListCtrl, EndpointDetailsCtrl, EndpointConfigCtrl, ProbeListCtrl, ProbeDetailsCtrl, ProbeCreateCtrl, loadPluginCss;
  return {
    setters: [function (_componentsConfigConfig) {
      ConfigCtrl = _componentsConfigConfig.ConfigCtrl;
    }, function (_componentsEndpointEndpoint_list) {
      EndpointListCtrl = _componentsEndpointEndpoint_list.EndpointListCtrl;
    }, function (_componentsEndpointEndpoint_details) {
      EndpointDetailsCtrl = _componentsEndpointEndpoint_details.EndpointDetailsCtrl;
    }, function (_componentsEndpointEndpoint_config) {
      EndpointConfigCtrl = _componentsEndpointEndpoint_config.EndpointConfigCtrl;
    }, function (_componentsProbeProbe_list) {
      ProbeListCtrl = _componentsProbeProbe_list.ProbeListCtrl;
    }, function (_componentsProbeProbe_details) {
      ProbeDetailsCtrl = _componentsProbeProbe_details.ProbeDetailsCtrl;
    }, function (_componentsProbeProbe_create) {
      ProbeCreateCtrl = _componentsProbeProbe_create.ProbeCreateCtrl;
    }, function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }, function (_filtersAll) {}, function (_directivesAll) {}],
    execute: function () {

      loadPluginCss({
        dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
        light: 'plugins/raintank-worldping-app/css/worldping.light.css'
      });

      _export('EndpointListCtrl', EndpointListCtrl);

      _export('EndpointDetailsCtrl', EndpointDetailsCtrl);

      _export('EndpointConfigCtrl', EndpointConfigCtrl);

      _export('ProbeListCtrl', ProbeListCtrl);

      _export('ProbeDetailsCtrl', ProbeDetailsCtrl);

      _export('ProbeCreateCtrl', ProbeCreateCtrl);

      _export('ConfigCtrl', ConfigCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
