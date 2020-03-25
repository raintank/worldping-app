"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseToDigest = void 0;

var promiseToDigest = function promiseToDigest($scope) {
  return function (promise) {
    return promise["finally"]($scope.$evalAsync);
  };
};

exports.promiseToDigest = promiseToDigest;
//# sourceMappingURL=promiseToDigest.js.map
