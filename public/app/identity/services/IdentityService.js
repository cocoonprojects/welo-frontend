var Identity = function($http, $log, $q) {
	var id, firstname, lastname, email, avatar, memberships;

	this.getToken        = function() {	return window.googleApi.accessToken; };
	this.getId           = function() { return id; };
	this.getFirstname    = function() { return firstname; };
	this.getLastname     = function() { return lastname; };
	this.getEmail        = function() { return email; };
	this.getAvatar       = function() { return avatar; };
	this.isAuthenticated = function() { return window.googleApi.accessToken ? true : false; };
	this.getMemberships  = function() { return memberships; };

	this.isMember = function(orgId){
		return !!this.getMembership(orgId);
	};

	this.getMembershipRole = function(orgId){
		var rv = null;
		angular.forEach(memberships, function(value) {
			if(value.organization.id === orgId) {
				rv = value.role;
			}
		});
		return rv;
	};

	this.getMembership = function(orgId) {
		var rv = null;
		angular.forEach(memberships, function(value) {
			if(value.organization.id === orgId) {
				rv = value.organization;
			}
		});
		return rv;
	};

	this.reset = function() {
		window.googleApi.accessToken = firstname = lastname = email = avatar = '';
		memberships = [];
	};

	this.getUser = function(accessToken) {
		return $http({method: 'GET', url: 'api/users/me', headers: {'GOOGLE-JWT': accessToken}}).success(function(userData) {
			return userData;
		});
	};

	this.signIn = function(accessToken, user) {
		window.googleApi.accessToken = accessToken;

		id = user.id;
		firstname = user.firstname;
		avatar = user.picture;
		email = user.email;

		return this.updateMemberships();
	};

	this.updateMemberships = function() {
		return $http({method: 'GET', url: 'api/memberships', headers: {'GOOGLE-JWT': window.googleApi.accessToken}}).success(function(data) {
			id        = data.id;
			firstname = data.firstname;
			lastname  = data.lastname;
			email     = data.email;
			avatar    = data.picture;
			memberships = data._embedded['ora:organization-membership'];
		});
	};

	this.loadMemberships = function(){
		if(memberships){
			var deferred = $q.defer();
			deferred.resolve(memberships);
			return deferred.promise;
		}else{
			return this.updateMemberships().then(function(){
				return memberships;
			});
		}
	};

	this.loadMembership = function(orgId){
		var that = this;
		return this.loadMemberships().then(function(){
			return that.getMembership(orgId);
		});
	};
};
angular.module('app.identity')
	.service('identity', ['$http', '$log', '$q', Identity]);
