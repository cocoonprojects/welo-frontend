angular.module('app')
	.controller('BaseOrganizationController', [
		'$scope',
		'$log',
		'$stateParams',
        '$mdDialog',
		'members',
        'streams',
		'SelectedOrganizationId',
        'SetPriorityService',
        'sortedItemsService',
        'settingsService',
		'$state',
        function(
            $scope,
            $log,
            $stateParams,
            $mdDialog,
            members,
            streams,
			SelectedOrganizationId,
            SetPriorityService,
            sortedItemsService,
            settingsService,
			$state) {

                var STATES = ['org.collaboration','org.organizationStatement','org.flow','org.decisions','org.people', 'org.kanban', 'org.kanbanEditPriority'];
                var MINORSTATES = {
                    "org.item":"org.collaboration"
                };

                var checkSelectedStateIndex = function(currentState) {
                    //currentState = MINORSTATES[currentState] || currentState;
                    currentState = _.indexOf(STATES,currentState);
                    currentState = (currentState==5 || currentState==6)?0:currentState;
                    return currentState;
                };
    			if(!SelectedOrganizationId.get()){
    				$state.go("organizations");
    				return;
    			}

				$scope.organization = $scope.identity.getMembership($stateParams.orgId);
                $scope.members = members;
                $scope.stream = streams[0];
                $scope.user = function(member) {
                    if($scope.members && member) {
                        return $scope.members._embedded['ora:member'][member.id];
                    }
                    return null;
                };
				$scope.goBack = function() {
					window.history.back();
				};
                $scope.pillar = {};
                
                $scope.$on('$stateChangeSuccess',
                    function(event, toState) {
                        if(toState.data && toState.data.pillarName){
                            $scope.pillar.name = toState.data.pillarName;
                        }
                        if(toState.data && toState.data.pillarId){
                            $scope.pillar.id = toState.data.pillarId;
                        }else{
                            //TODO: understand if it's possible reset $scope.pillar on every $stateChangeSuccess
                            $scope.pillar.id = undefined;
                        }
                        if(toState.data && toState.data.selectedTab){
                            $scope.currentTab = toState.data.selectedTab;
                        }
                        if(toState.data && toState.data.showBack) {
                            $scope.showBack = true;
                        } else {
                            $scope.showBack = false;
                        }
						if(toState.data){
                            $scope.fullHeight = toState.data.fullHeight;
                        }

                    }
                );

                var selectedOrganizationId = SelectedOrganizationId.get();
                    if(selectedOrganizationId){
                        $scope.organizationId = selectedOrganizationId;
                    }else{
                        $scope.organizationId = null;
                        identity.loadMemberships().then(function(memberships){
                            if(memberships && memberships.length){
                                $scope.organizationId = memberships[0].organization.id;
                            }
                    });
                }

                $scope.navigationBarTabs = {
                    selectedIndex: checkSelectedStateIndex($state.current.name)
                };
                $scope.$on('$stateChangeSuccess',
                    function(event, toState) {
                        $scope.navigationBarTabs.selectedIndex = checkSelectedStateIndex(toState.name);
                        if(toState.name === 'org.kanban'){
                            var priorityManagedFromWelo = false;
                            settingsService.get($scope.organizationId).then(function(settings){
                                priorityManagedFromWelo = settings.manage_priorities === "1";

                                var useCanChangePriority =
                                        $scope.identity.getMembershipRole($scope.organizationId) === 'admin' ||
                                        $scope.identity.getMembershipRole($scope.organizationId) === 'member';
                                $scope.changePriorityAllowed = priorityManagedFromWelo && useCanChangePriority;
                            });
                        }
                    }
                );



                $scope.backFromKanbanEditPriority = function(isCanceling){
                    if(isCanceling){
                        $state.go("org.kanban", { orgId: $scope.organizationId });
                    }else{
                        var sortedItems = sortedItemsService.get();
                        if(sortedItems && !_.isEmpty(sortedItems)){
                            SetPriorityService.set($scope.organizationId, sortedItems).then(function(data){
                                $state.go("org.kanban", { orgId: $scope.organizationId });
                            }).catch(function(err){
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Error occurred')
                                        .htmlContent('<strong>Error occurred during save</strong> you will redirect to kanban')
                                        .ok('ok')
                                ).then(function(){
                                    $state.go("org.kanban", { orgId: $scope.organizationId, error: true });
                                });
                            })["finally"](function(){
                            });
                        }
                    }
                };
            }
		]);
