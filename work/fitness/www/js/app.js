// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', [
    'ionic',
    'ionic-material',
    'starter.exercises-service',
    'starter.programs-service',
    'starter.splash',
    'starter.home',
    'starter.exercises',
    'starter.programs',
    'starter.analytics'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$urlRouterProvider', '$ionicConfigProvider', function($urlRouterProvider, $ionicConfigProvider) {
  $urlRouterProvider.otherwise('/home');
  $ionicConfigProvider.tabs.position('bottom');
  if(ionic.Platform.isAndroid()) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
  }
}]);