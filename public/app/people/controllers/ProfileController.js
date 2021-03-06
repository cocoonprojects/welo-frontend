angular.module('app.people')
	.controller('ProfileController', [
		'$scope',
		'$http',
		'$log',
		'$stateParams',
		'memberService',
		'itemService',
		'accountService',
		'userEmailsService',
		'identity',
		'$mdDialog',
		function(
			$scope,
			$http,
			$log,
			$stateParams,
			memberService,
			itemService,
			accountService,
            userEmailsService,
			identity,
			$mdDialog) {

			$scope.myProfile = identity.getId() === $stateParams.memberId;

			$scope.profile = memberService.get({ orgId: $stateParams.orgId, memberId: $stateParams.memberId },function(){
				$scope.profile.editable = $scope.profile.email==identity.getEmail();
				$scope.profile.newSecondaryEmails = $scope.profile.secondaryEmails;
				if ($scope.profile.role === "admin") {
					$scope.profile.role = "member and admin";
				}
			});

			$scope.historyVisible = false;

			$scope.showHistory = function() {
				$scope.historyVisible = !$scope.historyVisible;
			};

			memberService.getHistory($stateParams.orgId, $stateParams.memberId).then(function(res){
				$scope.profileHistory = _.sortBy(res.data, function(historyEvent){
					return historyEvent.on;
				}).reverse();
			});

			$scope.askChangeRole = function(ev,newRole) {
				var message = "Are you sure you want to change the role of this user to ";
				message += newRole + "?";
			    var confirm = $mdDialog.confirm()
			          .title('Confirm')
			          .textContent(message)
			          .targetEvent(ev)
					  .ok('Ok')
          			  .cancel('Cancel');
			    $mdDialog.show(confirm).then(function(role) {
			     	memberService.changeMembership($stateParams.orgId, $scope.profile.id, newRole,function(data) {
						$scope.profile = memberService.get({ orgId: $stateParams.orgId, memberId: $stateParams.memberId });
					}, function(response) {
						alert('Generic Error during server communication (error: ' + response.status + ' ' + response.statusText + ') ');
						$log.warn(response);
					});
			    });
			};

			$scope.askChangeSecondaryEmails = function(ev) {
                $mdDialog.show({
                    controller: 'ProfileController',
                    templateUrl: 'app/people/partials/secondary-emails.html',
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    scope: $scope,
                    preserveScope: true
				});

            };

			$scope.tasks   = null;
			$scope.stats   = null;
			$scope.filters = {
				memberId: $stateParams.memberId
			};
			$scope.moreDetail = false;
			$scope.loading = true;
			$scope.initTasks = function() {
				itemService.query($stateParams.orgId, $scope.filters, function(data) {
					$scope.tasks = data._embedded['ora:task'];
					$http({
						method: 'GET',
						url: '/api/'+$stateParams.orgId+'/accounting/members/'+$stateParams.memberId+"?v=1",
						// url: '/api/'+$stateParams.orgId+'/accounting/members/'+$stateParams.memberId,
						headers: { 'GOOGLE-JWT': identity.getToken() }
					}).then(function(res){
						$scope.credits = res.data;
					})["finally"](function(){
						$scope.loading = false;
					});

					// accountService.fullPersonalStats($stateParams.orgId, {}).then(function(data){
					// 	$scope.credits = data.userStats;
					// })["finally"](function(){
					// 	$scope.loading = false;
					// });
				}, function(response) {
					alert('Generic Error during server communication (error: ' + response.status + ' ' + response.statusText + ') ');
					$log.warn(response);
				});
				$scope.stats = itemService.userStats($stateParams.orgId, $scope.filters);
			};

			$scope.isOwned = function(task){
				return !!_.find(_.values(task.members),function(membership){
					return membership.role === 'owner' && $stateParams.memberId === membership.id;
				});
			};

			$scope.loadMore = function() {
				$scope.filters.limit += 10;
				$scope.initTasks();
			};

			$scope.isOwner = function(task) {
				return itemService.isOwner(task, $stateParams.memberId);
			};

			$scope.getCredits  = function(task) {
				return task.members[$stateParams.memberId].credits;
			};

			$scope.getShare = function(task) {
				return task.members[$stateParams.memberId].share;
			};

			$scope.getDelta = function(task) {
				return task.members[$stateParams.memberId].delta;
			};

			$scope.isChangeUserAllowed = function(){
				var isAllowed = memberService.isAllowed.bind(memberService);
				return isAllowed('changeRole',{
					orgId:$stateParams.orgId,
					userId:$stateParams.memberId
				});
			};

			$scope.canChangeTo = function(newRole){
				switch($scope.profile.role) {
				    case 'contributor':
				        return 'member' === newRole;
				    case 'member':
				        return 'contributor' === newRole || 'admin' === newRole;
					case 'admin':
					case 'member and admin':
						return 'member' === newRole;
				}
			};

			$scope.isAllowed = itemService.isAllowed.bind(itemService);

			$scope.initTasks();

			$scope.showMore = function() {
				$scope.moreDetail = !$scope.moreDetail;
			};

            $scope.submit = function() {
                var promise = userEmailsService.set($scope.profile.newSecondaryEmails);
                promise.then($scope.submitSuccess, $scope.submitFail);
                $mdDialog.hide();
            };

            $scope.submitSuccess = function(params) {
                $scope.profile.secondaryEmails = $scope.profile.newSecondaryEmails;
            };

			$scope.submitFail = function(params) {
				var alert = $mdDialog.alert({
						title: 'Cannot save secondary emails',
						textContent: params.statusText,
						ok: 'Close'
					});
                $mdDialog.show( alert );
            };


            $scope.cancel = function() {
                $mdDialog.cancel();
            };
		}]);
