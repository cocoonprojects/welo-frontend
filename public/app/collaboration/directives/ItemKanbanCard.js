(function() {
    "use strict";

    angular.module('app').directive('itemKanbanCard',[
        'itemService',
        function(itemService){
            return {
                restrict: 'E',
                scope: {
                    item: '=',
                    myId: '='
                  },
                replace: true,
                templateUrl: 'app/collaboration/partials/item-kanban-card.html',
                link: function($scope, element, attrs) {
                    $scope.picture = null;
                    $scope.position = null;
                    if ($scope.item.status === itemService.ITEM_STATUS.IDEA) {
                        $scope.picture = $scope.item.author.picture || 'img/account.jpg';
                        $scope.ownerAuthorName =  $scope.item.author.firstname + " " + $scope.item.author.lastname;
                        $scope.imInvolved = false;
                    } else if ($scope.item.status === itemService.ITEM_STATUS.OPEN) {
                        $scope.position = $scope.item.position || "  ";
                        $scope.ownerAuthorName =  "";
                        $scope.imInvolved = false;
                    } else {
                        var owner = itemService.getOwner($scope.item);
                        $scope.picture = owner.picture || 'img/account.jpg';
                        $scope.ownerAuthorName =  owner.firstname + " " + owner.lastname;
                        $scope.imInvolved = itemService.isIn($scope.item,$scope.myId);
                    }

                    $scope.subject = $scope.item.subject;
                    $scope.isDecision = ($scope.item.decision=="true");
                    
                    
                }
            };
        }
    ]);
}());