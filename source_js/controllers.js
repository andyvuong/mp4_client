var mp4Controllers = angular.module('mp4Controllers', ['720kb.datepicker']);

mp4Controllers.controller('SettingsController', ['$scope', '$window', 'mongoInterface', 'CommonData', function($scope, $window, mongoInterface, CommonData) {

    $scope.url = $window.sessionStorage.baseurl;
    $scope.urlDisplay = $window.sessionStorage.baseurl;

    // sets the url for the api in the session storage
    $scope.setUrl = function() {
        $window.sessionStorage.baseurl = $scope.url;
        $scope.urlDisplay = $scope.url;
        CommonData.clearCached();
    };
}]);

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
                console.log(data.message);
            });
    };

    if ($scope.data.users.length == 0) {
        reloadUserList();
    }

    // updates a task and sets assigned properties
    var updateTask = function(id, taskItem) {
        mongoInterface.put('tasks', id, { assignedUser: "", assignedUserName: "unassigned", name: taskItem.name, deadline: taskItem.deadline, description: taskItem.description, completed: taskItem.completed })
            .success(function(data, status, header, config) {
                console.log("Task was updated")
            })
            .error(function(data, status, header, config) {
                console.log("An error occured adding the user.");
                console.log(data.message);
            });
    }

    // Updates all pending tasks for a deleted user (any task assigned to that user and marked
    //  completed: false  ). Note that other tasks that have been completed are left alone.
    var updateAllTasks = function(userId) {
        var queryParams = {
            where: {'assignedUser' : userId, 'completed': false}
        };

        mongoInterface.get('tasks',  queryParams)
            .success(function(data, status, header, config) {
                //console.log(data);
                taskList = data.data;
                for (var i = 0; i < taskList.length; i++) {
                    updateTask(taskList[i]._id, taskList[i]);
                }
            })
            .error(function(data, status, header, config) {
                console.log("An error occured updated the tasks of the deleted user.");
                console.log(data.message);
            }); 

    };

    // delete from model first then common data
    $scope.deleteUser = function(id) {
        // delete from scope first
        var user = ''; // user to be deleted

        var i = 0;
        for (i = 0; i < $scope.data.users.length; i++) {
            if ($scope.data.users[i]._id === id) {
                user = $scope.data.users[i]; // save user in case of error
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
                updateAllTasks(user._id);
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

mp4Controllers.controller('UserDetailController', ['$scope', 'CommonData', 'mongoInterface', '$routeParams', '$location', function($scope, CommonData, mongoInterface, $routeParams, $location) {
    $scope.alert = '';
    $scope.id = $routeParams.id;

    var displayError = function(msg) {
        $scope.alert = msg;
    }

    // click handler for tasks
    $scope.goToTaskDetail = function(id) {
        $location.path('/taskdetails/'+id);
    };

    var getPendingTasks = function() {
        var queryParams = {
            where: {'assignedUser' : $scope.id, 'completed': false}
        };

        mongoInterface.get('tasks',  queryParams)
            .success(function(data, status, header, config) {
                console.log(data);
                $scope.pendingTasks = data.data;

                // convert dates to a more readable format
                for (var i = 0; i < $scope.pendingTasks.length; i++) {
                    var d = (new Date($scope.pendingTasks[i].deadline)).toDateString();
                    $scope.pendingTasks[i].deadline = d;
                }
            })
            .error(function(data, status, header, config) {
                console.log("An error occured viewing the user pending tasks.");
                displayError(data.message);
            });
    };

    var getCompletedTasks = function() {
        var queryParams = {
            where: {'assignedUser' : $scope.id, 'completed': true}
        };

        mongoInterface.get('tasks',  queryParams)
            .success(function(data, status, header, config) {
                //console.log(data);
                $scope.completedTasks = data.data;
                console.log($scope.completedTasks);
                for (var i = 0; i < $scope.completedTasks.length; i++) {
                    var d = (new Date($scope.completedTasks[i].deadline)).toDateString();
                    $scope.completedTasks[i].deadline = d;
                }
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
            $scope.userData = userData;
            $scope.name = userData.name;
            $scope.email = userData.email;
            getPendingTasks();
        })
        .error(function(data, status, header, config) {
            console.log("An error occured viewing the user.");
            displayError(data.message);
        });

    $scope.getCompletedTasksClick = function() {
        console.log('get');
        getCompletedTasks();
    };

    var updateUserPending = function(userId, taskId) {
        var updatedPending = [];
        var original = $scope.pendingTasks;
        for (var i = 0; i < original.length; i++) {
            if (original[i]._id !== taskId) {
                updatedPending.push(original[i]._id);
            }
        }

        // update the user
        mongoInterface.put('users', userId, { name: $scope.userData.name, email: $scope.userData.email, pendingTasks: updatedPending})
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
    $scope.markComplete = function(taskId, userId, nameVal, deadlineVal, descriptionVal, assignedUserVal, assignedUserIdVal ) {
        //console.log(taskId);
        mongoInterface.put('tasks', taskId, { name: nameVal, deadline: deadlineVal, completed: true, description: descriptionVal, assignedUserName: assignedUserVal, assignedUser: assignedUserIdVal})
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

mp4Controllers.controller('TasksController', ['$scope', 'CommonData', '$timeout', 'mongoInterface', '$location', function($scope, CommonData, $timeout, mongoInterface, $location) {
    
    $scope.alert = '';

    var displayError = function(msg) {
        $scope.alert = msg;
    };

    $scope.paginationStart = 0; // set to skip

    // set the default buttons and select value on the view
    $timeout(function() {
        angular.element('#button-ascending').trigger('click');
        angular.element('#button-pending').trigger('click');
        angular.element('#selector').val('dateCreated');
    }, 50);

    // variables passed into reload
    $scope.orderingValue = 1; // radio
    $scope.sortByField = 'dateCreated'; // dropdown
    $scope.statusField = false; // radio

    /**
     * Makes an API call to the server to retrieve task.
     */
    var reloadTaskList = function(ordering, sortByField, status, skipVal) {
        var queryParams = {};

        if (status === 'all') {
            queryParams = {
                select: {"dateCreated": 0}, // exclude
                limit: 11,
                skip: skipVal
                //skip: 10,
                //limit: 10
            };
        }
        else {
            queryParams = {
                where: {'completed': status},
                select: {"dateCreated": 0}, // exclude
                limit: 11,
                skip: skipVal
                //skip: 10,
                //limit: 10
            };
        }
        queryParams.sort = {};
        queryParams.sort[sortByField] = ordering; // string - number

        console.log(queryParams);
        mongoInterface.get('tasks', queryParams)
            .success(function(data, status, headers, config) {
                $scope.tasks = data.data;

                // convert dates to a more readable format
                for (var i = 0; i < $scope.tasks.length; i++) {
                    var d = (new Date($scope.tasks[i].deadline)).toDateString();
                    $scope.tasks[i].deadline = d;
                }
                //console.log($scope.tasks);
            })
            .error(function(data, status, headers, config) {
                console.log('There was an error loading the data');
                displayError(data.message);
            });
    };

    // click handler for ascending or descending
    $scope.setOrderingValue = function(value) {
        $scope.orderingValue = value;
    };

    // click handler for getting pending, complete, all
    $scope.setStatusField = function(value) {
        if (value === 'pending') {
            $scope.statusField = false;
        }
        else if (value === 'complete') {
            $scope.statusField = true;
        }
        else if (value === 'all') {
            $scope.statusField = 'all';
        }
        else {
            console.log("Error occured");
        }
    };

    // click handler for tasks
    $scope.goToTaskDetail = function(id) {
        $location.path('/taskdetails/'+id);
    };

    // click handler for next
    $scope.next = function() {
        console.log($scope.tasks.length);
        console.log($scope.paginationStart);
        if ($scope.tasks.length < 11) {
            console.log("No more");
        }
        else {
            $scope.paginationStart = $scope.paginationStart + 10;
            reloadTaskList($scope.orderingValue, $scope.sortByField, $scope.statusField, $scope.paginationStart);    
        }
        
    };

    // click handler for previous
    $scope.previous = function() {
        if ($scope.paginationStart - 10 < 0) {
            $scope.paginationStart = 0;
        }  
        else {
            $scope.paginationStart = $scope.paginationStart - 10;
        }
        reloadTaskList($scope.orderingValue, $scope.sortByField, $scope.statusField, $scope.paginationStart);
    };

    // listens for any of the user options to change and makes an api call
    $scope.reload = function() {
        $scope.paginationStart = 0; // reset pagination
        reloadTaskList($scope.orderingValue, $scope.sortByField, $scope.statusField, $scope.paginationStart);
    };

    // remove a pending id from a user list for which that task id was deleted
    var updateUserList = function(userId, taskId) {
        // get the user, iterate through their pendingTasks and remove their task
        var queryParams = {
            where: {'_id' : userId}
        };

        mongoInterface.get('users',  queryParams)
            .success(function(data, status, header, config) {
                var user = data.data[0];
                var pending = user.pendingTasks;

                for (var i = 0; i < pending.length; i++) {
                    if (pending[i] === taskId) {
                        pending.splice(i, 1); // remove taskid from pending
                        break;
                    }
                }

                // update the user
                mongoInterface.put('users', userId, { pendingTasks: pending, name: user.name, email: user.email })
                    .success(function(data, status, header, config) {
                        console.log("User was updated: " + data);
                    })
                    .error(function(data, status, header, config) {
                        console.log("An error occured updating the user.");
                        console.log(data.message);
                    });
            })
            .error(function(data, status, header, config) {
                console.log("An error occured updated the tasks of the deleted user.");
                console.log(data.message);
            }); 
    };

    // delete a task
    $scope.deleteTask = function(id) {
        var task = ''; // user to be deleted

        var i = 0;
        for (i = 0; i < $scope.tasks.length; i++) {
            if ($scope.tasks[i]._id === id) {
                task = $scope.tasks[i]; // save user in case of error
                $scope.tasks.splice(i, 1);
                break;
            }
        }

        // delete from database
        mongoInterface.delete('tasks', id)
            .success(function(data, status, headers, config) {
                console.log('Deleted task');

                // only update a user if the task deleted was actually assigned
                if (typeof task.assignedUser !== 'undefined' && task.assignedUser !== '' && task.completed != true) {
                    updateUserList(task.assignedUser, id);    
                }
            })
            .error(function(data, status, headers, config) {
                console.log('There was an error loading the data');
                $scope.tasks.splice(i, 0, task);
            });
    };

    $scope.$watch('sortByField', $scope.reload, true);
    $scope.$watch('statusField', $scope.reload, true);
    $scope.$watch('orderingValue', $scope.reload, true);
    // add task goto, task detail goto, goto from user view
}]);

mp4Controllers.controller('TaskDetailController', ['$scope', 'CommonData', '$routeParams', 'mongoInterface', '$location', function($scope, CommonData, $routeParams, mongoInterface, $location) {
    $scope.alert = '';
    $scope.id = $routeParams.id;

    var displayError = function(msg) {
        $scope.alert = msg;
    }

    $scope.goToTaskEdit = function(id) {
        $location.path('/taskedit/'+id);
    }

    // on load, get the task data
    mongoInterface.get('tasks', $routeParams.id)
        .success(function(data, status, header, config) {
            console.log(data.data);
            taskData = data.data;
            $scope.taskData = taskData;
            $scope.name = taskData.name;
            $scope.email = taskData.email;
            $scope.description = taskData.description;

            var d = (new Date(taskData.deadline)).toDateString();
            $scope.deadline = d;

            if (taskData.completed) {
                $scope.status = 'Complete'
            }
            else {
                $scope.status = 'Incomplete'
            }
            $scope.assignedTo = taskData.assignedUserName;
        })
        .error(function(data, status, header, config) {
            console.log("An error occured viewing the user.");
            displayError(data.message);
        });
}]);

mp4Controllers.controller('TaskAddController', ['$scope', 'CommonData', 'mongoInterface', '$location', '$timeout', function($scope, CommonData, mongoInterface, $location, $timeout) {
    $scope.name = '';
    $scope.description = '';
    $scope.deadline = '';
    $scope.alert = '';
    $scope.selectedUser = 'unassigned';
    $scope.selectedUserId = '';

    var displayError = function(msg) {
        $scope.alert = msg;
    };

    $timeout(function() {
        angular.element('#selector').val('unassigned');
    }, 50);

    // Get users for the dropdown
    var getUsers = function() {
        mongoInterface.get('users', {})
            .success(function(data, status, headers, config) {
                console.log(data.data);
                $scope.users = data.data;
            })
            .error(function(data, status, headers, config) {
                console.log('There was an error loading the data');
            });   
    }
    
    getUsers();

    // gets the user id
    var getSelectedUserId = function() {
        if ($scope.selectedUser === 'unassigned') {
            $scope.selectedUserId = '';
        }
        else if ($scope.users) {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].name === $scope.selectedUser) {
                    $scope.selectedUserId = $scope.users[i]._id;
                    break;
                }
            }
        }
    }
/*
    var getdeadline = function() {
        if (typeof $scope.deadline === 'undefined' || $scope.deadline.length == 0) {
            console.log(12);
        }
        else {
        console.log($scope.deadline);
        console.log((new Date($scope.deadline)).toDateString());
    }
    }
    $scope.$watch('deadline', getdeadline, true);
    */
    $scope.$watch('selectedUser', getSelectedUserId, true);

    // adds a new user to the app
    $scope.addTask = function() {
        if (typeof $scope.name === 'undefined' || $scope.name.length == 0
            || typeof $scope.deadline === 'undefined' || $scope.deadline.length == 0) {
            displayError('Validation Error: A valid name and deadline is required.');
            $scope.name = '';
            $scope.description = '';
            $scope.deadline = '';
        }
        else {
            var id = $scope.selectedUserId;
            mongoInterface.post('tasks', { name: $scope.name, deadline: $scope.deadline, description: $scope.description, completed: false, assignedUser: $scope.selectedUserId, assignedUserName: $scope.selectedUser})
                .success(function(data, status, header, config) {
                    console.log("Task was Added: " + data);
                    var taskid = data.data._id;

                    // add task to user pending id
                    if ($scope.selectedUser !== 'unassigned') {  

                        mongoInterface.get('users', id)
                            .success(function(data, status, header, config) {
                                // get user list, push id onto it, and put
                                var userData = data.data;
                                var pending = userData.pendingTasks;
                                pending.push(taskid);

                                mongoInterface.put('users', id, { pendingTasks: pending, name: userData.name, email: userData.email })
                                    .success(function(data, status, header, config) {
                                        console.log("User was updated: " + data);
                                        $location.path('/tasks');
                                    })
                                    .error(function(data, status, header, config) {
                                        console.log("An error occured adding the user.");
                                        displayError(data.message);
                                    });
                            })
                            .error(function(data, status, header, config) {
                                console.log("An error occured viewing the user.");
                                displayError(data.message);
                            });
                    }
                    else {
                        $location.path('/tasks');
                    }
                })
                .error(function(data, status, header, config) {
                    console.log("An error occured adding the user.");
                    console.log(data.message);
                    displayError(data.message);
                });
        }
    };
}]);

mp4Controllers.controller('TaskEditController', ['$scope', 'CommonData', '$routeParams', 'mongoInterface', '$timeout', '$location', function($scope, CommonData, $routeParams, mongoInterface, $timeout, $location) {
    $scope.alert = '';
    $scope.id = $routeParams.id;

    $scope.name = '';
    $scope.description = '';
    $scope.deadline = '';
    $scope.selectedUser = 'unassigned';
    $scope.selectedUserId = '';

    var old = {};

    var displayError = function(msg) {
        $scope.alert = msg;
    }

    // load the current task details
    var loadUserDetails = function() {
        mongoInterface.get('tasks', $routeParams.id)
            .success(function(data, status, header, config) {
                console.log(data.data);
                taskData = data.data;
                $scope.taskData = taskData;

                $scope.name = taskData.name;
                $scope.deadline = taskData.deadline;
                $scope.description = taskData.description;
                $scope.selectedUser = taskData.assignedUserName;
                $scope.selectedUserId = taskData.assignedUser;
                $scope.status = taskData.completed;

                $timeout(function() {
                    if ($scope.status) {
                        angular.element('#selectStatus').val('true');    
                    }
                    else {
                        angular.element('#selectStatus').val('false');
                    }
                    
                    angular.element('#selector').val($scope.selectedUser);
                }, 5);

            })
            .error(function(data, status, header, config) {
                console.log("An error occured viewing the user.");
                displayError(data.message);
        });
    }

    // Get users for the dropdown
    var getUsers = function() {
        mongoInterface.get('users', {})
            .success(function(data, status, headers, config) {
                console.log(data.data);
                $scope.users = data.data;
                loadUserDetails();
            })
            .error(function(data, status, headers, config) {
                console.log('There was an error loading the data');
            });   
    }
    
    getUsers();

    // gets the user id
    var getSelectedUserId = function() {
        if ($scope.selectedUser === 'unassigned') {
            $scope.selectedUserId = '';
        }
        else if ($scope.users) {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].name === $scope.selectedUser) {
                    $scope.selectedUserId = $scope.users[i]._id;
                    console.log($scope.selectedUserId);
                    break;
                }
            }
        }
    }
    $scope.$watch('selectedUser', getSelectedUserId, true);
    
    function toBool() {
        if ($scope.status === 'true' || $scope.status === true) {
            $scope.status = true;
        }
        else {
            $scope.status = false;
        }
    }
    $scope.$watch('status', toBool, true);

    function removePendingFromUser(userId, taskId) {
        if (taskData.assignedUserName !== 'unassigned') {
            mongoInterface.get('users', userId)
                .success(function(data, status, header, config) {
                    // get user list, push id onto it, and put
                    var userData = data.data;
                    var pending = userData.pendingTasks;
                    
                    for (var i = 0; i < pending.length; i++) {
                        if (pending[i] === taskId) {
                            pending.splice(i, 1); // remove taskid from pending
                            break;
                        }
                    }

                    mongoInterface.put('users', userId, { pendingTasks: pending, name: userData.name, email: userData.email})
                        .success(function(data, status, header, config) {
                            //console.log("User was updated: " + data);

                            addPendingToUser($scope.selectedUserId, $scope.id);
                        })
                        .error(function(data, status, header, config) {
                            console.log("An error occured adding the user.");
                            displayError(data.message);
                        });
                })
                .error(function(data, status, header, config) {
                    console.log("An error occured viewing the user.");
                    displayError(data.message);
                });
        }
    }

    function addPendingToUser(userId, taskId) {
        //console.log($scope.selectedUser);
        //console.log($scope.status)
        if ($scope.status === false && $scope.selectedUser !== 'unassigned') {
            mongoInterface.get('users', userId)
                .success(function(data, status, header, config) {
                    // get user list, push id onto it, and put
                    var userData = data.data;
                    var pending = userData.pendingTasks;
                    pending.push(taskId);

                    mongoInterface.put('users', userId, { pendingTasks: pending, name: userData.name, email: userData.email })
                        .success(function(data, status, header, config) {
                            console.log("User was updated: " + data);
                        })
                        .error(function(data, status, header, config) {
                            console.log("An error occured adding the user.");
                            displayError(data.message);
                        });
                })
                .error(function(data, status, header, config) {
                    console.log("An error occured viewing the user.");
                    displayError(data.message);
                });
        }
    }

    $scope.submitTask = function() {
        if (typeof $scope.name === 'undefined' || $scope.name.length == 0
            || typeof $scope.deadline === 'undefined' || $scope.deadline.length == 0) {
            displayError('Validation Error: A valid name and deadline is required.');
            $scope.name = '';
            $scope.description = '';
            $scope.deadline = '';
        }
        else {
            // put the task inside
            mongoInterface.put('tasks', $scope.id, { name: $scope.name, deadline: $scope.deadline, description: $scope.description, completed: $scope.status, assignedUser: $scope.selectedUserId, assignedUserName: $scope.selectedUser})
                .success(function(data, status, header, config) {
                    //console.log("Task was updated: " + data);
                    var newTask = data.data;
                    var taskid = data.data._id;

                    // remove pending id from all users involved unless the user was unassigned
                    removePendingFromUser(taskData.assignedUser, $scope.id);
                    // readd the pending id if the status is false and the user is not unassigned
                    console.log($scope.selectedUserId);


                    // if t to f, new user, add to new user | old user, add to old user
                    // if f to t, remove from old user
                    // if same user same, do nothin to pending

                    $location.path('/taskdetails/'+$scope.id);
                })
                .error(function(data, status, header, config) {
                    console.log("An error occured updating the task.");
                    console.log(data.message);
                    displayError(data.message);
                });
        }
    };
}]);
