(function(angular) {
	'use strict';

	// Declare app level module which depends on filters, and services
	angular.module('TodoExample', ['Centralway.lungo-angular-bridge'])
		.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		  $routeProvider.when('/add-todo', {});
          $routeProvider.when('/main', {});
		  $routeProvider.otherwise({redirectTo: '#/main'});
		  $locationProvider.html5Mode(false);
		}])
		.run(function($rootScope) {
			$rootScope.$on('handleEmit', function(event, args) {
				$rootScope.$broadcast('handleBroadcast', args);
			});
		})
	;
}(angular));