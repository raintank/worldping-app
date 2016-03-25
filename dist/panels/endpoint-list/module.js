'use strict';

System.register(['../../filters/all', '../../directives/all', 'lodash', 'app/plugins/sdk'], function (_export, _context) {
  var _, PanelCtrl, loadPluginCss, _typeof, _createClass, _get, EndpointListCtrl;

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
    setters: [function (_filtersAll) {}, function (_directivesAll) {}, function (_lodash) {
      _ = _lodash.default;
    }, function (_appPluginsSdk) {
      PanelCtrl = _appPluginsSdk.PanelCtrl;
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

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

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      loadPluginCss({
        dark: 'plugins/worldping-app/css/worldping.dark.css',
        light: 'plugins/worldping-app/css/worldping.light.css'
      });

      _export('PanelCtrl', EndpointListCtrl = function (_PanelCtrl) {
        _inherits(EndpointListCtrl, _PanelCtrl);

        /** @ngInject */

        function EndpointListCtrl($scope, $injector, $location, backendSrv) {
          _classCallCheck(this, EndpointListCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EndpointListCtrl).call(this, $scope, $injector));

          _this.backendSrv = backendSrv;
          _this.$location = $location;
          _this.pageReady = false;
          _this.statuses = [{ label: "Ok", value: 0 }, { label: "Warning", value: 1 }, { label: "Error", value: 2 }, { label: "Unknown", value: -1 }];
          _this.filter = { 'tag': '', 'status': '' };
          _this.sort_field = 'name';
          _this.endpoints = [];
          _this.refresh();
          _this.endpointState = {
            "0": 0,
            "1": 0,
            "2": 0,
            "-1": 0
          };
          return _this;
        }

        _createClass(EndpointListCtrl, [{
          key: 'initEditMode',
          value: function initEditMode() {
            _get(Object.getPrototypeOf(EndpointListCtrl.prototype), 'initEditMode', this).call(this);
            this.icon = 'fa fa-text-width';
            this.addEditorTab('Options', 'public/plugins/worldping-app/panels/endpoint-list/editor.html');
            this.editorTabIndex = 1;
          }
        }, {
          key: 'refresh',
          value: function refresh() {
            this.getEndpoints();
            this.getMonitorTypes();
          }
        }, {
          key: 'endpointTags',
          value: function endpointTags() {
            var map = {};
            _.forEach(this.endpoints, function (endpoint) {
              _.forEach(endpoint.tags, function (tag) {
                map[tag] = true;
              });
            });
            return Object.keys(map);
          }
        }, {
          key: 'setTagFilter',
          value: function setTagFilter(tag) {
            this.filter.tag = tag;
          }
        }, {
          key: 'setStatusFilter',
          value: function setStatusFilter(status) {
            if (status === this.filter.status) {
              status = "";
            }
            this.filter.status = status;
          }
        }, {
          key: 'statusFilter',
          value: function statusFilter(actual, expected) {
            if (expected === "" || expected === null) {
              return true;
            }
            var equal = actual === expected;
            return equal;
          }
        }, {
          key: 'getMonitorTypes',
          value: function getMonitorTypes() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/worldping-app/api/monitor_types').then(function (types) {
              var typesMap = {};
              _.forEach(types, function (type) {
                typesMap[type.id] = type;
              });
              self.monitor_types = typesMap;
            });
          }
        }, {
          key: 'isEndPointReady',
          value: function isEndPointReady(endpoint) {
            return endpoint && endpoint.hasOwnProperty('ready') && endpoint.ready;
          }
        }, {
          key: 'getEndpoints',
          value: function getEndpoints() {
            var self = this;
            this.backendSrv.get('api/plugin-proxy/worldping-app/api/endpoints').then(function (endpoints) {
              self.pageReady = true;
              _.forEach(endpoints, function (endpoint) {
                endpoint.states = [];
                endpoint.monitors = {};
                endpoint.ready = false;
                self.backendSrv.get('api/plugin-proxy/worldping-app/api/monitors', { "endpoint_id": endpoint.id }).then(function (monitors) {
                  var seenStates = {};
                  _.forEach(monitors, function (mon) {
                    if (!mon.enabled) {
                      return;
                    }
                    seenStates[mon.state] = true;
                    endpoint.monitors[self.monitor_types[mon.monitor_type_id].name.toLowerCase()] = mon;
                  });
                  for (var s in seenStates) {
                    self.endpointState[s]++;
                    endpoint.states.push(parseInt(s));
                  }
                  endpoint.ready = true;
                });
              });
              self.endpoints = endpoints;
            });
          }
        }, {
          key: 'remove',
          value: function remove(endpoint) {
            var self = this;
            this.backendSrv.delete('api/plugin-proxy/worldping-app/api/endpoints/' + endpoint.id).then(function () {
              self.getEndpoints();
            });
          }
        }, {
          key: 'monitorStateTxt',
          value: function monitorStateTxt(endpoint, type) {
            var mon = endpoint.monitors[type];
            if ((typeof mon === 'undefined' ? 'undefined' : _typeof(mon)) !== "object") {
              return "disabled";
            }
            if (!mon.enabled) {
              return "disabled";
            }
            if (mon.state < 0 || mon.state > 2) {
              return 'nodata';
            }
            var states = ["online", "warn", "critical"];
            return states[mon.state];
          }
        }, {
          key: 'monitorStateChangeStr',
          value: function monitorStateChangeStr(endpoint, type) {
            var mon = endpoint.monitors[type];
            if ((typeof mon === 'undefined' ? 'undefined' : _typeof(mon)) !== "object") {
              return "";
            }
            var duration = new Date().getTime() - new Date(mon.state_change).getTime();
            if (duration < 10000) {
              return "for a few seconds ago";
            }
            if (duration < 60000) {
              var secs = Math.floor(duration / 1000);
              return "for " + secs + " seconds";
            }
            if (duration < 3600000) {
              var mins = Math.floor(duration / 1000 / 60);
              return "for " + mins + " minutes";
            }
            if (duration < 86400000) {
              var hours = Math.floor(duration / 1000 / 60 / 60);
              return "for " + hours + " hours";
            }
            var days = Math.floor(duration / 1000 / 60 / 60 / 24);
            return "for " + days + " days";
          }
        }, {
          key: 'gotoDashboard',
          value: function gotoDashboard(endpoint) {
            this.$location.path("/dashboard/db/worldping-endpoint-summary").search({ "var-collector": "All", "var-endpoint": endpoint.slug });
          }
        }, {
          key: 'gotoEndpointURL',
          value: function gotoEndpointURL(endpoint) {
            this.$location.url('plugins/worldping-app/page/endpoint-details?endpoint=' + endpoint.id);
          }
        }]);

        return EndpointListCtrl;
      }(PanelCtrl));

      EndpointListCtrl.templateUrl = 'public/plugins/worldping-app/components/endpoint/partials/endpoint_list.html';

      _export('PanelCtrl', EndpointListCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
