var DeckBuilder = function() {
	//create a deck
	this.ranks = '23456789TJQKA';
	this.suits = 'CDHS';
	this.deck = [];

	for (var r of this.ranks)
		for (var s of this.suits)
			this.deck.push(r + s);
}

DeckBuilder.prototype.shuffle = function() {
	var a = this.deck, currentIndex = a.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = a[currentIndex];
		a[currentIndex] = a[randomIndex];
		a[randomIndex] = temporaryValue;
	}

	return a;
}



var HoldemRound = function() {
	this.players = [];
	this.playerHands = [];
	this.numberOfPlayers = 0;
}

HoldemRound.prototype = new DeckBuilder();

HoldemRound.prototype.dealHand = function(players) {
	this.deck = this.shuffle(this.deck);
	this.players = players;
	this.addPlayers(players);
}

HoldemRound.prototype.addPlayers = function(players) {
	this.playerHands = {};
	this.numberOfPlayers = players.length;
	for (var i = 0; i < this.numberOfPlayers; i++) {		
		this.playerHands[players[i].name] = {
			'position': i,
			'cards': this.handAt(i)
		};
	}
}

HoldemRound.prototype.cardAt = function(initial, ammount) {
	return this.deck.slice(initial, initial + ammount);
}

HoldemRound.prototype.handAt = function(playerPosition) {
	return this.cardAt(5 + (playerPosition * 2), 2);
}

HoldemRound.prototype.fullHandAt = function(playerPosition) {
	return 	this.handAt(playerPosition).concat(this.cardAt(0, 5));
}

HoldemRound.prototype.flop = function() {
	return this.cardAt(0, 3);
}

HoldemRound.prototype.turn = function() {
	return this.cardAt(3, 1);
}

HoldemRound.prototype.river = function() {
	return this.cardAt(4, 1);
}

HoldemRound.prototype.dealtHands = function() {
	var hands = [];
	var communityCards = this.cardAt(0, 5);
	for (var key in this.playerHands) {
		if (this.playerHands.hasOwnProperty(key)) {
			hands.push(this.playerHands[key].cards.concat(communityCards));
		}
	}
	return hands;
}


module.exports = {
	DeckBuilder: DeckBuilder,
	HoldemRound: HoldemRound
};