var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', 'CommonData', 'mongoInterface', '$window', '$location', function($scope, CommonData, mongoInterface, $window, $location) {
  
    $scope.data = {
        users : CommonData.getUsers()
    }

    // makes an api call to the database to get user data
    var reloadUserList = function() {
        mongoInterface.get('users', {})
            .success(function(data, status, headers, config) {
                //console.log("Yolo");
                //console.log($scope.data.users);
                $scope.data.users = data.data;
                //console.log($scope.data.users);
                CommonData.setUsers($scope.data.users);
                //console.log('api get');
            })
            .error(function(data, status, headers, config) {
                console.log('There was an error loading the data');
            });
    };

    if ($scope.data.users.length == 0) {
        reloadUserList();
    }

    // updates all the tasks and removes the user id/name of the user that was removed.
    var updateAllTasks = function(taskList) {
        // TODO

    };

    // delete from model first then common data
    $scope.deleteUser = function(id) {
        // delete from scope first
        var user = ''; // user to be deleted
        var i = 0;
        for (i = 0; i < $scope.data.users.length; i++) {
            if ($scope.data.users[i]._id === id) {
                user = user[i]; // save user in case of error
                $scope.data.users.splice(i, 1);
                break;
            }
        }
        CommonData.setUsers($scope.data.users);

        // delete from database
        mongoInterface.delete('users', id)
            .success(function(data, status, headers, config) {
                //console.log(data);
                console.log('Deleted User');
                //reloadUserList();
                //updateAllTasks(user.pendingTasks);
            })
            .error(function(data, status, headers, config) {
                console.log('There was an error loading the data');
                $scope.data.users.splice(i, 0, user);
                CommonData.setUsers($scope.data.users);
            });
    }

    $scope.goToUserDetail = function(id) {
        $location.path('/userdetails/'+id);
    }

}]);

mp4Controllers.controller('UserAddController', ['$scope', 'CommonData', 'mongoInterface', '$location', function($scope, CommonData, mongoInterface, $location) {
    $scope.name = '';
    $scope.email = '';
    $scope.alert = '';

    var displayError = function(msg) {
        $scope.alert = msg;
    };

    // adds a new user to the app
    $scope.addUser = function() {
        if ($scope.name.length == 0 || typeof $scope.email === 'undefined' || $scope.email.length == 0) {
            displayError('Validation Error: A valid name and email is required.');
            $scope.email = '';
            $scope.name = '';
        }
        else {
            mongoInterface.post('users', { name: $scope.name, email: $scope.email})
                .success(function(data, status, header, config) {
                    console.log("User was Added: " + data);
                    $scope.email = '';
                    $scope.name = '';

                    // redirect and reload
                    CommonData.setUsers([]); // sets empty so the user view refreshes
                    $location.path('/users');
                })
                .error(function(data, status, header, config) {
                    console.log("An error occured adding the user.");
                    displayError(data.message);
                });
        }
    };
}]);

mp4Controllers.controller('UserDetailController', ['$scope', 'CommonData', 'mongoInterface', '$routeParams', function($scope, CommonData, mongoInterface, $routeParams) {
    $scope.alert = '';
    $scope.id = $routeParams.id;

    var displayError = function(msg) {
        $scope.alert = msg;
    }

    var getPendingTasks = function() {
        var queryParams = {
            where: {'assignedUser' : $scope.id, 'completed': false}
        };

        mongoInterface.get('tasks',  queryParams)
            .success(function(data, status, header, config) {
                //console.log(data);
                $scope.pendingTasks = data.data;
            })
            .error(function(data, status, header, config) {
                console.log("An error occured viewing the user pending tasks.");
                displayError(data.message);
            });
    }

    var getCompletedTasks = function() {
        var queryParams = {
            where: {'assignedUser' : $scope.id, 'completed': true}
        };

        mongoInterface.get('tasks',  queryParams)
            .success(function(data, status, header, config) {
                //console.log(data);
                $scope.completedTasks = data.data;
            })
            .error(function(data, status, header, config) {
                console.log("An error occured viewing the user pending tasks.");
                displayError(data.message);
            }); 
    }

    //console.log($routeParams.id)
    // on page load, we try to find the user by their id and load their details
    mongoInterface.get('users', $routeParams.id)
        .success(function(data, status, header, config) {
            console.log(data.data);
            userData = data.data;
            $scope.name = userData.name;
            $scope.email = userData.email;
            getPendingTasks();
        })
        .error(function(data, status, header, config) {
            console.log("An error occured viewing the user.");
            displayError(data.message);
        });

    $scope.getCompletedTasks = function() {
        getCompletedTasks();
    };

    var updateUserPending = function(userId, taskId) {
        var updatedPending = [];
        var original = $scope.pendingTasks;
        for (var i = 0; i < updatedPending; i++) {
            if (priginal[i] !== taskId) {
                updatedPending.push(original[i]);
            }
        }

        // update the user
        mongoInterface.put('users', userId, { pendingTasks: updatedPending})
            .success(function(data, status, header, config) {
                console.log("User was updated: " + data);
                getPendingTasks();
            })
            .error(function(data, status, header, config) {
                console.log("An error occured adding the user.");
                displayError(data.message);
            });
    }

    // updates the task and updates the user's pending tasks
    $scope.markComplete = function(taskId, userId) {
        console.log(taskId);
        mongoInterface.put('tasks', taskId, { completed: true})
            .success(function(data, status, header, config) {
                console.log("Task was updated: " + data);
                updateUserPending(userId, taskId);
            })
            .error(function(data, status, header, config) {
                console.log("An error occured adding the user.");
                displayError(data.message);
            });
    };

}]);

mp4Controllers.controller('TasksController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };
}]);

mp4Controllers.controller('TaskDetailController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };
}]);


mp4Controllers.controller('SecondController', ['$scope', 'CommonData' , function($scope, CommonData) {
  $scope.data = "";

  $scope.getData = function(){
    $scope.data = CommonData.getData();

  };

}]);

mp4Controllers.controller('LlamaListController', ['$scope', '$http', 'Llamas', '$window' , function($scope, $http,  Llamas, $window) {

  Llamas.get().success(function(data){
    $scope.llamas = data;
  });


}]);

mp4Controllers.controller('SettingsController', ['$scope', '$window', 'mongoInterface', function($scope, $window, mongoInterface) {

    $scope.url = $window.sessionStorage.baseurl;
    $scope.urlDisplay = $window.sessionStorage.baseurl;

    // sets the url for the api in the session storage
    $scope.setUrl = function() {
        $window.sessionStorage.baseurl = $scope.url;
        $scope.urlDisplay = $scope.url;
    };
}]);