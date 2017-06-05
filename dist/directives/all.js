'use strict';

System.register(['angular', 'lodash'], function (_export, _context) {
  "use strict";

  var angular, _;

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {

      angular.module('grafana.directives').directive("rtEndpointHealthDashboard", function () {
        return {
          templateUrl: 'public/plugins/raintank-worldping-app/directives/partials/endpointHealthDashboard.html',
          scope: {
            ctrl: "=",
            endpoint: "="
          }
        };
      });

      angular.module('grafana.directives').directive("rtCheckHealth", function ($compile, datasourceSrv, timeSrv) {
        return {
          templateUrl: 'public/plugins/raintank-worldping-app/directives/partials/checkHealth.html',
          scope: {
            check: "=",
            ctrl: "="
          },
          link: function link(scope) {
            timeSrv.init({
              time: { from: "now-" + (scope.check.frequency + 30) + 's', to: "now" }
            });
            var metricsQuery = {
              range: timeSrv.timeRange(),
              rangeRaw: timeSrv.timeRange(true),
              interval: scope.check.frequency + 's',
              targets: [{ target: "worldping." + scope.ctrl.endpoint.slug + ".*." + scope.check.type.toLowerCase() + ".{ok_state,error_state}" }],
              format: 'json',
              maxDataPoints: 10
            };

            var datasource = datasourceSrv.get('raintank');
            datasource.then(function (ds) {
              ds.query(metricsQuery).then(function (results) {
                showHealth(results);
              }, function () {
                showHealth({ data: [] });
              });
            });

            function showHealth(metrics) {
              var okCount = 0;
              var errorCount = 0;
              var unknownCount = 0;
              var collectorResults = {};
              _.forEach(metrics.data, function (result) {
                var parts = result.target.split('.');
                var stateStr = parts[4];
                var collector = parts[2];
                if (!(collector in collectorResults)) {
                  collectorResults[collector] = { ts: -1, state: -1 };
                }

                //start with the last point and work backwards till we find a non-null value.
                for (var i = result.datapoints.length - 1; i >= 0; i--) {
                  var point = result.datapoints[i];
                  if (!isNaN(point[0])) {
                    if (point[0] === 1 && point[1] > collectorResults[collector].ts) {
                      collectorResults[collector].ts = point[1];
                      switch (stateStr) {
                        case 'ok_state':
                          collectorResults[collector].state = 0;
                          break;
                        case 'error_state':
                          collectorResults[collector].state = 2;
                          break;
                        default:
                          collectorResults[collector].state = -1;
                          console.log("unknown state returned. this shouldnt happen :(");
                      }
                      break;
                    }
                  }
                }
              });
              for (var col in collectorResults) {
                switch (collectorResults[col].state) {
                  case 0:
                    okCount++;
                    break;
                  case 2:
                    errorCount++;
                    break;
                  default:
                    unknownCount++;
                }
              }
              var unknowns = scope.ctrl.getProbesForCheck(scope.check.type).length - Object.keys(collectorResults).length;
              unknownCount += unknowns;

              scope.okCount = okCount;
              scope.errorCount = errorCount;
              scope.unknownCount = unknownCount;
              scope.eventReady = true;
            }
          }
        };
      });

      angular.module('grafana.directives').directive("rtEndpointHealth", function () {
        return {
          templateUrl: 'public/plugins/raintank-worldping-app/directives/partials/endpointHealth.html',
          scope: {
            endpoint: "=",
            ctrl: "="
          }
        };
      });

      angular.module('grafana.directives').directive('endpointProbeSelect', function ($compile, $window, $timeout) {
        return {
          scope: {
            probes: "=",
            model: "="
          },
          templateUrl: 'public/plugins/raintank-worldping-app/directives/partials/endpointCollectorSelect.html',
          link: function link(scope, elem) {
            var bodyEl = angular.element($window.document.body);
            var selectedIds = [];

            scope.init = function () {
              if (!scope.model) {
                scope.model = { route: { config: { ids: [] } } };
              } else if (!scope.model.route) {
                scope.model.route = { config: { ids: [] } };
              } else if (!scope.model.route.config) {
                scope.model.route.config = { ids: [] };
              } else if (!scope.model.route.config.ids) {
                scope.model.route.config.ids = [];
              }
              selectedIds = scope.model.route.config.ids;
              scope.footprint = { value: 'static' };
              scope.error = false;
              scope.reset();
            };

            scope.reset = function () {
              scope.error = false;
              scope.ids = [];
              //build out our list of collectorIds
              var sortedProbes = _.sortBy(scope.probes, function (o) {
                return o.name.toLowerCase();
              });
              _.forEach(sortedProbes, function (c) {
                var option = { id: c.id, selected: false, text: c.name };
                if (_.indexOf(selectedIds, c.id) >= 0) {
                  option.selected = true;
                }
                scope.ids.push(option);
              });
            };

            scope.show = function () {
              scope.reset();
              scope.selectorOpen = true;
              scope.giveFocus = 1;

              $timeout(function () {
                bodyEl.on('click', scope.bodyOnClick);
              }, 0, false);
            };

            scope.idSelected = function (option) {
              option.selected = !option.selected;
            };

            scope.selectAll = function () {
              var select = true;
              selectedIds = _.map(_.filter(scope.ids, { selected: true }), "id");

              if (selectedIds.length === scope.ids.length) {
                select = false;
              }
              _.forEach(scope.ids, function (option) {
                option.selected = select;
              });
            };

            scope.selectIdTitle = function () {
              selectedIds = _.map(_.filter(scope.ids, { selected: true }), "id");
              if (selectedIds.length === 0) {
                return "Select Probes";
              }
              if (selectedIds.length <= 2) {
                return _.map(_.filter(scope.ids, { selected: true }), "text").join(", ");
              }
              return _.map(_.filter(scope.ids, { selected: true }), "text").slice(0, 2).join(", ") + " and " + (selectedIds.length - 2) + " more";
            };

            scope.hide = function () {
              scope.model.route = {
                type: "byIds",
                config: {
                  ids: []
                }
              };
              selectedIds = _.map(_.filter(scope.ids, { selected: true }), "id");
              _.forEach(selectedIds, function (c) {
                scope.model.route.config.ids.push(c);
              });
              scope.selectorOpen = false;
              bodyEl.off('click', scope.bodyOnClick);
            };

            scope.bodyOnClick = function (e) {
              var dropdown = elem.find('.variable-value-dropdown');
              if (dropdown.has(e.target).length === 0) {
                scope.$apply(scope.hide);
              }
            };

            scope.$watch('model.id', function () {
              scope.init();
            });
          }
        };
      });
    }
  };
});
//# sourceMappingURL=all.js.map
