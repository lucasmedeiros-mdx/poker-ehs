var PokerEvaluator = require('./evaluator/lib/poker-evaluator')
var deckBuilder = require('./deckbuilder')
var Utils = require('./utils')
var _ = require('lodash')

    
var handStrength = function(ourcards, boardcards, deck) {
    
    var ahead = 0, tied = 0, behind = 0
    var cards = ourcards.concat(boardcards)
    var ourrank = PokerEvaluator.evalHand(cards), opprank, oppcards, compare

    //deck - ourcards - boardcards
    oppcards = deck || Utils.simpleCombine(_.difference(this.deck.deck, cards));

    for (var card of oppcards) {

        cards = card.concat(boardcards)
        opprank = PokerEvaluator.evalHand(cards)        

        compare = Utils.compareHands(ourrank, opprank);
        if (compare == 0) ahead += 1
        else if (compare == 1) tied += 1
        else behind += 1
    }

    var handStrengthValue = (ahead + tied / 2) / (ahead + tied + behind)
    return handStrengthValue
}

var compareHands = function(ourcards, boardcards, deck) {
    
    var cards = ourcards.concat(boardcards);
    if (cards.length == 7) {        
        var hs = this.handStrength(ourcards, boardcards, deck);
        return [hs, hs, 0, 0];
    }

    var ourrank = PokerEvaluator.evalHand(cards)    
    var hp = [ [0,0,0], [0,0,0], [0,0,0] ]
    var index, subindex, copyDeck

    //deck - ourcards - boardcards
    copyDeck = _.difference(this.deck.deck, cards)
    oppcards = deck || Utils.simpleCombine(copyDeck);

    for (var card of oppcards) {
        
        var ncards = boardcards.concat(card)        
        var opprank = PokerEvaluator.evalHand(ncards)
        index = Utils.compareHands(ourrank, opprank)

        var possibleBoards = _.difference(copyDeck, card)
        if (cards.length == 5) {
            possibleBoards = Utils.simpleCombine(possibleBoards);
        } else {
            possibleBoards = possibleBoards.map((e) => [e]);
        }

        for (var possibleBoard of possibleBoards) {         
            
            var board = possibleBoard
            var ourbest = board.concat(cards)
            var ourbestrank = PokerEvaluator.evalHand(ourbest)
            
            var oppbest = board.concat(ncards)
            var oppbestrank = PokerEvaluator.evalHand(oppbest)

            subindex = Utils.compareHands(ourbestrank, oppbestrank)            
            hp[index][subindex] += 1
        }
    }

    var sumAhead = _.sum(hp[0])
    var sumTied = _.sum(hp[1])
    var sumBehind = _.sum(hp[2])

    //Ppot: were behind but moved ahead.    
    var ppot = (hp[2][0]+
                hp[2][1]/2+
                hp[1][0]/2
               ) / (
                sumBehind + sumTied
               ) || 0

    //Npot: were ahead but fell behind.
    var npot = (hp[0][2]+
                hp[1][2]/2+
                hp[0][1]/2
               ) / (
                sumAhead + sumTied
               ) || 0

    var handStrengthValue = (sumAhead+sumTied/2)/(sumAhead+sumTied+sumBehind)
    var handPotentialValue = handStrengthValue * (1 - npot) + (1 - handStrengthValue) * ppot
    return [handPotentialValue, handStrengthValue, ppot, npot]
}

var handPotential = function(ourcards, boardcards, deck) {
    
    var cards = ourcards.concat(boardcards);
    if (cards.length == 7) {        
        var hs = this.handStrength(ourcards, boardcards, deck);
        return [hs, hs, 0, 0];
    }

    var ourrank = PokerEvaluator.evalHand(cards)    
    var hp = [ [0,0,0], [0,0,0], [0,0,0] ]
    var index, subindex, copyDeck

    //deck - ourcards - boardcards
    copyDeck = _.difference(this.deck.deck, cards)
    oppcards = deck || Utils.simpleCombine(copyDeck);

    for (var card of oppcards) {
        
        var ncards = boardcards.concat(card)        
        var opprank = PokerEvaluator.evalHand(ncards)
        index = Utils.compareHands(ourrank, opprank)

        var possibleBoards = _.difference(copyDeck, card)

        for (var possibleBoard of possibleBoards) {         
            
            var board = [possibleBoard]
            var ourbest = board.concat(cards)
            var ourbestrank = PokerEvaluator.evalHand(ourbest)
            
            var oppbest = board.concat(ncards)
            var oppbestrank = PokerEvaluator.evalHand(oppbest)

            subindex = Utils.compareHands(ourbestrank, oppbestrank)            
            hp[index][subindex] += 1
        }
    }

    var sumAhead = _.sum(hp[0])
    var sumTied = _.sum(hp[1])
    var sumBehind = _.sum(hp[2])

    //Ppot: were behind but moved ahead.    
    var ppot = (hp[2][0]+
                hp[2][1]/2+
                hp[1][0]/2
               ) / (
                sumBehind + sumTied
               ) || 0

    //Npot: were ahead but fell behind.
    var npot = (hp[0][2]+
                hp[1][2]/2+
                hp[0][1]/2
               ) / (
                sumAhead + sumTied
               ) || 0

    var handStrengthValue = (sumAhead+sumTied/2)/(sumAhead+sumTied+sumBehind)
    var handPotentialValue = handStrengthValue * (1 - npot) + (1 - handStrengthValue) * ppot
    return [handPotentialValue, handStrengthValue, ppot, npot]
}

var EffectiveHandStrength = {
    deck: new deckBuilder.DeckBuilder(),
    compareHands: compareHands,
    handStrength: handStrength,
    handPotential: handPotential
}


module.exports = {
    EffectiveHandStrength: EffectiveHandStrength
}