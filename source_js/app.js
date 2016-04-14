var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UsersController'
  }).
  when('/userdetails/:id', {
    templateUrl: 'partials/userdetails.html',
    controller: 'UserDetailController'
  }).
  when('/addusers', {
    templateUrl: 'partials/addusers.html',
    controller: 'UserAddController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TasksController'
  }).
  when('/taskdetails/:id', {
    templateUrl: 'partials/taskdetails.html',
    controller: 'TaskDetailController'
  }).
  when('/taskadd', {
    templateUrl: 'partials/taskadd.html',
    controller: 'TaskAddController'
  }).
  when('/taskedit/:id', {
    templateUrl: 'partials/taskedit.html',
    controller: 'TaskEditController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
