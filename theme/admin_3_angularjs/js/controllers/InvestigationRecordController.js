/**
 * Created by tim_song on 4/26/2017.
 */
angular.module('MetronicApp').controller('InvestigationRecordController', ['$rootScope', '$scope', '$state' ,'$stateParams', 'settings', function($rootScope, $scope, $state, $stateParams, settings) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();

        // set default layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;


    });
}]);