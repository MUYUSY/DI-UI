angular.module('MetronicApp').controller('DashboardController', function($rootScope, $scope, $window, $location, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    var locationChangeStartOff = $rootScope.$on('$locationChangeStart', locationChangeStart);

    function locationChangeStart(event) {
        clearInterval(statsInterval);
        clearInterval(volumeInterval);
        clearInterval(networkInterval);
        clearInterval(processInterval);
        clearInterval(systemInterval);
        clearInterval(fileInterval);
        clearInterval(registryInterval);
        console.log('done')
    }


});