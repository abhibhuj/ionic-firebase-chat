// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'starter.services', 'firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.run(function ($window, $rootScope, $location, Auth) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    console.log(event, toState, toParams, fromState, fromParams);

    /*if ($window.sessionStorage.getItem('reload')) {
        $window.sessionStorage.removeItem('reload');
        setTimeout(function() {
            $window.location.reload();
            //$location.path('/tab/dash');
        }, 1000);
    }*/
    //console.log(Auth.$getAuth());
    var authData = Auth.$getAuth();
        if (!authData) {
            console.log('User not logged in yet');
            $location.path('/login');
        }
        else {
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
            if(toState.url === '/login') {
              $location.path('/tab/dash');
            }
            if(toState.url === '/logout') {
              Auth.$unauth();
              $location.path('/login');
            }
            //$location.path('/home');
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

    .state('logout', {
    url: '/logout',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.updates', {
    url: '/updates',
    views: {
      'tab-updates': {
        templateUrl: 'templates/tab-updates.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.firechat', {
    url: '/firechat',
    views: {
      'tab-firechat': {
        templateUrl: 'templates/tab-firechat.html',
        controller: 'FirebaseCtrl'
      }
    }
  })

  .state('tab.firechat-detail', {
      url: '/firechats/:chatId',
      params: { uid: { value: -1 } },
      views: {
        'tab-firechat': {
          templateUrl: 'templates/tab-firechat-details.html',
          controller: 'FireChatDetailsCtrl'
        }
      }
    })

  .state('tab.invitations', {
    url: '/invitations',
    views: {
      'tab-invitations': {
        templateUrl: 'templates/tab-invitations.html',
        controller: 'InvitationsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
