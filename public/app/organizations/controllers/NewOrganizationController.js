function NewOrganizationController(
	$scope,
	$log,
	$mdDialog,
	organizationService,
	streamService) {
		$scope.organization = {};
		this.cancel = function() {
			$mdDialog.cancel();
		};

		var onCompleteNewOrganization = function(org){
			$mdDialog.hide(org);
			streamService.save(org.id,{
				subject:org.name
			});
		};

		this.submit = function() {
			organizationService.save({}, $scope.organization, onCompleteNewOrganization, function(httpResponse) {
				switch(httpResponse.status) {
					case 400:
						httpResponse.data.errors.forEach(function(error) {
							$scope.form[error.field].$error.remote = error.message;
						});
						break;
					default:
						alert('Generic Error during server communication (error: ' + httpResponse.status + ' ' + httpResponse.statusText + ') ');
						$log.warn(httpResponse);
				}
			});
		};
}
