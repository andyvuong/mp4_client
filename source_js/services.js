var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('CommonData', function(){
    var data = "";
    return {
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

mp4Services.factory('mongoInterface', function($http, $window) {
    return {
        /*
         * @param {String} route the api route to use
         * @param {Object} parameters object of query parameters
         */
        get : function(route, parameters) {
            // https://code.angularjs.org/1.3.20/docs/api/ng/service/$http (2nd param is a config obj)
            if (typeof parameters === 'object') {
                var url = $window.sessionStorage.baseurl + '/api/' + route;
                return $http.get(url, {params: parameters});
            }
            else { // if its a string, then we use the /api/<route>/id route.
                var baseUrl = $window.sessionStorage.baseurl;
                var url = baseUrl + '/api/' + route + '/' + parameters;
                return $http.get(url);
            }
        },
        /*
         * @param {String} route the api route to use
         * @param {Object} parameters object of post parameters
         */
        post : function(route, parameters) {
            var url = $window.sessionStorage.baseurl + '/api/' + route;  
            return $http.post(url, parameters);
        },
        /*
         * @param {String} route the api route to use
         * @param {String} id mongodb object id
         * @param {Object} parameters object of post parameters 
         */
        put : function(route, id, parameters) {
            var baseUrl = $window.sessionStorage.baseurl;
            var url = baseUrl + '/api/' + route + '/' + id;
            return $http.put(url, parameters);
        },
        /*
         * @param {String} route the api route to use
         * @param {String} id mongodb object id
         */
        delete : function(route, id) {
            var baseUrl = $window.sessionStorage.baseurl;
            var url = baseUrl + '/api/' + route + '/' + id;
            return $http.delete(url);
        }        
    }
});
