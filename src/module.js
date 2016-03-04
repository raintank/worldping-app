import {ConfigCtrl} from './components/config/config';
import {EndpointListCtrl} from './components/endpoint/endpoint_list';
import {loadPluginCss} from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/worldping-app/css/dark.css',
  light: 'plugins/worldping-app/css/light.css'
});

export {
  EndpointListCtrl,
  ConfigCtrl
};
