import {ConfigCtrl} from './components/config/config';
import {EndpointListCtrl} from './components/endpoint/endpoint_list';
import {EndpointDetailsCtrl} from './components/endpoint/endpoint_details';
import {EndpointConfigCtrl} from './components/endpoint/endpoint_config';
import {ProbeListCtrl} from './components/probe/probe_list';
import {ProbeDetailsCtrl} from './components/probe/probe_details';
import {ProbeCreateCtrl} from './components/probe/probe_create';
import {loadPluginCss} from 'app/plugins/sdk';
import './filters/all';
import './directives/all';

loadPluginCss({
  dark: 'plugins/raintank-worldping-app/css/worldping.dark.css',
  light: 'plugins/raintank-worldping-app/css/worldping.light.css'
});

export {
  EndpointListCtrl,
  EndpointDetailsCtrl,
  EndpointConfigCtrl,
  ProbeListCtrl,
  ProbeDetailsCtrl,
  ProbeCreateCtrl,
  ConfigCtrl
};
