
RangeEvaluator = {
	suits: 'CDHS',
	ranks: '23456789TJQKA',
	blackcards: [],

	positions: {
		UTG: 	['77+', 'AQ+', 'AxTx+', 'KxTx+', 'QxTx+', 'Jx9x+', 
				'Tx9x', '9x8x', 'Ax5x'],
		EP: 	['77+', 'AJ+', 'Ax8x+', 'Kx9x+', 'Qx9x+', 'Jx9x+', 
				'Tx9x', '9x8x', 'Ax4x', 'Ax5x', 'Ax6x'],
		Lojack: ['55+', 'AJ+', 'Ax2x+', 'KQ', 'Kx9x+', 'Qx9x+', 
				'Jx9x+', 'Tx8x+', '9x8x', '7x6x'],
		Hijack: ['44+', 'AT+', 'Ax2x+', 'KJ+', 'Kx9x+', 'QJ', 
				'Qx9x+', 'Jx9x+', 'Tx8x+', '9x7x+', '7x6x', '6x5x'],
		Cutoff: ['22+', 'AT+', 'Ax2x+', 'KT+', 'Kx8x+', 'QT+', 
				'Qx8x+', 'JT', 'Jx8x+', 'Tx8x+', '9x7x+', '8x6x+', 
				'7x6x', '6x5x', '5x4x'],
		Button: ['22+', 'A2+', 'Ax2x+', 'K9+', 'Kx3x+', 'Q9+', 'Qx5x+', 
				'J9+', 'Jx6x+', 'T9', 'Tx6x+', '9x6x+', '8x5x+', '7x5x+', 
				'6x4x+', '5x4x', '4x3x'],
		SmallBlind: 	['22+', 'A2+', 'Ax2x+', 'K8+', 'Kx2x+', 'Q8+', 'Qx4x+', 
						'J8+', 'Jx6x+', 'T8+', 'Tx6x+', '98', '9x5x+', '8x4x+', 
						'7x4x+', '6x3x+', '5x3x+', '4x3x', '3x2x'],
		PolarizedBet: 	['TT+', 'AQ+', 'AxQx+', 'Ax2x', 'Ax3x', 'Ax5x', '9x8x', '8x7x', 
						'7x6x', '6x5x', '5x4x'],
		DepolarizedBet: ['88+', 'AQ+', 'AxJx+', 'KxQx']
	}
};

RangeEvaluator.simpleCombine = function* simpleCombine(arr, reverse) {

    var i = 0, j, l = arr.length;   
    for (i; i < l; i++) {
        for (j = i + 1; j < l; j++) {
            yield [arr[i], arr[j]];
            if (reverse) yield [arr[j], arr[i]];
        }
    }
}

RangeEvaluator.combinations = Array.from(RangeEvaluator.simpleCombine(RangeEvaluator.suits));
RangeEvaluator.reverseCombinations = Array.from(RangeEvaluator.simpleCombine(RangeEvaluator.suits, true));

RangeEvaluator.fromRange = function(range) {
	var indexes = range.split(',');
	var hands = [];
	for (var index of indexes) {
		if (index) {
			hands.push.apply(hands, RangeEvaluator.evaluateHand(index.trim()));
		}
	}
	return hands;
};

RangeEvaluator.evaluateHand = function(item) {

	var self = this;
	var deck = [];
	var fill = function(item, arr) {
	    for (var c of arr) {
	        var is = Array.isArray(c);
	        var first = item[0] + (is ? c[0] : c).toUpperCase();
	        var second = item[1] + (is ? c[1] : c).toUpperCase();
	        if (self.blackcards.indexOf(first) === -1 && self.blackcards.indexOf(second) === -1) {
	            deck.push([ first, second ]);
	        }
	    }
	}

	var fillRange = function(item, rank) {
    	if (item[1] === 'x') {
        	fill([item[0], rank], self.suits)
        } else {
        	fill([item[0], rank], [[item[1], item[3]]]);
        }	
	}

	if (item[0] === item[1]) {
		fill(item, self.combinations);
		if (item[2] === '+') {
			var ini = RangeEvaluator.ranks.indexOf(item[0]) + 1;
			var max = RangeEvaluator.ranks.length;
			for (var i = ini; i < max; i++) {
				var rank = RangeEvaluator.ranks[i];
				fill([rank, rank], self.combinations);
			}
		}
	} else
	if (item.length >= 4) {
        fillRange(item, item[2]);

        if (item[4] === '+') {
			var ini = RangeEvaluator.ranks.indexOf(item[2]) + 1;
			var max = RangeEvaluator.ranks.indexOf(item[0]);
			for (var i = ini; i < max; i++) {
				var rank = RangeEvaluator.ranks[i];
		        fillRange(item, rank);
			}
        }
	} else    
    if (item.length === 3) {
    	if (item[2] === '+') {
			var ini = RangeEvaluator.ranks.indexOf(item[1]);
			var max = RangeEvaluator.ranks.indexOf(item[0]);
			for (var i = ini; i < max; i++) {
				var rank = RangeEvaluator.ranks[i];
				fill([item[0], rank], self.combinations);
			}
    	} else {
    		var suit, suited, nonsuited;
	 		if (RangeEvaluator.suits.indexOf(item[1].toUpperCase()) === -1) {
	 			suit = item[2];
	 			suited = item[1];
	 			nonsuited = item[0];
	 		} else {
	 			suit = item[1];
	 			suited = item[0];
	 			nonsuited = item[2];
	 		}
	 		fill([suited, nonsuited], [[suit, 'C'], [suit, 'D'], [suit, 'H'], [suit, 'S']]);
	 	}
    } else {
        fill(item, self.reverseCombinations)
    }
    return deck;
}