/**
 * Created by tim_song on 4/26/2017.
 */
/* Setup general page controller */
angular.module('MetronicApp').controller('NewInvestigationController', ['$rootScope', '$scope', '$state' ,'settings', function($rootScope, $scope, $state, settings) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();

        // set default layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;


    });

}]);


