angular.module('starter.db-service', [])
        
.factory('DBService', ['$q', function($q) {
  var _db;    
  var _objs;
  var exercisesSeed = [
    {name: "Bench Press", attributes: {reps: 0, weight: 0}},
    {name: "Curl", attributes: {reps: 0, weight: 0}},
    {name: "Shoulder Press", attributes: {reps: 0, weight: 0}},
    {name: "Squat", attributes: {reps: 0, weight: 0}}
  ]

  return {
    initDB: initDB,
    index: index,
    show: show,
    create: create,
    update: update,
    destroy: destroy
  };

  function initDB() {
    PouchDB.allDbs().then(function (dbs) {
      if(dbs.length == 0) {
        _db = new PouchDB('fitness');
        window.PouchDB = PouchDB;
        exercisesSeed.forEach(function(e) {
          e._id = "exercise_"+e.name.replace(" ","-");
          console.log(e);
          _db.put(e);
        });
      }
    }).catch(function (err) {
    });
    _db = new PouchDB('fitness');
    window.PouchDB = PouchDB;
  };

  function create(obj) {
    return $q.when(_db.put(obj));
  };

  function update(obj) {
    return $q.when(_db.put(obj));
  };

  function destroy(obj) {
    return $q.when(_db.remove(obj));
  };
  
  function show(id) {
    return $q.when(_db.get(id))
    .then(function(_doc) {
      return _doc;
    });
  }

  function index(modelname) {
    if (!_objs) {
      return $q.when(_db.allDocs({
        include_docs: true,
        startkey: modelname,
        endkey: modelname+'\uffff'
      }))
      .then(function(docs) {

        // Each row has a .doc object and we just want to send an 
        // array of objects back to the calling controller,
        // so let's map the array to contain just the .doc objects.
        _objs = docs.rows.map(function(row) {
            // Dates are not automatically converted from a string.
            row.doc.Date = new Date(row.doc.Date);
            return row.doc;
        });

        // Listen for changes on the database.
        _db.changes({ live: true, since: 'now', include_docs: true})
           .on('change', onDatabaseChange);

       return _objs;
     });
    } else {
      // Return cached data as a promise
      return $q.when(_objs);
    }
  };

  function onDatabaseChange(change) {
    var index = findIndex(_objs, change.id);
    var obj = _objs[index];

    if (change.deleted) {
      if (obj) {
        _objs.splice(index, 1); // delete
      }
    } else {
      if (obj && obj._id === change.id) {
        _objs[index] = change.doc; // update
      } else {
        _objs.splice(index, 0, change.doc) // insert
      }
    }
  }

  function findIndex(array, id) {
    var low = 0, high = array.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid]._id < id ? low = mid + 1 : high = mid
    }
    return low;
  }
}]);
angular.module('starter.analytics', ['ionic'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('analytics', {
    url: '/analytics',
    views: {
      analytics: {
        templateUrl: 'templates/analytics/analytics.html',
        controller: 'Analytics'
      }
    }
  });
}])

.controller('Analytics', [function() {
}]);
angular.module('starter.exercises-service', [])
        
.factory('ExercisesService', ['$q', function($q) {
  var _db;    
  var _objs;
  var exercisesSeed = [
    {name: "Bench Press", attributes: [["rep",0,0,0], ["wt",0,0,0]]},
    {name: "Bench Press 1", attributes: [["rep",0,0,0], ["wt",0,0,0]]},
    {name: "Bench Press 2", attributes: [["rep",0,0,0], ["wt",0,0,0]]},
    {name: "Curl", attributes: [["rep",0,0,0], ["wt",0,0,0]]},
    {name: "Shoulder Press", attributes: [["rep",0,0,0], ["wt",0,0,0]]},
    {name: "Squat", attributes: [["rep",0,0,0], ["wt",0,0,0]]}
  ]

  return {
    loadInitialExercises: loadInitialExercises,
    initDB: initDB,
    index: index,
    show: show,
    create: create,
    update: update,
    destroy: destroy,
    search: search
  };

  function loadInitialExercises() {
    PouchDB.allDbs().then(function (dbs) {
      if(dbs.length == 0) {
        _db = new PouchDB('fitness');
        window.PouchDB = PouchDB;
        exercisesSeed.forEach(function(e) {
          e._id = 'exercise_'+e.name.replace(/\s/g,'-').toLowerCase();
          _db.put(e);
        });
      }
    }).catch(function (err) {
      console.log(err);
    });
  };

  function initDB() {
    _db = new PouchDB('fitness');
    window.PouchDB = PouchDB;
  };
  
  function search(str) {
    return $q.when(_db.allDocs({
      include_docs: true,
      startkey: 'exercise_'+str.replace(/\s/g,'-').toLowerCase(),
      endkey: 'exercise_'+str.replace(/\s/g,'-').toLowerCase()+'\uffff'
    })).then(function(docs) {
      var _results = docs.rows.map(function(row) {
          row.doc.Date = new Date(row.doc.Date);
          return row.doc;
      });

      return _results;
    });
  }

  function create(obj) {
    return $q.when(_db.put(obj));
  };

  function update(obj) {
    return $q.when(_db.put(obj));
  };

  function destroy(obj) {
    return $q.when(_db.remove(obj));
  };
  
  function show(id) {
    return $q.when(_db.get(id))
    .then(function(_doc) {
      return _doc;
    });
  }

  function index(modelname) {
    if (!_objs) {
      return $q.when(_db.allDocs({
        include_docs: true,
        startkey: modelname,
        endkey: modelname+'\uffff'
      }))
      .then(function(docs) {

        // Each row has a .doc object and we just want to send an 
        // array of objects back to the calling controller,
        // so let's map the array to contain just the .doc objects.
        _objs = docs.rows.map(function(row) {
            // Dates are not automatically converted from a string.
            row.doc.Date = new Date(row.doc.Date);
            return row.doc;
        });

        // Listen for changes on the database.
        _db.changes({ live: true, since: 'now', include_docs: true})
           .on('change', onDatabaseChange);

        return _objs;
     });
    } else {
      // Return cached data as a promise
      return $q.when(_objs);
    }
  };

  function onDatabaseChange(change) {
    if(change.id.lastIndexOf('exercise_', 0) === 0) {
      var index = findIndex(_objs, change.id);
      var obj = _objs[index];

      if (change.deleted) {
        if (obj) {
          _objs.splice(index, 1); // delete
        }
      } else {
        if (obj && obj._id === change.id) {
          _objs[index] = change.doc; // update
        } else {
          _objs.splice(index, 0, change.doc) // insert
        }
      }
    }
  }

  function findIndex(array, id) {
    var low = 0, high = array.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid]._id < id ? low = mid + 1 : high = mid
    }
    return low;
  }
}]);
angular.module('starter.exercises', ['ionic'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('exercises', {
      abstract: true,
      url: '/exercises',
      views: {
        exercises: {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('exercises.index', {
      cache: false,
      url: '',
      templateUrl: 'templates/exercises/exercises.html',
      controller: 'Exercises'
    })
    .state('exercises.exercise', {
      cache: false,
      url: '/exercise',
      templateUrl: 'templates/exercises/exercise.html',
      controller: 'Exercise',
      params: {
        isNew: true,
        action: 'Add',
        exercise: {name: '', attributes: []}
      }
    });
}])

.controller('Exercises', ['$scope', '$ionicPlatform', 'ExercisesService',
function($scope, $ionicPlatform, ExercisesService) {
  // Initialize the database.
	$ionicPlatform.ready(function() {
		ExercisesService.initDB();

		// Get all program records from the database.
		ExercisesService.index('exercise_').then(function(exercises) {
			$scope.exercises = exercises;
		});
	});  
}])

.controller('Exercise', ['$scope', '$stateParams', '$ionicPlatform', '$ionicHistory', 'ExercisesService',
function($scope, $stateParams, $ionicPlatform, $ionicHistory, ExercisesService) {
  $scope.isNew = $scope.isNew || $stateParams.isNew;
  $scope.action = $scope.action || $stateParams.action;
  $scope.exercise = $scope.exercise|| $stateParams.exercise;
  
  $scope.attributeList = [
    ["wt","Weight",false],
    ["rep","Repetitions",false],
    ["time","Time",false],
    ["dist","Distance",false]
  ];
  
  // Initialize the database.
	$ionicPlatform.ready(function() {
		ExercisesService.initDB();
    for(var i=0; i<$scope.exercise.attributes.length; i++) {
      for(var j=0; j<$scope.attributeList.length; j++) {
        if($scope.attributeList[j][0] == $scope.exercise.attributes[i][0]) {
          $scope.attributeList[j][2] = true;
        }
      }
    }
	});
  
  $scope.save = function() {
    if($scope.exercise.name != null && $scope.exercise.name != "") {
      if ($scope.isNew) {
        var d = new Date();
        $scope.exercise._id = 'exercise_'+$scope.exercise.name.replace(/\s/g,'-').toLowerCase();
        ExercisesService.create($scope.exercise);
        $ionicHistory.goBack();
      } else {
        ExercisesService.update($scope.exercise);	
        $ionicHistory.goBack();
      }
    } else {
      $ionicPopup.alert({
        title: 'No Exercise Name',
        template: 'Can\'t have an unnamed exercise.'
      });
    }
	};
  
  $scope.onChangeAttribute = function() {
    for(var i=0; i<$scope.attributeList.length; i++) {
      var index = arrayObjectIndexOf($scope.exercise.attributes, $scope.attributeList[i][0], 0);
      console.log(index);
      if($scope.attributeList[i][2] == true) {
        if (index == -1) {
          $scope.exercise.attributes.push([$scope.attributeList[i][0],0,0,0]);
        }
      } else {
        if (index > -1) {
          $scope.exercise.attributes.splice(index, 1);
        }
      }
    }
  };
  
  function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
      if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
  }
}]);

angular.module('starter.programs-service', [])
        
.factory('ProgramsService', ['$q', function($q) {
  var _db;    
  var _objs;

  return {
    initDB: initDB,
    index: index,
    show: show,
    create: create,
    update: update,
    destroy: destroy
  };

  function initDB() {
    _db = new PouchDB('fitness');
    window.PouchDB = PouchDB;
  };

  function create(obj) {
    return $q.when(_db.put(obj));
  };

  function update(obj) {
    return $q.when(_db.put(obj));
  };

  function destroy(obj) {
    return $q.when(_db.remove(obj));
  };
  
  function show(id) {
    return $q.when(_db.get(id))
    .then(function(_doc) {
      return _doc;
    });
  }

  function index(modelname) {
    if (!_objs) {
      return $q.when(_db.allDocs({
        include_docs: true,
        startkey: modelname,
        endkey: modelname+'\uffff'
      }))
      .then(function(docs) {

        // Each row has a .doc object and we just want to send an 
        // array of objects back to the calling controller,
        // so let's map the array to contain just the .doc objects.
        _objs = docs.rows.map(function(row) {
            // Dates are not automatically converted from a string.
            row.doc.Date = new Date(row.doc.Date);
            return row.doc;
        });

        // Listen for changes on the database.
        _db.changes({ live: true, since: 'now', include_docs: true})
           .on('change', onDatabaseChange);

       return _objs;
     });
    } else {
      // Return cached data as a promise
      return $q.when(_objs);
    }
  };

  function onDatabaseChange(change) {
    if(change.id.lastIndexOf('program_', 0) === 0) {
      var index = findIndex(_objs, change.id);
      var obj = _objs[index];

      if (change.deleted) {
        if (obj) {
          _objs.splice(index, 1); // delete
        }
      } else {
        if (obj && obj._id === change.id) {
          _objs[index] = change.doc; // update
        } else {
          _objs.splice(index, 0, change.doc) // insert
        }
      }
    }
  }

  function findIndex(array, id) {
    var low = 0, high = array.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid]._id < id ? low = mid + 1 : high = mid
    }
    return low;
  }
}]);
angular.module('starter.programs', ['ionic'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('programs', {
      abstract: true,
      url: '/programs',
      views: {
        programs: {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('programs.index', {
      url: '',
      templateUrl: 'templates/programs/programs.html',
      controller: 'Programs'
    })
    .state('programs.program', {
      cache: false,
      url: '/program',
      templateUrl: 'templates/programs/program.html',
      controller: 'Program',
      params: {
        isNew: true,
        action: 'Add',
        program_id: '',
        week: -1,
        day: -1,
        clickedCalendar: false,
        calendarClickCounter: 0
      }
    });
}])

.controller('Programs', ['$scope', '$ionicPlatform', 'ProgramsService',
function($scope, $ionicPlatform, ProgramsService) {
  // Initialize the database.
	$ionicPlatform.ready(function() {
		ProgramsService.initDB();

		// Get all program records from the database.
		ProgramsService.index('program_').then(function(programs) {
			$scope.programs = programs;
		});
	});  
}])

.controller('Program', ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicPlatform', '$ionicHistory', 'ProgramsService', 'ExercisesService', 'WorkoutsService',
function($scope, $state, $stateParams, $ionicPopup, $ionicModal, $ionicPlatform, $ionicHistory, ProgramsService, ExercisesService, WorkoutsService) {
  // Load the state params into current scope
  $scope.isNew = $scope.isNew || $stateParams.isNew;
  $scope.action = $scope.action || $stateParams.action;
  $scope.program_id = $scope.program_id || $stateParams.program_id;
  
  $scope.week = $scope.week || $stateParams.week;
  $scope.day = $scope.day || $stateParams.day;
  
  $scope.calendarClickCounter = $scope.calendarClickCounter || $stateParams.calendarClickCounter;
  
  $scope.clickedCalendar = $stateParams.clickedCalendar;
  if($scope.week == -1) { $scope.clickedCalendar = false; }
  $scope.$parent.clickedCalendar = $scope.clickedCalendar;
  
  $scope.programGoBack = function() {
    if($scope.clickedCalendar) {
      $ionicHistory.goBack(-$scope.calendarClickCounter);
    } else {
      $ionicHistory.goBack();
    }
  };
  
  // Initialize the database.
	$ionicPlatform.ready(function() {
		ProgramsService.initDB();
    ExercisesService.initDB();
    if($scope.isNew) {
      $scope.program = {calendarSummary: [{display: true, days:[0,0,0,0,0,0,0]},{display: true, days:[0,0,0,0,0,0,0]},{display: true, days:[0,0,0,0,0,0,0]}]};
    } else {
      ProgramsService.show($scope.program_id).then(function(doc) {
        $scope.program = doc;
        if($scope.clickedCalendar) {
          for(var i=0; i<$scope.program.calendarSummary.length; i++) {
            if(i != $scope.week) {
              $scope.program.calendarSummary[i].display = false;
            }
          }
          WorkoutsService.initDB();
          // Get all program records from the database.
          WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_').then(function(workouts) {
            $scope.workouts = workouts;
            if($scope.workouts.length == 0) {
              $scope.workouts = [
                {
                  name: 'Workout 1',
                  sets: []
                }
              ];
            }
          });
        }
        if($scope.week > -1) {
          $scope.title = "Week "+$scope.week+", Day "+$scope.day;
        } else {
          $scope.title = $scope.action+" Program";
          if($scope.program.calendarSummary) {
            for(var i=0; i<$scope.program.calendarSummary.length; i++) {
              $scope.program.calendarSummary[i].display = true;
            }
          }
        }

        $scope.newset = { name: '' };
        $scope.searchResults = [];
      });
    }
	});
  
  $ionicModal.fromTemplateUrl('new-set-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.newSetModal = modal;
  });
  $scope.openNewSetModal = function(w) {
    $scope.setWorkout = w;
    $scope.newSetModal.show();
  };
  $scope.closeNewSetModal = function() {
    $scope.newSetModal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.newSetModal.remove();
  });
  
  $scope.save = function() {
    if($scope.program.name != null && $scope.program.name != "") {
      if ($scope.isNew) {
        var d = new Date();
        $scope.program._id = 'program_'+d.valueOf();
        ProgramsService.create($scope.program);
        ProgramsService.show($scope.program._id).then(function(doc) {
          $scope.program = doc;
        });
        $scope.isNew = false;
        $scope.action = 'Editing '+$scope.program.name;
        $scope.program_id = $scope.program._id;
        $stateParams.isNew = false;
        $stateParams.action =  'Editing '+$scope.program.name;
        $stateParams.program_id = $scope.program._id;
        $ionicHistory.currentView().stateId = getCurrentStateId();
        $ionicHistory.currentView().stateName = $state.current.name;
        $ionicHistory.currentView().stateParams = angular.copy($state.params);
      } else {
        ProgramsService.update($scope.program);	
        ProgramsService.show($scope.program._id).then(function(doc) {
          $scope.program = doc;
        });
        // $state.transitionTo('programs.index');
      }
    } else {
      $ionicPopup.alert({
        title: 'No Program Name',
        template: 'Can\'t have an unnamed program.'
      });
    }
	};
	
	$scope.delete = function() {
    $ionicPopup.confirm({
      title: 'Delete Program',
      template: 'Are you sure you want delete this program? This cannot be reversed.'
    }).then(function(res) {
      if(res) {
        ProgramsService.destroy($scope.program);			
        $state.transitionTo('programs.index');
      }
    });
	};
  
  // Calendar view.
  $scope.range = function(num) {
    return new Array(num);   
  };
  $scope.clickCalendar = function(w, d) {
    if($scope.program.name != null && $scope.program.name != "") {
      $state.transitionTo('programs.program', {isNew: false, action: 'Editing '+$scope.program.name, program_id: $scope.program._id, week: w, day: d, clickedCalendar: true, calendarClickCounter: $scope.calendarClickCounter+1});
    } else {
      $ionicPopup.alert({
        title: 'No Program Name',
        template: 'Can\'t have an unnamed program.'
      });
    }
	};
  
  $scope.onSearchExercise = function() {
    if($scope.newset.name.length >= 2) {
      ExercisesService.search($scope.newset.name).then(function(results) {
        $scope.searchResults = results;
      });
    } else {
      $scope.searchResults = [];
    }
  };
  
  $scope.addSet = function(r) {
    $scope.setWorkout.sets.push(r);
    $scope.saveWorkout($scope.setWorkout);
    $scope.newset = { name: '' };
    $scope.searchResults = [];
    $scope.closeNewSetModal();
  };
  
  $scope.deleteSet = function(w, i) {
    w.sets.splice(i, 1);
    if(w.sets.length == 0) {
      if($scope.workouts.length == 1) {
        WorkoutsService.destroy(w);
        $scope.program.calendarSummary[$scope.week].days[$scope.day] = 0;
        $scope.save();
      }
    } else {
      $scope.saveWorkout(w);
    }
  };
  
  $scope.saveWorkout = function(w) {
    if (!w._id) {
      var d = new Date();
      w._id = 'workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_'+d.valueOf();
			WorkoutsService.create(w);
		} else {
			WorkoutsService.update(w);
		}
    WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_').then(function(workouts) {
      $scope.workouts = workouts;
      $scope.program.calendarSummary[$scope.week].days[$scope.day] = $scope.workouts.length;
      $scope.save();
    });
  }
  
  //extracted from $ionicHistory
  function getCurrentStateId() {
    var id;
    if ($state && $state.current && $state.current.name) {
      id = $state.current.name;
      if ($state.params) {
        for (var key in $state.params) {
          if ($state.params.hasOwnProperty(key) && $state.params[key]) {
            id += "_" + key + "=" + $state.params[key];
          }
        }
      }
      return id;
    }
    // if something goes wrong make sure its got a unique stateId
    return ionic.Utils.nextUid();
  };
}]);
angular.module('starter.home', ['ionic'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      views: {
        home: {
          templateUrl: 'templates/home/home.html',
          controller: 'Home'
        }
      }
    });
}])

.controller('Home', [function() {
}]);
angular.module('starter.splash', ['ionic'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('splash', {
      url: '/splash',
      views: {
        home: {
          templateUrl: 'templates/splash/splash.html',
          controller: 'Splash'
        }
      }
    });
}])

.controller('Splash', ['$scope', '$state', '$timeout', '$ionicPlatform', 'ExercisesService',
function($scope, $state, $timeout, $ionicPlatform, ExercisesService) {
  // Initialize the database.
	$ionicPlatform.ready(function() {
		ExercisesService.loadInitialExercises();
    $timeout(function() {
      $state.transitionTo('home');
    }, 2500);
	});  
}]);
angular.module('starter.workouts-service', [])
        
.factory('WorkoutsService', ['$q', function($q) {
  var _db;    
  var _objs;

  return {
    initDB: initDB,
    index: index,
    show: show,
    create: create,
    update: update,
    destroy: destroy
  };

  function initDB() {
    _db = new PouchDB('fitness');
    window.PouchDB = PouchDB;
  };

  function create(obj) {
    return $q.when(_db.put(obj));
  };

  function update(obj) {
    return $q.when(_db.put(obj));
  };

  function destroy(obj) {
    return $q.when(_db.remove(obj));
  };
  
  function show(id) {
    return $q.when(_db.get(id))
    .then(function(_doc) {
      return _doc;
    });
  }

  function index(modelname) {
    return $q.when(_db.allDocs({
      include_docs: true,
      startkey: modelname,
      endkey: modelname+'\uffff'
    }))
    .then(function(docs) {

      // Each row has a .doc object and we just want to send an 
      // array of objects back to the calling controller,
      // so let's map the array to contain just the .doc objects.
      _objs = docs.rows.map(function(row) {
          // Dates are not automatically converted from a string.
          row.doc.Date = new Date(row.doc.Date);
          return row.doc;
      });

      return _objs;
   });
  };
}]);