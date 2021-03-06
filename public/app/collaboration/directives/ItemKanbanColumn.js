(function() {
    "use strict";

    angular.module('app').directive('itemKanbanColumn',[
        'itemService',
        '$state',
        function(itemService, $state){
            return {
                restrict: 'E',
                scope: {
                    columnTitle: '@',
                    columnItems: '=',
                    columnTotals: '=',
                    myId: '=',
                    priorityManaged: '='
                  },
                replace: true,
                templateUrl: 'app/collaboration/partials/item-kanban-column.html',
                link: function($scope, element, attrs) {

                    $scope.maxItemToShow = 6; //andrà letta dai settings
                    $scope.showMoreIsActive = false;

                    $scope.goToDetail = function($event,item){
                        $event.preventDefault();
                        $event.stopPropagation();
                        $state.go("org.item",{ orgId: item.organization.id, itemId: item.id });
                    }; 

                    $scope.hideElements = function() {
                        if ($scope.columnItems) {
                            return $scope.columnItems.length - $scope.maxItemToShow;
                        } else {
                            return 0;
                        }
                    };

                    $scope.toggleShowMore = function($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.showMoreIsActive = !$scope.showMoreIsActive;
                    };

                    $scope.isVisible = function($index) {
                        if ($scope.showMoreIsActive) {
                            return true;
                        } else if ($index<$scope.maxItemToShow) {
                            return true;
                        } else {
                            return false;
                        }    
                    };
                }
            };
        }
    ]);
}());