var ItemService = function(
	$resource,
	$interval,
	identity,
	$http) {

		var resource = $resource('api/:orgId/task-management/tasks/:itemId/:controller/:type', { orgId: '@orgId' }, {
			save: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() }
			},
			get: {
				method: 'GET',
				headers: { 'GOOGLE-JWT': identity.getToken() }
			},
			query: {
				method: 'GET',
				isArray: false,
				headers: { 'GOOGLE-JWT': identity.getToken() }
			},
			delete: {
				method: 'DELETE',
				headers: { 'GOOGLE-JWT': identity.getToken() }
			},
			edit: {
				method: 'PUT',
				headers: { 'GOOGLE-JWT': identity.getToken() }
			},
			joinItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'members' }
			},
			unjoinItem: {
				method: 'DELETE',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'members' }
			},
			estimateItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'estimations' }
			},
			approveItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'approvals' }
			},
			approveCompletedItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'acceptances' }
			},
			/*remindItemEstimate: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'reminders', type: 'add-estimation' }
			},*/
			executeItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'transitions' }
			},
			completeItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'transitions' }
			},
			acceptItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'transitions' }
			},
			assignShares: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'shares' }
			},
			skipShares: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'shares' }
			},
			closeItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() },
				params: { controller: 'transitions' }
			}
		});

		var r2 = $resource('api/:orgId/task-management/member-stats/:memberId', { }, {
			get: {
				method: 'GET',
				headers: { 'GOOGLE-JWT': identity.getToken() }
			}
		});

		var resourceRollback = $resource('api/:orgId/task-management/tasks/:itemId/transitions', { orgId: '@orgId' }, {
			rollbackItem: {
				method: 'POST',
				headers: { 'GOOGLE-JWT': identity.getToken() }
			}
		});

		this.getIdentity = function() {
			return identity;
		};

		this.save = function(organizationId, item, success, error) {
			return resource.save({ orgId: organizationId }, item, success, error);
		};
		var isGetPolling = false;
		this.get = function(organizationId, itemId, success, error) {
			isGetPolling = true;
			return resource.get(
				{ orgId: organizationId, itemId: itemId },
				function(data) {
					isGetPolling = false;
					success(data);
				},
				function(response) {
					isGetPolling = false;
					error(response);
				}
			);
		};
		var isQueryPolling = false;
		this.query = function(organizationId, filters, success, error) {
			error = error || _.noop;
			isQueryPolling = true;

			var newFilters = _.extend({},filters);

			if(_.values(ItemService.prototype.ITEM_STATUS).indexOf(newFilters.status) === -1){
				newFilters.status = null;
			}

			return resource.query(
				angular.extend({ orgId: organizationId }, newFilters),
				function (data) {
					isQueryPolling = false;
					success(data);
				},
				function (response) {
					isQueryPolling = false;
					error(response);
				});
			}
			;
			this.delete = function(item, success, error) {
				return resource.delete({ orgId: item.organization.id, itemId: item.id }, { }, success, error);
			};

			this.edit = function(item, success, error) {
				return resource.edit({ orgId: item.organization.id, itemId: item.id }, { subject: item.subject, description: item.description, lane:item.lane }, success, error);
			};

			this.joinItem = function(item, success, error) {
				return resource.joinItem({ orgId: item.organization.id, itemId: item.id }, { }, success, error);
			};

			this.unjoinItem = function(item, success, error) {
				return resource.unjoinItem({ orgId: item.organization.id, itemId: item.id }, { }, success, error);
			};

			this.estimateItem = function(item, value, success, error) {
				return resource.estimateItem({ orgId: item.organization.id, itemId: item.id }, { value: value }, success, error);
			};

			this.approveIdeaItem = function(item,description, success, error) {
				return resource.approveItem({ orgId: item.organization.id, itemId: item.id }, { value: 1 ,description:description}, success, error);
			};

			this.abstainIdeaItem = function (item,description,success,error){
				return resource.approveItem({ orgId: item.organization.id, itemId: item.id }, { value: 2, description:description }, success, error);
			};

			this.rejectIdeaItem = function (item,description,success,error){
				return resource.approveItem({ orgId: item.organization.id, itemId: item.id }, { value: 0 ,description:description}, success, error);
			};

			this.approveCompletedItem = function(item,description, success, error) {
				return resource.approveCompletedItem({ orgId: item.organization.id, itemId: item.id }, { value: 1 ,description:description}, success, error);
			};

			this.abstainCompletedItem = function (item,description,success,error){
				return resource.approveCompletedItem({ orgId: item.organization.id, itemId: item.id }, { value: 2, description:description }, success, error);
			};

			this.rejectCompletedItem = function (item,description,success,error){
				return resource.approveCompletedItem({ orgId: item.organization.id, itemId: item.id }, { value: 0 ,description:description}, success, error);
			};

			this.skipItemEstimation = function(item, success, error) {
				return resource.estimateItem({ orgId: item.organization.id, itemId: item.id }, { value: -1 }, success, error);
			};

			/*this.remindItemEstimate = function(item, success, error) {
				return resource.remindItemEstimate({ orgId: item.organization.id, itemId: item.id }, { action: 'accept' }, success, error);
			};*/

			this.executeItem = function(item, success, error) {
				return resource.executeItem({ orgId: item.organization.id, itemId: item.id }, { action: 'execute' }, success, error);
			};

			this.completeItem = function(item, success, error) {
				return resource.completeItem({ orgId: item.organization.id, itemId: item.id }, { action: 'complete' }, success, error);
			};

			this.acceptItem = function(item, success, error) {
				return resource.acceptItem({ orgId: item.organization.id, itemId: item.id}, { action: 'accept' }, success, error);
			};

			this.backToIdea = function(item, success, error) {
				return resourceRollback.rollbackItem({ orgId: item.organization.id, itemId: item.id}, { action: 'backToIdea' }, success, error);
			};

			this.backToOpen = function(item, success, error) {
				return resourceRollback.rollbackItem({ orgId: item.organization.id, itemId: item.id}, { action: 'backToOpen' }, success, error);
			};

			this.backToOngoing = function(item, success, error) {
				return resourceRollback.rollbackItem({ orgId: item.organization.id, itemId: item.id}, { action: 'backToOngoing' }, success, error);
			};

			this.backToCompleted = function(item, success, error) {
				return resourceRollback.rollbackItem({ orgId: item.organization.id, itemId: item.id}, { action: 'backToCompleted' }, success, error);
			};

			this.backToAccepted = function(item, success, error) {
				return resourceRollback.rollbackItem({ orgId: item.organization.id, itemId: item.id}, { action: 'backToAccepted' }, success, error);
			};

			this.assignShares = function(item, shares, success, error) {
				return resource.assignShares({ orgId: item.organization.id, itemId: item.id }, shares, success, error);
			};

			this.skipShares = function(item, success, error) {
				return resource.skipShares({ orgId: item.organization.id, itemId: item.id }, {}, success, error);
			};

			this.userStats = function(organizationId, filters) {
				return r2.get(angular.extend({ orgId: organizationId }, filters));
			};

			this.getHistory = function(item){
				return $http({
					method:'GET',
					url:'api/' + item.organization.id + '/task-management/tasks/' + item.id + '/history',
					headers: { 'GOOGLE-JWT': identity.getToken() }
				});
			};

			this.setAttachments = function(organizationId,itemId,attachments){
				return $http({
					url:'api/' + organizationId + '/task-management/tasks/' + itemId + '/attachments',
					method:'POST',
					data:{
						attachments:attachments
					},
					headers: { 'GOOGLE-JWT': identity.getToken() }
				});
			};

			this.removeTaskMember = function(organizationId,itemId,memberId){
				return $http({
					url:'api/' + organizationId + '/task-management/tasks/' + itemId + '/members/' + memberId,
					method:'DELETE',
					headers: { 'GOOGLE-JWT': identity.getToken() }
				});
			};

			var queryPolling = null;
			this.startQueryPolling = function(organizationId, filters, success, error, millis) {
				var newFilters = _.extend({},filters);

				var status = _.find(_.values(ItemService.prototype.ITEM_STATUS),function(s){
					return s == newFilters.status;
				});

				if(_.isUndefined(status)){
					newFilters.status = null;
				}

				this.query(organizationId, newFilters, success, error);
				var that = this;
				queryPolling = $interval(function() {
					if (isQueryPolling) return;
					that.query(organizationId, newFilters, success, error);
				}, millis);
			};
			this.stopQueryPolling = function() {
				if(queryPolling) {
					$interval.cancel(queryPolling);
					queryPolling = null;
				}
			};
			var getPolling = null;
			this.startGetPolling = function(organizationId, itemId, success, error, millis) {
				this.get(organizationId, itemId, success, error);
				var that = this;
				getPolling = $interval(function() {
					if(isGetPolling) return;
					that.get(organizationId, itemId, success, error);
				}, millis);
			};
			this.stopGetPolling = function() {
				if(getPolling) {
					$interval.cancel(getPolling);
					getPolling = null;
				}
			};
			this.closeItem = function(item, success, error){
				return resource.closeItem({ orgId: item.organization.id, itemId: item.id}, { action: 'close' }, success, error);
			};

			this.changeOwner = function(item,owner){
				return $http({
					url:'api/' + item.organization.id + '/task-management/tasks/' + item.id + '/owner',
					method:'POST',
					data:{
						ownerId:owner
					},
					headers: { 'GOOGLE-JWT': identity.getToken() }
				});
			};
		};

		ItemService.prototype = {
			constructor: ItemService,
			ITEM_STATUS: {
				'IDEA'     : 0,
				'OPEN'     : 10,
				'ONGOING'  : 20,
				'COMPLETED': 30,
				'ACCEPTED' : 40,
				'CLOSED'   : 50,
				'REJECTED' : -20
			},
			ITEM_ROLES: {
				'ROLE_MEMBER': 'member',
				'ROLE_OWNER' : 'owner'
			},
            getAuthor: function(item) {
                if(item) {
					return item.author;
                }
                return null;
            },
            isAuthor: function(item, userId){
            	return item && item.author && item.author.id === userId;
            },
			getOwner: function(item) {
				if(item) {
					for(var id in item.members) {
						if(item.members.hasOwnProperty(id) &&
						item.members[id].role === this.ITEM_ROLES.ROLE_OWNER)
						return item.members[id];
					}
				}
				return null;
			},
			isOwner: function(item, userId) {
				return item &&
				item.members &&
				item.members.hasOwnProperty(userId) &&
				item.members[userId].role == this.ITEM_ROLES.ROLE_OWNER;
			},
			isMember: function(item, userId) {
				return item &&
				item.members &&
				item.members.hasOwnProperty(userId) &&
				item.members[userId].role == this.ITEM_ROLES.ROLE_MEMBER;
			},
			isIn: function(item, userId) {
				return item &&
				item.members &&
				item.members.hasOwnProperty(userId);
			},
			hasJoined: function(item, userId) {
				return item &&
				item.members &&
				item.members.hasOwnProperty(userId);
			},
			isEstimationCompleted: function(item) {
				if(item) {
					for(var id in item.members) {
						if(item.members.hasOwnProperty(id) &&
						item.members[id].estimation === undefined)
						return false;
					}
				}
				return true;
			},
			yourEstimation: function(item) {
				if (item && item.members && item.members.hasOwnProperty(this.getIdentity().getId())) {
					return item.members[this.getIdentity().getId()].estimation;
				} else {
					return false;
				}
			},
			countEstimators: function(item) {
				var n = 0;
				if(item) {
					for(var id in item.members) {
						if(item.members.hasOwnProperty(id) &&
						item.members[id].estimation !== undefined)
						n++;
					}
				}
				return n;
			},
			isShareAssignmentCompleted: function(item) {
				if(item) {
					for(var id in item.members) {
						if(item.members.hasOwnProperty(id) &&
						item.members[id].shares === undefined)
						return false;
					}
				}
				return true;
			},
			isShareAssignmentExpired: function(item, ref) {
				if(item) {
					if(item.sharesAssignmentExpiresAt){
						return Date.parse(item.sharesAssignmentExpiresAt) < Date.parse(ref);
					}
				}
				return true;
			},
			visibilityCriteria: {
				removeTaskMember: function(organization){
					return 'admin' === this.getIdentity().getMembershipRole(organization.id);
				},
				createItem: function(organization) {
					return organization &&
					this.getIdentity().isAuthenticated() &&
					this.getIdentity().getMembership(organization.id);
				},
				editItem: function(resource) {
					return this.getIdentity().isAuthenticated() &&
                        //resource.status < this.ITEM_STATUS.COMPLETED &&
                        (this.isOwner(resource, this.getIdentity().getId()) ||
                        this.isAuthor(resource, this.getIdentity().getId()) ||
                        'admin' === this.getIdentity().getMembershipRole(resource.organization.id));
				},
				deleteItem: function(resource) {

					var allowedStatuses = [
						this.ITEM_STATUS.IDEA,
						this.ITEM_STATUS.OPEN,
						this.ITEM_STATUS.ONGOING,
						this.ITEM_STATUS.REJECTED
					];

					var isAdmin = 'admin' === this.getIdentity().getMembershipRole(resource.organization.id);
					var isAllowedStatus = allowedStatuses.indexOf(resource.status) !== -1;

					return isAdmin && isAllowedStatus;
				},
				backToIdea: function(resource) {

					var allowedStatuses = [
						this.ITEM_STATUS.OPEN,
						this.ITEM_STATUS.REJECTED
					];

					var isAdmin = 'admin' === this.getIdentity().getMembershipRole(resource.organization.id);
					var isAllowedStatus = allowedStatuses.indexOf(resource.status) !== -1;

					return (isAdmin || this.isOwner(resource, this.getIdentity().getId()) || this.isAuthor(resource, this.getIdentity().getId())) && isAllowedStatus;
				},
				backToOpen: function(resource) {

					var allowedStatuses = [
						this.ITEM_STATUS.ONGOING
					];

					var isAdmin = 'admin' === this.getIdentity().getMembershipRole(resource.organization.id);
					var isAllowedStatus = allowedStatuses.indexOf(resource.status) !== -1;

					return (isAdmin || this.isOwner(resource, this.getIdentity().getId()) || this.isAuthor(resource, this.getIdentity().getId())) && isAllowedStatus;
				},
				backToOngoing: function(resource) {

					var allowedStatuses = [
						this.ITEM_STATUS.COMPLETED
					];

					var isAdmin = 'admin' === this.getIdentity().getMembershipRole(resource.organization.id);
					var isAllowedStatus = allowedStatuses.indexOf(resource.status) !== -1;

					return (isAdmin || this.isOwner(resource, this.getIdentity().getId()) || this.isAuthor(resource, this.getIdentity().getId())) && isAllowedStatus;
				},
				backToCompleted: function(resource) {

					var allowedStatuses = [
						this.ITEM_STATUS.ACCEPTED
					];

					var isAdmin = 'admin' === this.getIdentity().getMembershipRole(resource.organization.id);
					var isAllowedStatus = allowedStatuses.indexOf(resource.status) !== -1;

					return (isAdmin || this.isOwner(resource, this.getIdentity().getId()) || this.isAuthor(resource, this.getIdentity().getId())) && isAllowedStatus;
				},
				backToAccepted: function(resource) {

					var allowedStatuses = [
						this.ITEM_STATUS.CLOSED
					];

					var isAdmin = 'admin' === this.getIdentity().getMembershipRole(resource.organization.id);
					var isAllowedStatus = allowedStatuses.indexOf(resource.status) !== -1;

					return (isAdmin || this.isOwner(resource, this.getIdentity().getId()) || this.isAuthor(resource, this.getIdentity().getId())) && isAllowedStatus;
				},
				joinItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ONGOING &&
					resource.members[this.getIdentity().getId()] === undefined;
				},
				unjoinItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ONGOING &&
					this.isMember(resource, this.getIdentity().getId());
				},
				executeItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.OPEN; //&&
					//this.isOwner(resource, this.getIdentity().getId());
				},
				reExecuteItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.COMPLETED &&
					this.isOwner(resource, this.getIdentity().getId());
				},
				completeItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ONGOING &&
					this.isOwner(resource, this.getIdentity().getId()) &&
					this.isEstimationCompleted(resource);
				},
				reCompleteItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ACCEPTED &&
					this.isOwner(resource, this.getIdentity().getId());
				},
				acceptItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.COMPLETED &&
					(this.hasJoined(resource, this.getIdentity().getId()) || this.getIdentity().isMember(resource.organization.id)) &&
					this.getIdentity().getMembershipRole(resource.organization.id) !== 'contributor' &&
					resource.acceptances[this.getIdentity().getId()]=== undefined;
				},
				estimateItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ONGOING &&
					this.hasJoined(resource, this.getIdentity().getId());
				},
				approveIdea: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.IDEA &&
					this.getIdentity().isMember(resource.organization.id) &&
					this.getIdentity().getMembershipRole(resource.organization.id) !== 'contributor' &&
					resource.approvals[this.getIdentity().getId()]=== undefined;
				},
				/*remindItemEstimate: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ONGOING &&
					this.isOwner(resource, this.getIdentity().getId()) &&
					!this.isEstimationCompleted(resource);
				},*/
				assignShares: function(resource) {
					var shares = resource && resource.members && resource.members[this.getIdentity().getId()] && resource.members[this.getIdentity().getId()].shares || [];

					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ACCEPTED &&
					this.hasJoined(resource, this.getIdentity().getId()) &&
					shares.length === 0;
				},
				skipShares: this.assignShares,
				showShares: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.CLOSED;
				},
				showMyEstimation: function(resource) {
					return resource && 
					this.getIdentity().isAuthenticated() && 
					resource.status >= this.ITEM_STATUS.ONGOING &&
					this.hasJoined(resource, this.getIdentity().getId());
				},
				closeItem: function(resource) {
					return resource &&
					this.getIdentity().isAuthenticated() &&
					resource.status == this.ITEM_STATUS.ACCEPTED &&
					this.isOwner(resource, this.getIdentity().getId()) &&
					(this.isShareAssignmentExpired(resource, new Date()) ||
					this.isShareAssignmentCompleted(resource));
				},
				addAttachment: function(resource) {
					return resource &&
					(resource.status >= this.ITEM_STATUS.ONGOING);
				},
				changeOwner:  function(resource) {
					return resource &&
					resource.status >= this.ITEM_STATUS.ONGOING &&
					this.getIdentity().getMembershipRole(resource.organization.id) === 'admin';
				}
			},
			isAllowed: function(command, resource) {
				var criteria = this.visibilityCriteria[command];
				if(criteria) {
					criteria = criteria.bind(this);
					return criteria(resource);
				}
				return true;
			}
		};
angular.module('app.collaboration')
.constant('ITEM_STATUS', ItemService.prototype.ITEM_STATUS)
.service('itemService', [
	'$resource',
	'$interval',
	'identity',
	'$http',
	ItemService]);
