angular.module('app.identity', ['ui.router'])
	.config(['$stateProvider', '$urlRouterProvider',
		function($stateProvider) {
			$stateProvider.
				state('sign-in', {
					url: '/sign-in',
					templateUrl: 'app/identity/partials/sign-in.html',
					controller: 'SignInController'
				}).state('deactivated-user-landing', {
					url: ':orgId/deactivated-user-landing',
					templateUrl: 'app/identity/partials/deactivated-user-landing.html',
					controller: 'DeactivatedUserLandingController as ctrl'
				});
		}
	])
	.run(['$rootScope', '$state', '$log', 'identity',
		function($rootScope, $state, $log, identity) {
			$rootScope.$on("$stateChangeStart",
				function(event, toState, toParams) {

					if(toState.name === "sign-in" || toState.name === 'invitation') {
						return;
					}

					if(identity.isAuthenticated()) {
						$log.debug('Access to ' + toState.name + ' state granted: user authenticated');
						return;
					}

					event.preventDefault();

					$log.debug("Access to '" + toState.name + "' state denied: user not authenticated");
                    $log.debug("Saving previous state to '" + toState.name);

                    $state.previous = toState;
					$state.previousParams = toParams;

                    $state.go("sign-in");
				});
		}
	]);
