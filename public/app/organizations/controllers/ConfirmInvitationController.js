angular.module('app')
	.controller('ConfirmInvitationController', [
		'$scope',
		'$stateParams',
		'$state',
		'$mdDialog',
		'SelectedOrganizationId',
		'memberService',
		'InvitationData',
		function (
			$scope,
			$stateParams,
			$state,
			$mdDialog,
			SelectedOrganizationId,
			memberService,
			InvitationData) {

				var onSuccess = function(googleUser) {
					$scope.$apply(function() {
						var profile = googleUser.getBasicProfile();
						var email = profile.getEmail();

						if(email.toLowerCase() === InvitationData.guestEmail.toLowerCase()){
							var confirm = $mdDialog.confirm({
						        title: 'Confirm',
						        textContent: 'Do You want to Join ' + InvitationData.orgName + '?',
						        ok: 'Confirm',
								cancel: 'Cancel'
							});

							$mdDialog.show(confirm).then(function(result){
								if(result){
									$scope.identity.signInFromGoogle(googleUser);
									SelectedOrganizationId.set(InvitationData.orgId);
									memberService.joinOrganizationAfterInvite({ id: InvitationData.orgId }, function(){
										$scope.identity.updateMemberships().then(function(){
											$state.go('org.flow',{ orgId: InvitationData.orgId });
											window.location.href = location.href.split('#')[0];
										});
									}, function() {
										console.log("Error");
									});
								}
							});
						}else{

							var message = "Your email (" + email + ") it's not the same used to invite you (" + InvitationData.guestEmail + "). Please login with a different user";

							var alert = $mdDialog.alert({
						        title: 'Error',
						        textContent: message,
						        ok: 'Close'
							});

							$mdDialog.show(alert);
						}
					});
				};

				gapi.signin2.render('googleSignIn', {
					'scope': 'https://www.googleapis.com/auth/drive.readonly',
					'width': 230,
					'longtitle': true,
					'theme': 'dark',
					'onsuccess': onSuccess
				});
		}]);
