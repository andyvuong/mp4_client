var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UsersController'
  }).
  when('/usersdetails/:id', {
    templateUrl: 'partials/userdetails.html',
    controller: 'UserDetailController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TasksController'
  }).
  when('/tasksdetails/:id', {
    templateUrl: 'partials/taskdetails.html',
    controller: 'TaskDetailController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
