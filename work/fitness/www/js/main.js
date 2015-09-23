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
    {name: "Bench Press", attributes: ["rep", "wt"]},
    {name: "Bench Press 1", attributes: ["rep", "wt"]},
    {name: "Bench Press 2", attributes: ["rep", "wt"]},
    {name: "Curl", attributes: ["rep", "wt"]},
    {name: "Shoulder Press", attributes: ["rep", "wt"]},
    {name: "Squat", attributes: ["rep", "wt"]}
  ]

  return {
    initDB: initDB,
    index: index,
    show: show,
    create: create,
    update: update,
    destroy: destroy,
    search: search
  };

  function initDB() {
    PouchDB.allDbs().then(function (dbs) {
      if(dbs.length == 0) {
        _db = new PouchDB('fitness');
        window.PouchDB = PouchDB;
        exercisesSeed.forEach(function(e) {
          e._id = 'exercise_'+e.name.replace(/\s/g,'-').toLowerCase();
          console.log(e);
          _db.put(e);
        });
      }
    }).catch(function (err) {
    });
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
    })
    .state('home.left', {
      url: '/left',
      views: {
        leftright: {
          templateUrl: 'templates/home/left.html'
        }
      }
    })
    .state('home.right', {
      url: '/right',
      views: {
        leftright: {
          templateUrl: 'templates/home/right.html'
        }
      }
    });
}])

.controller('Home', [function() {
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
        program: {},
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

.controller('Program', ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicPlatform', '$ionicHistory', 'ProgramsService', 'ExercisesService',
function($scope, $state, $stateParams, $ionicPopup, $ionicPlatform, $ionicHistory, ProgramsService, ExercisesService) {
  // Load the state params into current scope
  $scope.isNew = $scope.isNew || $stateParams.isNew;
  $scope.action = $scope.action || $stateParams.action;
  $scope.program = $scope.program || $stateParams.program;
  
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
    $scope.weeks = [true,true,true];
    if($scope.clickedCalendar) {
      for(var i=0; i<$scope.weeks.length; i++) {
        if(i != $scope.week) {
          $scope.weeks[i] = false;
        }
      }
    }
	}); 
  
  $scope.save = function() {
		if ($scope.isNew) {
      var d = new Date();
      $scope.program._id = 'program_'+d.valueOf();
			ProgramsService.create($scope.program);
      ProgramsService.show($scope.program._id).then(function(doc) {
        $scope.program = doc;
      });
      $scope.isNew = false;
      $stateParams.isNew = false;
      $scope.action = 'Editing '+$scope.program.name;
		} else {
			ProgramsService.update($scope.program);	
      $state.transitionTo('programs.index');
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
      $state.transitionTo('programs.program', {isNew: false, action: 'Editing '+$scope.program.name, program: $scope.program, week: w, day: d, clickedCalendar: true, calendarClickCounter: $scope.calendarClickCounter+1});
    } else {
      $ionicPopup.alert({
        title: 'No Program Name',
        template: 'Can\'t have an unnamed program.'
      })
    }
	};
  
  if($scope.week > -1) {
    $scope.title = "Week "+$scope.week+", Day "+$scope.day;
  } else {
    $scope.title = $scope.action+" Program";
    $scope.weeks = [true, true, true];
  }
  
  $scope.workouts = [
    {
      name: 'Workout 1',
      sets: [
        {
          name: 'Curl',
          attributes: [ ["rep",10,5,5], ["wt",50,5,5] ]
        },
        {
          name: 'Bench Press',
          attributes: [ ["rep",10,5,5], ["wt",150,5,5] ]
        },
        {
          name: 'Squat',
          attributes: [ ["rep",10,5,5], ["wt",150,5,5] ]
        }
      ]
    }
  ];
  $scope.newset = { name: '' };
  $scope.searchResults = [];
  
  $scope.inc = function(val) {
    console.log(val);
    val = val + 1;
    console.log(val);
  };
  $scope.dec = function(val) {
    if(val >= 0) {
      val = val - 1;
    }
  };
  
  $scope.onSearchExercise = function() {
    console.log("fired onSearchExercise()");
    if($scope.newset.name.length >= 2) {
      ExercisesService.search($scope.newset.name).then(function(results) {
        $scope.searchResults = results;
      });
    } else {
      $scope.searchResults = [];
    }
  }
}]);