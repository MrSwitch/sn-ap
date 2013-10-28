//
// Snap.js
// Angular controller for a game of snap
// @author Andrew Dodson

function snap($scope){

	var suits = ['spade', 'heart', 'diamond', 'club'];

	// DECK
	// Create a deck, 52 cards
	$scope.deck = [];

	for(var x in suits){
		for(var i=1;i<=13;i++){
			$scope.deck.push({
				suit : suits[x],
				value : {11:'J',12:'Q', 13:'K'}[i]||i
			});
		}
	}

	// Set the computer reaction time
	$scope.reaction_time = 1500; // 1 second

	// Set the computer delay between play
	$scope.play_delay = 3000; // 1 second

	// Default user turn
	// Boolean: (True) Computer, (false) Player
	$scope.turn = false;

	// Who won the match
	$scope.winner = null;

	// Who won the match
	$scope.end = false;

	//
	// Start/Reset event
	// When this event is fired, both hands are reset with a shuffled set of the cards
	// @returns null
	$scope.reset = function(){

		// reset: game end flag
		$scope.end = false;

		// reset: winner of the match
		$scope.winner = null;

		// Shuffle the deck
		$scope.deck.sort(function(){
			return Math.random()>0.5;
		});

		// Who's turn?
		// true = computer, false = player
		$scope.turn = Math.random()>0.5;

		// Deal cards to the players
		// We're only going to give the attribute to the item which defines the classname
		angular.forEach($scope.deck, function(a,i){
			a.player = (($scope.turn?0:1) + i)%2 ? "human" : "computer";
		});

		// Position in pack
		$scope.index = -1;

		// 
		// Play the computers first hand
		if($scope.turn){
			setTimeout(function(){
				$scope.play(true);
				$scope.$apply();
			},500);
		}
	};



	//
	// Function,
	// When its a users turn to play
	$scope.play = function(computer){

		// Is the game over?
		if($scope.winner){
			return;
		}

		// Is it the computers turn?
		if( !computer && $scope.turn ){
			// Wait for the computer to play
			return;
		}

		// Check to see if snap exists?
		if( isSnap() ){
			// If play is made whereby "play" is called then the computer wins
			// delay putting down more cards
			if(computer){
				$scope.winner = "computer";
			}
			return;
		}

		// Remove the card from the players hand, placing it into the generic pool
		// Iterate the position in the pack
		var played = $scope.deck[++$scope.index],
			next = $scope.deck[$scope.index+1];
		if(played.player === next.player){
			// No more plays for the other player
			$scope.winner = next.player;
			$scope.end = true;
		}

		// Set played
		played.player = null;

		// Change the players turn
		$scope.turn = !computer;

		// If its the computers go, or a possible snap is on the table, set the computer to react
		if( $scope.turn || isSnap() ){
			// Play the computers turn
			setTimeout(function(){
				$scope.play(true);
				$scope.$apply();
			},parseInt($scope.reaction_time,10));
		}
	};

	//
	// Snap
	// User has called snap
	$scope.snap = function(computer){

		// Has the winner been declared?
		if($scope.winner){
			return;
		}

		// Do the last two items match?
		if(isSnap()){
			$scope.winner = "human";
		}
		else{
			// Award points to the computer before this fail.
			$scope.winner = "computer";
		}
	};


	//
	// Next,
	// For whom ever is the winner of the match, move all the deck in their favour
	$scope.next = function(){

		// Who won?
		if(!$scope.winner){
			// Can't call turn if there are no winners
			return;
		}

		// Chop out all the cards that have been played
		var a = $scope.deck.splice(0,$scope.index+1);

		// Weave them back into the order of the deck
		for(var i=1;i<$scope.deck.length;i++){
			var card = $scope.deck[i], 
				prev = $scope.deck[i-1];
			if(card.player === prev.player && prev.player !== $scope.winner ){
				var insert = a.shift();
				if(insert){
					insert.player = $scope.winner;
					$scope.deck.splice(i,0,insert);
				}
			}
		}

		// Insert remaining items
		angular.forEach(a, function(a,i){
			a.player = $scope.winner;
			$scope.deck.push(a);
		});

		// Reset the winning
		$scope.winner = null;

		// Reset the Index
		$scope.index = -1;

		// If this is the turn of the computer
		if($scope.turn){
			$scope.play(true);
		}
	};


	//
	// Is Snap?
	// Is there a match between the last two played cards?
	function isSnap(){
		
		// Do the last two items match?
		var i = $scope.index,
			snap = $scope.deck[i],
			prev = $scope.deck[i-1];

		return (prev && snap && prev.value === snap.value);
	}

	//
	// Play the first hand
	$scope.reset();
}