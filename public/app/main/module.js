angular.module('app', [
	'ui.router',
	'ngMessages',
	'ngMaterial',
	'ngCookies',
	'angularMoment',
	'infinite-scroll',
	'app.identity',
	'app.organizations',
	'app.collaboration',
	'app.people',
	'app.flow',
	'app.accounting',
	'app.kanbanize'
])
	.config(['$stateProvider', '$urlRouterProvider', "$httpProvider",
		function($stateProvider, $urlRouterProvider, $httpProvider) {
			$httpProvider.interceptors.push(function($q) {
				return {
					'responseError': function(rejection) {
						if(rejection.status === 401){
							alert("you are not authorized to view this page, probably the session is ended, please do login again");
							var auth2 = gapi.auth2.getAuthInstance();
							auth2.signOut().then(function () {
								window.location.reload();
							});
						}
					}
				}
			});

			$urlRouterProvider.otherwise(function($injector) {
				var $state = $injector.get("$state");

				var SelectedOrganizationId = $injector.get("SelectedOrganizationId");

				if(SelectedOrganizationId.get()){
					$state.go("org.flow");
				}else{
					$state.go("organizations");
				}
			});
			$stateProvider
				.state('org', {
					abstract: true,
					url: '/:orgId',
					templateUrl: 'app/main/partials/pillars.html',
					resolve: {
						members: function($stateParams, memberService) {
							return memberService.query({ orgId: $stateParams.orgId });
						},
						streams:['streamService','$stateParams','$q',function(streamService,$stateParams,$q){
							var deferred = $q.defer();
							streamService.query($stateParams.orgId,function(data){
								deferred.resolve(_.values(data._embedded['ora:stream']));
							});
							return deferred.promise;
						}]
					},
					controller: 'BaseOrganizationController'
				});
	}])
	.config(['$mdThemingProvider',
		function($mdThemingProvider) {
			$mdThemingProvider.theme('default')
				.primaryPalette('cyan')
				.accentPalette('grey')
				.warnPalette('red', {
      				'hue-1': 'A200'
    			});
			$mdThemingProvider.theme('input', 'default')
				.primaryPalette('grey');
		}])
	.config(['$mdIconProvider',
		function($mdIconProvider) {
			$mdIconProvider.defaultIconSet('icon-set.svg', 24);
		}])
	.run(function(amMoment) {
		amMoment.changeLocale('it');
	});
