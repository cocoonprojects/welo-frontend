(function() {
	"use strict";

	var access_token;
	var picker;

	var showPicker = function(callback) {
		var pickerCallback = function(data) {
			if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {

				var
					file = data[google.picker.Response.DOCUMENTS][0],
					id = file[google.picker.Document.ID],
					request = gapi.client.drive.files.get({fileId: id});

				request.execute(callback(file));
			}
		};

		picker = new google.picker.PickerBuilder().
			addView(google.picker.ViewId.DOCS).
			setAppId(window.googleApi.CLIENT_ID).
			setOAuthToken(access_token).
			setCallback(pickerCallback).
			setSize(1051,650).
			setTitle("Select an Attachment").
			build().
			setVisible(true);
	};

	angular.module('app').directive('googleDrivePicker',[
		'$q',
		function($q){

			var doAuth = function(){
				var deferred = $q.defer();

				window.googleApi.authorize(function (requestToken) {
					access_token = requestToken.access_token;
					deferred.resolve(access_token);
				});

				window.googleApi.requestAccessToken();

				return deferred.promise;
			};

			return {
				restrict: 'A',
				scope:{
					onFileSelect:'&?'
				},
				link: function($scope, element, attrs) {
					var domElement = element[0];

					$scope.onFileSelect = $scope.onFileSelect || _.noop;

					domElement.addEventListener('click', function(){
						doAuth().then(function(){
							showPicker(function(file){
								$scope.onFileSelect({
									file:file
								});
							});
						});
					});
				}
			};
		}]);
	}());
