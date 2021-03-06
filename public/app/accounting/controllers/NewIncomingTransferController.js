function NewIncomingTransferController($scope, $log, $stateParams, $mdDialog, accountService, account) {
	$scope.transfer = {};
	$scope.saving = false;
	this.cancel = function() {
		$mdDialog.cancel();
	};
	this.submit = function() {
		$scope.saving = true;
		accountService.transferIn({ 
			orgId: $stateParams.orgId, 
			accountId: account.id 
		}, $scope.transfer, $mdDialog.hide, function(httpResponse) {
				$scope.saving = false;
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