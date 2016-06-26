function memoize( fn ) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            hash = "",
            i = args.length;
        currentArg = null;
        while (i--) {
            currentArg = args[i];
            hash += (currentArg === Object(currentArg)) ?
            JSON.stringify(currentArg) : currentArg;
            fn.memoize || (fn.memoize = {});
        }
        return (hash in fn.memoize) ? fn.memoize[hash] :
        fn.memoize[hash] = fn.apply(this, args);
    };
}

var compare = memoize(function(compareFrom, compareTo) {

	if (compareTo === null) return 1;
	if (compareFrom === null) return -1;
	
	if (Array.isArray(compareFrom) && Array.isArray(compareTo)) {

		if (compareFrom.length === 0 && compareTo.length === 0) 
			return 0;

		var cpFrom = compareFrom.slice();
		var cpTo = compareTo.slice();
		var left = cpFrom.shift();
		var right = cpTo.shift();
		var result = compare(left, right);

		if (result === 0)
			return compare(cpFrom, cpTo);
		else 
			return result;
	} 
	else {		
		if (compareFrom > compareTo) return 1;
		else if (compareFrom < compareTo) return -1;
		else return 0;
	}
})

var factorial = memoize(function(n) {
	if (n == 0 || n == 1)
	    return 1;
  	return factorial(n-1) * n;
});


var simpleCombine = function* simpleCombine(arr, reverse) {

    var i = 0, j, l = arr.length;   
    for (i; i < l; i++) {
        for (j = i + 1; j < l; j++) {
            yield [arr[i], arr[j]];
            if (reverse) yield [arr[j], arr[i]];
        }
    }
}

var sortBy = function(cards) {
    var text = '23456789TJQKA';    
    return cards.sort(function(a, b) { 
    	return text.indexOf(b[0]) > text.indexOf(a[0]) 
    });
}

var compareHands = function(rank, prevRank) {
	if ((rank.handType > prevRank.handType) ||
	    (rank.handType === prevRank.handType && rank.handRank > prevRank.handRank)) {
	    return 0;
	}
	else if (rank.handType === prevRank.handType && rank.handRank === prevRank.handRank) {
		return 1;
	} else {
		return 2;
	}
}


module.exports = {
	simpleCombine: simpleCombine,
	compare: compare,
	memoize: memoize,
	sortBy: sortBy,
	compareHands: compareHands
};