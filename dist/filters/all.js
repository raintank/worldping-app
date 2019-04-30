"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_angular["default"].module('grafana.directives').filter('filterByTag', function () {
  return function (items, tag) {
    var filtered = [];

    if (!tag) {
      return items;
    }

    _lodash["default"].forEach(items || [], function (item) {
      if (_lodash["default"].indexOf(item.tags, tag) >= 0) {
        filtered.push(item);
      }
    });

    return filtered;
  };
});

_angular["default"].module('grafana.directives').filter('timeDuration', function () {
  return function (time) {
    var duration = new Date().getTime() - new Date(time).getTime();

    if (duration < 10000) {
      return "a few seconds ago";
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
  };
});
//# sourceMappingURL=all.js.map
