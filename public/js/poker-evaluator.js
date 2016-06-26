(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//converts 3 card to lowest equivalent 5 card hand
module.exports = {
  CARDVALS: ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a'],
  CARDS: {
    "2c": 1,
    "2d": 2,
    "2h": 3,
    "2s": 4,
    "3c": 5,
    "3d": 6,
    "3h": 7,
    "3s": 8,
    "4c": 9,
    "4d": 10,
    "4h": 11,
    "4s": 12,
    "5c": 13,
    "5d": 14,
    "5h": 15,
    "5s": 16,
    "6c": 17,
    "6d": 18,
    "6h": 19,
    "6s": 20,
    "7c": 21,
    "7d": 22,
    "7h": 23,
    "7s": 24,
    "8c": 25,
    "8d": 26,
    "8h": 27,
    "8s": 28,
    "9c": 29,
    "9d": 30,
    "9h": 31,
    "9s": 32,
    "tc": 33,
    "td": 34,
    "th": 35,
    "ts": 36,
    "jc": 37,
    "jd": 38,
    "jh": 39,
    "js": 40,
    "qc": 41,
    "qd": 42,
    "qh": 43,
    "qs": 44,
    "kc": 45,
    "kd": 46,
    "kh": 47,
    "ks": 48,
    "ac": 49,
    "ad": 50,
    "ah": 51,
    "as": 52
  },
  makesStraight: function(cardsUsed, rank) {
    //add ace to bottom as well
    var newCards = [cardsUsed[12]].concat(cardsUsed);
    //add in new card (pushed up one by ace)
    newCards[rank+1] = 2;
    //determine if there are 5 cards in a row
    return 5 === newCards.reduce(function(prev, next) {
      if (prev === 5) {
        return 5;
      } else {
        return next ? prev + 1 : 0;
      }
    });
  },

  fillHand: function(cards) {

    var cardsUsed = [0,0,0,0,0,0,0,0,0,0,0,0,0];

    //convert each card to vals 0-12, strip suit
    cards.forEach(function(card) {
      var i = Math.floor((this.CARDS[card.toLowerCase()]-1)/4);
      cardsUsed[i] = 1;
    }, this);

    var toFill = 2; //need to fill 2 cards

    //fill in <toFill> cards to complete 5 card hand
    for (var i = 0; i < 13; i++) {
      if (toFill == 0) break; //done filling
      //prevent adding a card to finish a straight
      if (cardsUsed[i] == 0 && !this.makesStraight(cardsUsed,i)) {
        cardsUsed[i] = 2;
        toFill--;
      }
    }

    //fill dummy cards for lowest possible hand
    var suit = ['s', 'd'];
    for (var i = 0; i <= 13; i++) {
      if (cardsUsed[i] == 2) {
        var card = this.CARDVALS[i] + suit[0];
        suit.splice(0, 1);
        cards.push(card);
      }
    }
    return cards;
  }
};

},{}],2:[function(require,module,exports){
(function (__dirname){

var path = require("path");
var ThreeCardConverter = require("./3CardConverter");

module.exports = {
  HANDTYPES: [
    "invalid hand",
    "high card",
    "one pair",
    "two pairs",
    "three of a kind",
    "straight",
    "flush",
    "full house",
    "four of a kind",
    "straight flush"
  ],

  CARDS: {
    "2c": 1,
    "2d": 2,
    "2h": 3,
    "2s": 4,
    "3c": 5,
    "3d": 6,
    "3h": 7,
    "3s": 8,
    "4c": 9,
    "4d": 10,
    "4h": 11,
    "4s": 12,
    "5c": 13,
    "5d": 14,
    "5h": 15,
    "5s": 16,
    "6c": 17,
    "6d": 18,
    "6h": 19,
    "6s": 20,
    "7c": 21,
    "7d": 22,
    "7h": 23,
    "7s": 24,
    "8c": 25,
    "8d": 26,
    "8h": 27,
    "8s": 28,
    "9c": 29,
    "9d": 30,
    "9h": 31,
    "9s": 32,
    "tc": 33,
    "td": 34,
    "th": 35,
    "ts": 36,
    "jc": 37,
    "jd": 38,
    "jh": 39,
    "js": 40,
    "qc": 41,
    "qd": 42,
    "qh": 43,
    "qs": 44,
    "kc": 45,
    "kd": 46,
    "kh": 47,
    "ks": 48,
    "ac": 49,
    "ad": 50,
    "ah": 51,
    "as": 52
  },

  evalHand: function(cards) {
    if (!this.ranks) {
      throw new Error("HandRanks.dat not loaded");
    }

    if (cards.length != 7 && cards.length != 6 && cards.length != 5 && cards.length != 3) {
      throw new Error("Hand must be 3, 5, 6, or 7cards");
    }

    //if 3 card hand, fill in to make 5 card
    if (cards.length == 3) {
      cards = ThreeCardConverter.fillHand(cards);
    }

    //if passing in string formatted hand, convert first
    if (typeof cards[0] == "string") {
      cards = cards.map(function(card) {
        return this.CARDS[card.toLowerCase()];
      }.bind(this));
    }

    return this.eval(cards);
  },

  eval: function(cards) {
    var p = 53;
    for (var i = 0; i < cards.length; i++) {
      p = this.evalCard(p + cards[i]);
    }

    if (cards.length == 5 || cards.length == 6) {
      p = this.evalCard(p)
    }

    return {
      handType: p >> 12,
      handRank: p & 0x00000fff,
      value: p,
      handName: this.HANDTYPES[p >> 12]
    }
  },

  evalCard: function(card) {
    return this.ranks.readUInt32LE(card * 4);
  }
}

var ranksFile = path.join(__dirname, '../data/HandRanks.dat');
module.exports.ranks = fs.readFileSync(ranksFile);


}).call(this,"/evaluator/lib")
},{"./3CardConverter":1,"path":3}],3:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[2]);
