'use strict';

System.register(['angular', 'lodash'], function (_export, _context) {
  var angular, _, _typeof;

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };


      //var module = angular.module('grafana.directives');

      angular.module('grafana.directives').directive("rtEndpointHealthDashboard", function () {
        return {
          templateUrl: 'public/plugins/worldping-app/directives/partials/endpointHealthDashboard.html',
          scope: {
            ctrl: "=",
            endpoint: "="
          }
        };
      });

      angular.module('grafana.directives').directive("rtCheckHealth", function ($compile, datasourceSrv, timeSrv) {
        return {
          templateUrl: 'public/plugins/worldping-app/directives/partials/checkHealth.html',
          scope: {
            model: "="
          },
          link: function link(scope) {
            scope.$watch("model", function (monitor) {
              scope.eventReady = false;
              if ((typeof monitor === 'undefined' ? 'undefined' : _typeof(monitor)) === "object") {
                timeSrv.init({
                  time: { from: "now-" + (monitor.frequency + 30) + 's', to: "now" }
                });
                var metricsQuery = {
                  range: timeSrv.timeRange(),
                  rangeRaw: timeSrv.timeRange(true),
                  interval: monitor.frequency + 's',
                  targets: [{ target: "litmus." + monitor.endpoint_slug + ".*." + monitor.monitor_type_name.toLowerCase() + ".{ok_state,warn_state,error_state}" }],
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
              }
            });

            function showHealth(metrics) {
              var okCount = 0;
              var warnCount = 0;
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
                        case 'warn_state':
                          collectorResults[collector].state = 1;
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
                  case 1:
                    warnCount++;
                    break;
                  case 2:
                    errorCount++;
                    break;
                  default:
                    unknownCount++;
                }
              }
              var unknowns = scope.model.collectors.length - Object.keys(collectorResults).length;
              unknownCount += unknowns;

              scope.okCount = okCount;
              scope.warnCount = warnCount;
              scope.errorCount = errorCount;
              scope.unknownCount = unknownCount;
              scope.eventReady = true;
            }
          }
        };
      });

      angular.module('grafana.directives').directive("rtEndpointHealth", function () {
        return {
          templateUrl: 'public/plugins/worldping-app/directives/partials/endpointHealth.html',
          scope: {
            endpoint: "=",
            ctrl: "="
          }
        };
      });

      angular.module('grafana.directives').directive('endpointCollectorSelect', function ($compile, $window, $timeout) {
        return {
          scope: {
            collectors: "=",
            model: "="
          },
          templateUrl: 'public/plugins/worldping-app/directives/partials/endpointCollectorSelect.html',
          link: function link(scope, elem) {
            var bodyEl = angular.element($window.document.body);
            var currentIds = scope.model.collector_ids;
            var currentTags = scope.model.collector_tags;
            scope.init = function () {
              currentIds = scope.model.collector_ids;
              currentTags = scope.model.collector_tags;
              scope.footprint = { value: "static" };
              scope.error = false;

              // determine if we are using static or dynamic allocation.
              if (currentIds.length > 0) {
                scope.footprint.value = 'static';
                _.forEach(scope.tags, function (t) {
                  t.selected = false;
                });
              } else if (currentTags.length > 0) {
                scope.footprint.value = 'dynamic';
                _.forEach(scope.ids, function (i) {
                  i.selected = false;
                });
              }
              scope.reset();
            };

            scope.reset = function () {
              scope.error = false;
              scope.ids = [];
              scope.tags = [];
              //build out our list of collectorIds and tags
              var seenTags = {};
              _.forEach(scope.collectors, function (c) {
                var option = { id: c.id, selected: false, text: c.name };
                if (_.indexOf(currentIds, c.id) >= 0) {
                  option.selected = true;
                }
                _.forEach(c.tags, function (t) {
                  if (!(t in seenTags)) {
                    seenTags[t] = true;
                    var o = { selected: false, text: t };
                    if (_.indexOf(currentTags, t) >= 0) {
                      o.selected = true;
                    }
                    scope.tags.push(o);
                  }
                });
                scope.ids.push(option);
              });
              if (scope.footprint.value === 'dynamic') {
                _.forEach(scope.ids, function (i) {
                  i.selected = false;
                });
              } else {
                _.forEach(scope.tags, function (t) {
                  t.selected = false;
                });
              }
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
              var selectedIds = _.filter(scope.ids, { selected: true });

              if (selectedIds.length === scope.ids.length) {
                select = false;
              }
              _.forEach(scope.ids, function (option) {
                option.selected = select;
              });
            };

            scope.tagSelected = function (option) {
              option.selected = !option.selected;
            };

            scope.collectorsWithTags = function () {
              var collectorList = {};
              _.forEach(scope.collectors, function (c) {
                _.forEach(_.filter(scope.tags, { selected: true }), function (t) {
                  if (_.indexOf(c.tags, t.text) !== -1) {
                    collectorList[c.name] = true;
                  }
                });
              });
              return Object.keys(collectorList).join(', ');
            };

            scope.collectorCount = function (tag) {
              var count = 0;
              _.forEach(scope.collectors, function (c) {
                if (_.indexOf(c.tags, tag.text) !== -1) {
                  count++;
                }
              });
              return count;
            };

            scope.selectTagTitle = function () {
              var selectedTags = _.filter(scope.tags, { selected: true });
              if (selectedTags.length <= 2) {
                return _.pluck(selectedTags, 'text').join(", ");
              }
              return _.pluck(selectedTags, 'text').slice(0, 2).join(", ") + " and " + (selectedTags.length - 2) + " more";
            };

            scope.selectIdTitle = function () {
              var selectedIds = _.filter(scope.ids, { selected: true });
              if (selectedIds.length <= 2) {
                return _.pluck(selectedIds, 'text').join(", ");
              }
              return _.pluck(selectedIds, 'text').slice(0, 2).join(", ") + " and " + (selectedIds.length - 2) + " more";
            };

            scope.hide = function () {
              var selectedIds = _.filter(scope.ids, { selected: true });
              var selectedTags = _.filter(scope.tags, { selected: true });
              if (selectedIds.length === 0 && selectedTags.length === 0) {
                scope.error = "at least 1 option must be selected.";
                return;
              }

              scope.model.collector_ids.splice(0, scope.model.collector_ids.length);
              _.forEach(selectedIds, function (c) {
                scope.model.collector_ids.push(c.id);
              });
              scope.model.collector_tags.splice(0, scope.model.collector_tags.length);
              _.forEach(selectedTags, function (t) {
                scope.model.collector_tags.push(t.text);
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

            //scope.init();
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
