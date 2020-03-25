export const promiseToDigest = $scope => (promise) => promise.finally($scope.$evalAsync);
