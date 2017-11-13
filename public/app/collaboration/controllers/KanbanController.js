angular.module('app.collaboration')
	.controller('KanbanController', [
		'$scope',
		'$log',
		'$stateParams',
		'$mdDialog',
		'$mdToast',
		'streamService',
		'itemService',
		'$state',
		'kanbanizeLaneService',
		'$q',
		function (
			$scope,
			$log,
			$stateParams,
			$mdDialog,
			$mdToast,
			streamService,
			itemService,
			$state,
			kanbanizeLaneService,
			$q) {

			$scope.menu = {
				open:false
			};
			$scope.closeLeft();

			$scope.currentUserId = $scope.identity.getId();
			//$scope.changeUpdateTime = false;
			//$scope.changeStatusTime = false;
			//$scope.streams = null;
			$scope.lanes = null;
			//$scope.isLoadingMore = false;
			$scope.loadingItems = true;
			$scope.ITEM_STATUS = itemService.ITEM_STATUS;
			$scope.kanbanItems = {};

			$scope.isAllowed = function(command, resource) {
				return itemService.isAllowed(command, resource);
			};

			$scope.openNewItem = function(ev, decision, itemType) {
				$mdDialog.show({
					controller: NewItemController,
					controllerAs: 'dialogCtrl',
					templateUrl: "app/collaboration/partials/new-item.html",
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						orgId: $stateParams.orgId,
						streams: [$scope.stream],
						decisionMode: decision,
						lanes: $scope.lanes,
						itemType: itemType
					}
				}).then($scope.onItemAdded);
			};

			$scope.onItemAdded = function(newItem){
				getItemForKanban();
				$mdDialog.show({
					controller: "OnItemAddedDialogController",
					templateUrl: "app/collaboration/partials/on-item-added-dialog.html",
					clickOutsideToClose: true,
					locals: {
						item: newItem
					}
				}).then(function(){
					$state.go('org.item',{
						orgId: newItem.organization.id,
						itemId: newItem.id
					});
				});
			};

			var getItemForStatus = function(stateId, kanbanItems) {
				var deferred = $q.defer();
				var filters = {
					offset: 0,
					limit: 30,
					status: stateId,
					cardType: "All",
					memberId: null,
					orderBy: "position", 
					orderType: "asc"
				};
				itemService.query($stateParams.orgId, filters,
					function(data) {
						_(kanbanItems).each(function(lane, idlane){
							if (idlane!==0) {
								lane.cols[stateId] = _.filter(data._embedded['ora:task'],function(item) {
									if (item.lane == idlane) {
										return true;
									} else {
										return false;
									}
								});
							} else {
								lane.cols[stateId] = data._embedded['ora:task'];
							}
							
						});
						deferred.resolve(kanbanItems);
					},
					function(response) {
						deferred.reject(response);
					});
				return deferred.promise;	
			};


			var getItemForKanban = function() {
				$scope.loadingItems = true;

				getItemForStatus($scope.ITEM_STATUS.IDEA, $scope.kanbanItems).then(function(kanbanItems){
					getItemForStatus($scope.ITEM_STATUS.OPEN,kanbanItems).then(function() {
						getItemForStatus($scope.ITEM_STATUS.ONGOING,kanbanItems).then(function() {
							getItemForStatus($scope.ITEM_STATUS.COMPLETED,kanbanItems).then(function() {
								getItemForStatus($scope.ITEM_STATUS.ACCEPTED,kanbanItems).then(function() {
									getItemForStatus($scope.ITEM_STATUS.CLOSED,kanbanItems).then(function() {
										$scope.loadingItems = false;
										$scope.kanbanItems = kanbanItems;
									});
								});
							});
						});
					});
				}, function(response){
					onHttpGenericError(response);
				});

			};

			$scope.goToDetail = function($event,item){
				$event.preventDefault();
				$event.stopPropagation();
				$state.go("org.item",{ orgId: item.organization.id, itemId: item.id });
			}; 
			
			var onHttpGenericError  = function(httpResponse) {
				alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
				$log.warn(httpResponse);
			};

  
			/* $scope.loadMore = function() {
				$scope.loadingItems = true;
				$scope.filters.offset = $scope.items._embedded['ora:task'].length;
				itemService.query($stateParams.orgId, $scope.filters,
					function(data) {
						$scope.isLoadingMore = false;
						$scope.loadingItems = false;
						$scope.items._embedded['ora:task'] = $scope.items._embedded['ora:task'].concat(data._embedded['ora:task']);
					},
					function(response) {
						$scope.isLoadingMore = false;
						$scope.loadingItems = false;
						that.onLoadingError(response);
				});
			}; */

			//INIT
			kanbanizeLaneService.getLanes($stateParams.orgId).then(function (lanes) {
				$scope.lanes = lanes;
				//Manage organization without lane as organization with lane
				if (!lanes.length) {
					$scope.kanbanItems[0] = {
						name: "Kanban",
						cols: {}
					};
				} else {
					lanes.forEach(function (lane) {
						if (lane.lcid !== null) {
							$scope.kanbanItems[lane.lcid] = {
								name: lane.lcname,
								cols: {}
							};
						}
					});
				}
				$scope.loadingItems = false;
				getItemForKanban();
			}, function (httpResponse) {
				onHttpGenericError(httpResponse);
				$scope.loadingItems = false;
			});


		}]);
