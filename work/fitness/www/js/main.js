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
    {name: "Bench Press", attributes: [["rep",0,0,true,true], ["wt",0,0,true,true]]},
    {name: "Bench Press 1", attributes: [["rep",0,0,true,true], ["wt",0,0,true,true]]},
    {name: "Bench Press 2", attributes: [["rep",0,0,true,true], ["wt",0,0,true,true]]},
    {name: "Curl", attributes: [["rep",0,0,true,true], ["wt",0,0,true,true]]},
    {name: "Shoulder Press", attributes: [["rep",0,0,true,true], ["wt",0,0,true,true]]},
    {name: "Squat", attributes: [["rep",0,0,true,true], ["wt",0,0,true,true]]}
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

.controller('Exercise', ['$scope', '$state', '$stateParams', '$ionicPlatform', '$ionicPopup', '$ionicHistory', 'ExercisesService',
function($scope, $state, $stateParams, $ionicPlatform, $ionicPopup, $ionicHistory, ExercisesService) {
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
  
  $scope.delete = function() {
    $ionicPopup.confirm({
      title: 'Delete Exercise',
      template: 'Are you sure you want delete this exercise? This cannot be reversed.'
    }).then(function(res) {
      if(res) {
        ExercisesService.destroy($scope.exercise);			
        $state.transitionTo('exercises.index');
      }
    });
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

.controller('Home', ['$scope', function($scope) {
  $scope.prefs = {
    name: 'Carlo Luminaut',
    quote: 'Haters gon\' hate.',
    wt: {
      unit: 'lb',
      inc: 5
    }
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
    })
    .state('programs.workout', {
      cache: false,
      url: '/workout',
      templateUrl: 'templates/programs/workout.html',
      controller: 'Workout',
      params: {
        isNew: true,
        action: 'Add Workout',
        workout_id: '',
        program_id: '',
        week: -1,
        day: -1,
        editType: 'none'
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

.controller('Program', ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicPlatform', '$ionicHistory', 'ProgramsService','WorkoutsService',
function($scope, $state, $stateParams, $ionicPopup, $ionicModal, $ionicPlatform, $ionicHistory, ProgramsService, WorkoutsService) {
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
  
  $scope.$on('$ionicView.afterEnter', function() {
    // Initialize the database.
    $ionicPlatform.ready(function() {
      ProgramsService.initDB();
      WorkoutsService.initDB();
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
            // Get all program records from the database.
            WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_').then(function(workouts) {
              $scope.workouts = workouts;
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
  
  $scope.addWeek = function() {
    $scope.program.calendarSummary.push({display: true, days:[0,0,0,0,0,0,0]});
    $scope.save();
  };
  
  $scope.removeWeek = function() {
    $ionicPopup.confirm({
      title: 'Remove Week',
      template: 'Remove the week and all workouts under it? This cannot be reversed.'
    }).then(function(res) {
      $scope.program.calendarSummary.pop();
      $scope.save();
      WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.program.calendarSummary.length).then(function(workouts) {
        for(var i=0; i<workouts.length; i++) {
          WorkoutsService.destroy(workouts[i]);
        }
      });
    });
  };
  
  $ionicModal.fromTemplateUrl('edit-type-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.editTypeModal = modal;
  });
  $scope.openEditTypeModal = function(w) {
    $scope.w = w;
    $scope.editTypeModal.show();
  };
  $scope.closeEditTypeModal = function() {
    $scope.editTypeModal.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.editTypeModal.remove();
  });
  
  $scope.doWorkout = function(isNew, action, workout_id, editType) {
    $state.transitionTo('programs.workout', {isNew: isNew, action: action, workout_id: workout_id, editType: editType, program_id: $scope.program._id, week: $scope.week, day: $scope.day});
  };
  
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
}])

.controller('Workout', ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicPlatform', '$ionicHistory', 'ProgramsService', 'ExercisesService', 'WorkoutsService',
function($scope, $state, $stateParams, $ionicPopup, $ionicModal, $ionicPlatform, $ionicHistory, ProgramsService, ExercisesService, WorkoutsService) {
  // Load the state params into current scope
  $scope.isNew = $scope.isNew || $stateParams.isNew;
  $scope.action = $scope.action || $stateParams.action;
  $scope.workout_id = $scope.workout_id || $stateParams.workout_id;
  $scope.program_id = $scope.program_id || $stateParams.program_id;
  $scope.editType = $scope.editType || $stateParams.editType;
  
  $scope.week = $scope.week || $stateParams.week;
  $scope.day = $scope.day || $stateParams.day;
  
  $scope.$on('$ionicView.afterEnter', function() {
    // Initialize the database.
    $ionicPlatform.ready(function() {
      ProgramsService.initDB();
      ExercisesService.initDB();
      ProgramsService.show($scope.program_id).then(function(doc) {
        $scope.program = doc;
        WorkoutsService.initDB();
        if($scope.workout_id == '' ) {
          $scope.workout = {name: 'Workout', week: $scope.week, day: $scope.day, repeatEvery: 0, repeatTimes: 0, sets: []};
        } else {
          WorkoutsService.show($scope.workout_id).then(function(workout) {
            $scope.workout = workout;
            WorkoutsService.findSeries($scope.workout.series).then(function(seriesResult) {
              console.log("seriesResult 0:");
              console.log(seriesResult);
              $scope.seriesResult = seriesResult;
            });
          });
        }

        $scope.newset = { name: '' };
        $scope.searchResults = [];
      });
    });
  });
  
  $ionicModal.fromTemplateUrl('new-set-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.newSetModal = modal;
  });
  $scope.openNewSetModal = function(w) {
    $scope.newSetModal.show();
  };
  $scope.closeNewSetModal = function() {
    $scope.newSetModal.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.newSetModal.remove();
  });
  
  $ionicModal.fromTemplateUrl('repeat-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.repeatModal = modal;
  });
  $scope.openRepeatModal = function(w) {
    $scope.repeatModal.show();
    $scope.repeatModal.repeats = true;
    if($scope.workout.repeatEvery > 0) {
      $scope.repeatModal.repeatEvery = $scope.workout.repeatEvery;
    } else {
      $scope.repeatModal.repeatEvery = 1;
    }
    if($scope.workout.repeatTimes == 0) {
      $scope.repeatModal.repeatTimes = 1;
      $scope.repeatModal.repeatForever = "1";
    } else {
      $scope.repeatModal.repeatTimes = $scope.workout.repeatTimes;
      $scope.repeatModal.repeatForever = "0";
    }
  };
  $scope.closeRepeatModal = function() {
    $scope.repeatModal.hide();
  };
  $scope.saveRepeat = function() {
    $scope.repeatModal.hide();
    if($scope.repeatModal.repeats) {
      $scope.workout.repeatEvery = $scope.repeatModal.repeatEvery;
      if($scope.repeatModal.repeatForever == "1") {
        $scope.workout.repeatTimes = 0;
      } else {
        $scope.workout.repeatTimes = $scope.repeatModal.repeatTimes;
      }
    } else {
      $scope.workout.repeatEvery = 0;
      $scope.workout.repeatTimes = 0;
    }
    $scope.saveWorkout($scope.workout);
  };
  $scope.$on('$destroy', function() {
    $scope.repeatModal.remove();
  });
  
  $scope.save = function() {
    ProgramsService.update($scope.program);	
    ProgramsService.show($scope.program._id).then(function(doc) {
      $scope.program = doc;
    });
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
    $scope.workout.sets.push(r);
    $scope.saveWorkout($scope.workout);
    $scope.newset = { name: '' };
    $scope.searchResults = [];
    $scope.closeNewSetModal();
  };
  
  $scope.deleteSet = function(w, i) {
    w.sets.splice(i, 1);
    if(w.sets.length == 0) {
      WorkoutsService.destroy(w);
      WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_').then(function(workouts) {
        $scope.program.calendarSummary[$scope.week].days[$scope.day] = workouts.length;
        $scope.save();
        if(workouts.length == 0) {
          $scope.workout = {name: 'Workout 1', sets: []};
        }
      });
    } else {
      $scope.saveWorkout(w);
    }
  };
  
  $scope.saveWorkout = function(w) {
    if (!w._id) {
      var d = new Date();
      w._id = 'workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_'+d.valueOf();
      w.series = w._id;
      w.seriesIndex = 0;
			WorkoutsService.create(w);
		} else {
      if($scope.workout.repeatEvery > 0 && $scope.workout.sets.length > 0) {
        $scope.createWorkoutSeries();
      } else {
        WorkoutsService.update(w);
      }
		}
    WorkoutsService.show(w._id).then(function(workout) {
      $scope.workout = workout;
    });
    WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_').then(function(workouts) {
      $scope.program.calendarSummary[$scope.week].days[$scope.day] = workouts.length;
      $scope.save();
    });
  }
  
  $scope.createWorkoutSeries = function() {
    if($scope.workout.repeatEvery > 0) {
      var repeatTimes = 0;
      var repWeek = $scope.week;
      var repDay = $scope.day;
      var jumpWeek = ~~(($scope.workout.repeatEvery + repDay)/7);
      var jumpDay = ($scope.workout.repeatEvery + repDay)%7;
      repWeek += jumpWeek;
      repDay = jumpDay;
      var repArray = [];
      var i = 1;
        
      var repeatWorkouts;
      // if repeats forever
      if($scope.workout.repeatTimes == 0) { 
        repeatWorkouts = $scope.program.calendarSummary.length * 7;
      } else {
        repeatWorkouts = $scope.workout.repeatTimes - 1;
      }
      
      console.log("$scope.workout:");
      console.log($scope.workout);
      var bulkWorkouts = [$scope.workout];
      
      while(repWeek < $scope.program.calendarSummary.length && i <= repeatWorkouts) {
        var d = new Date();
        var repWorkout = JSON.parse(JSON.stringify($scope.workout));
        delete repWorkout._rev;
        repWorkout._id = 'workout_'+$scope.program._id+'_week_'+repWeek+'_day_'+repDay+'_workout_'+d.valueOf();
        repWorkout.week = repWeek;
        repWorkout.day = repDay;
        repWorkout.series = $scope.workout._id;
        repWorkout.seriesIndex = i;
        bulkWorkouts.push(repWorkout);
        repArray.push([repWeek, repDay]);
        jumpWeek = ~~(($scope.workout.repeatEvery + repDay)/7);
        jumpDay = ($scope.workout.repeatEvery + repDay)%7;
        repWeek += jumpWeek;
        repDay = jumpDay;
        i++;
        repeatTimes++;
      }
      
      if($scope.seriesResult && $scope.seriesResult.length > 0) {
        for(var i=0; i<$scope.seriesResult.length; i++) {
          $scope.program.calendarSummary[$scope.seriesResult[i].week].days[$scope.seriesResult[i].day] -= 1;
        }
        WorkoutsService.bulkCreate(bulkWorkouts).then(function() {
          WorkoutsService.bulkDestroy($scope.seriesResult).then(function() {
            WorkoutsService.findSeries($scope.workout.series).then(function(seriesResult) {
              console.log("seriesResult 1:");
              console.log($scope.seriesResult);
              $scope.seriesResult = seriesResult;
            });
          });
        });
      } else {
        WorkoutsService.bulkCreate(bulkWorkouts).then(function() {
          WorkoutsService.findSeries($scope.workout.series).then(function(seriesResult) {
            console.log("seriesResult 2:");
            console.log($scope.seriesResult);
            $scope.seriesResult = seriesResult;
          });
        });
      }
      
      for(var i=0; i<repArray.length; i++) {
        $scope.program.calendarSummary[repArray[i][0]].days[repArray[i][1]] += 1;
      }

      $scope.save();
    }
  };
  
  $scope.deleteWorkout = function(w) {
    WorkoutsService.destroy(w);
    WorkoutsService.index('workout_'+$scope.program._id+'_week_'+$scope.week+'_day_'+$scope.day+'_workout_').then(function(workouts) {
      $scope.program.calendarSummary[$scope.week].days[$scope.day] = workouts.length;
      $scope.save();
      $ionicHistory.goBack();
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
  var workoutSeriesIndex = {
    _id: '_design/workout_series_index',
    views: {
      'workout_series_index': {
        map: function (doc) {
          if(doc.series) {
            emit(doc.series);
          }
        }.toString()
      }
    }
  };

  return {
    initDB: initDB,
    index: index,
    show: show,
    create: create,
    bulkCreate: bulkCreate,
    update: update,
    destroy: destroy,
    bulkDestroy: bulkDestroy,
    findSeries: findSeries
  };

  function initDB() {
    _db = new PouchDB('fitness');
    window.PouchDB = PouchDB;
    
    _db.get('_design/workout_series_index').catch(function (err) {
      if (err.status === 404) { // not found!
        // create the index
        _db.put(workoutSeriesIndex).then(function () {
          // kick off an initial build, return immediately
          return _db.query('workout_series_index', {stale: 'update_after'});
        });
      } else { // hm, some other error
        throw err;
      }
    });
  };

  function create(obj) {
    return $q.when(_db.put(obj));
  };
  
  function bulkCreate(obj) {
    console.log("bulkCreate obj:");
    console.log(obj);
    return $q.when(_db.bulkDocs(obj));
  };

  function update(obj) {
    return $q.when(_db.put(obj));
  };

  function destroy(obj) {
    return $q.when(_db.remove(obj));
  };
  
  function bulkDestroy(obj) {
    console.log("bulkDestroy obj:");
    console.log(obj);
    var deleteObj = obj.map(function(doc) {
      doc._deleted = true;
      return doc;
    });
    return $q.when(_db.bulkDocs(deleteObj));
  };
  
  function show(id) {
    return $q.when(_db.get(id))
    .then(function(_doc) {
      return _doc;
    });
  }
  
  function findSeries(series) {
    return $q.when(_db.query('workout_series_index', {key: series, include_docs: true}))
    .then(function(docs) {
      return docs.rows.map(function(row) {
        return row.doc;
      });
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
        return row.doc;
      });

      return _objs;
   });
  };
}]);