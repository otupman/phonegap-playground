(function(controllers) {
  controllers.controller('TodoCtrl', ['$scope', function TodoCtrl($scope) {
    var self = this;
    $scope.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];

    $scope.$on('handleBroadcast', function(event, args) {
      console.log('TodoCtrl::addTodo - received!');
      $scope.todos.push({text:args.text, done:false});
    });
    
    $scope.moreIndex = 0;
    
    $scope.generateMore = function() {
      console.log('Generating more items');
      if (self.isScrolledToBottom(self.rowScrollView())) {
        for(var i = $scope.moreIndex; i < $scope.moreIndex + 20; i++) {
          $scope.todos.push.apply($scope.todos, [{text: 'Item ' + i, done: true}]);
        }
        $scope.moreIndex = i;
      }

      window.setTimeout($scope.generateMore, 1000);
    };

    self.rowScrollView = function() { 
      console.log('rowscrollview');
      console.log($$);
      return $$('#todoList')[0];
    };

    self.isScrolledToBottom =  function(view) {
      console.log(view.scrollTop);
      console.log(view.offsetHeight);
      console.log(view.scrollHeight);
      var startLoadingOffset = 50;
      return view.scrollTop + view.offsetHeight + startLoadingOffset >= view.scrollHeight;
    };

    window.setTimeout($scope.generateMore, 1000);

    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };

    $scope.archive = function() {
      var oldTodos = $scope.todos;
      $scope.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) $scope.todos.push(todo);
      });
    };

    $scope.markAsDone = function(todo) {
      console.log('done');
      todo.done = true;
    };

    $scope.markAsNotDone = function(todo) {
      console.log('not done');
      todo.done = false;
    };
 }]);

  controllers.controller('TodoAddCtrl', ['$scope', function TodoAddCtrl($scope) {
    $scope.addTodo = function() {
      $scope.$emit('handleEmit', {text: $scope.todoText});
      $scope.todoText = '';
      AppRouter.instance.back();
    };
  }]);
})(angular.module('TodoExample'));
