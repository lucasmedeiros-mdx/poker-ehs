(function(Language) {
    var socket = io.connect();

    var stats = {
    	ehs: {
    		tier1: 86,
    		tier2: 55
    	},
    	ppot: {
    		tier1: {
    			ehs: 40,
    			ppot: 40	
    		},
    		tier2: {
    			ehs: 30,
    			ppot: 18
    		}
    	}
    }

    var suits = {
            C: {
              name: 'club',
              symbol: '♣',
              color: 'black'
            },
            D: {
              name: 'diamond',
              symbol: '&diams;',
              color: 'red'
            },
            S: {
              name: 'spade',
              symbol: '&spades;',
              color: 'black'
            },
            H: {
              name: 'heart',
              symbol: '&hearts;',
              color: 'red'
            }
          };

    var fix = function(n) {
    	return (n * 100).toFixed(2);
    }

    var boardcards = function() {
    	var board = $('#board').val();    	
    	return board ? board.split(' ').map((i) => i.toUpperCase()) : [];
    }

    var ourHand = function() {
    	var hand = $('#hand').val();
    	return hand ? hand.split(' ').map((i) => i.toUpperCase()) : [];
    }

    var oppRange = function() {
    	var hand = $('#opphand').val();
    	var ourhand = ourHand() || [];
    	RangeEvaluator.blackcards = boardcards().concat(ourhand);
    	var cards = RangeEvaluator.fromRange(hand);    	
    	return cards;
    }

    $('form').on('submit', function(e) {
    	e.preventDefault();
    	$('#btn').button('loading')
    	var speed = $('#speed option:selected').val();

    	socket.emit('ehs', boardcards(), ourHand(), oppRange(), speed);
    });

    $('#board').on('focusout', function() {
    	var board = $('#board').val().split(' ');
    	cardsToTemplate(board ? [board] : [], $('#boardcards'));
    	$('#opphand').trigger('focusout');
    })

    $('#hand').on('focusout', function() {
    	var hand = ourHand();
    	cardsToTemplate(hand ? [hand] : [], $('#ourcards'));
    	$('#opphand').trigger('focusout');
    });    

    $('a', '#positional-range').on('click', function() {
		var p = $(this).data('position');
    	var range = RangeEvaluator.positions[p].join(',');
    	$('#opphand').val(range).trigger('focusout');
    });

    var cardsToTemplate = function(sets, div) {
    	var tplText = '';
    	for (var cards of sets) {
    		tplText += '<div class="set">';
	    	for (var card of cards) {
	    		if (!card) return;
	    		var value = card[0].toUpperCase();
	            var scriptName = '#card-' + value;
	            var templateText = $(scriptName).html();

	            var output = Mustache.render(templateText, {
	                card: value,
	                suit: suits[card[1].toUpperCase()]
	            });

	            tplText += $('<div></div>', {
	            	class: 'card',
	            	html: output
	            })[0].outerHTML;
	    	}
	    	tplText += '</div>';
	    }
    	div.html(tplText);
    }

    var calcPrWin = function(value, n) {
    	//Pr(win) = HSˆn × (1 − NPot) + (1 − HSˆn) × PPot
    	return Math.pow(value[1], n) * (1 - Math.pow(value[3], n)) + (1 - Math.pow(value[1], n)) * value[2];
    }

    var calcEHS = function(value, n) {   
    	//EHS = HSˆn + (1 − HSˆn) × PPot
    	return Math.pow(value[1], n) + (1 - Math.pow(value[1], n)) * value[2];
    }

    var history = function(n, value, ehs) {
    	var div = $('#history');
    	var m = (l) => l.map((c) => {
    		var s = suits[c[1]];
    		return c[0] + '<span class="' + s.color + '">' + s.symbol + '</span>';
    	});

    	var hand = m(ourHand());
    	var board = m(boardcards());

    	div.append($('<li></li>', {
    		class: 'list-group-item',
			html: hand.join(' ') + ' - ' + board.join(' ') + 
				'<span class="pull-right"><b>EHS:</b> ' + value + ' PPOT: ' + fix(ehs[2]) + ' Opp: ' + n + '</span>'
    	}).data({
    		value: value,
    		ehs: ehs,
    		n: n,
    		hand: $('#hand').val(),
    		board: $('#board').val(),
    		range: $('#opphand').val()
    	}));

        div.scrollTop(div[0].scrollHeight);
    }

    var setEHS = function(ehs) {
    	var div = $('#ehs'); 
    	var n = $('#oppleft').val();
    	var value = fix(calcEHS(ehs, n));
    	div.text(value).removeClass('tier1').removeClass('tier2');
    	
    	if (value >= stats.ehs.tier1) {
    		div.addClass('tier1');
    	} else if (value >= stats.ehs.tier2) {
    		div.addClass('tier2');
    	}
    	return value;
    }

    var setPrWin = function(ehs) {
    	var div = $('#prwin');
    	var n = $('#oppleft').val();
    	var value = fix(calcPrWin(ehs, n));
    	div.text(value);
    }

    var setPPOT = function(calculated, ehs) {
    	var div = $('#ppot');
    	var value = fix(ehs[2]);
    	div.text(value).removeClass('tier1').removeClass('tier2');

    	if (calculated > stats.ppot.tier1.ehs && value >= stats.ppot.tier1.ppot) {
    		div.addClass('tier1');
    	} else if (calculated > stats.ppot.tier2.ehs && value >= stats.ppot.tier2.ppot) {
    		div.addClass('tier2');
    	}
    }

    var updateInfo = function(ehs) {
    	var value = setEHS(ehs);
    	setPPOT(value, ehs);
    	setPrWin(ehs);
    	$('#hs').text(fix(ehs[1]));
    	$('#npot').text(fix(ehs[3]));    	
    }

    var copyHistory = function() {
        var header = ['Hand', 'Board', 'Opponent Range', 'EHS', 'PPOT', 'NPOT'];
        var separator = ';';
        var newLine = '\n';
        var data = $('#history li').map(function() {
            var data = $(this).data();            
            return [data.hand, data.board, data.range, data.n, data.value, 
                    fix(data.ehs[2]), fix(data.ehs[3])].join(separator);
        }).toArray();

        return header.join(separator) + newLine + data.join(newLine);
    }

    var download = function() {
        var csvString = copyHistory();
        var a         = document.createElement('a');
        a.href        = 'data:attachment/csv,' +  encodeURIComponent(csvString);
        a.target      = '_blank';
        a.download    = 'ehs_history_' + (new Date().getTime()) + '.csv';

        document.body.appendChild(a);
        a.click();
    }

    $(document).on('click', 'ul#history li', function() {
    	var data = $(this).data();
    	$('#hand').val(data.hand).trigger('focusout');
    	$('#board').val(data.board).trigger('focusout');
    	$('#opphand').val(data.range);
    	$('#oppleft').val(data.n);
    	updateInfo(data.ehs);
    });

    $('.download').on('click', function() {
        download();
    });

    socket.on('info', function(ehs) {
    	var n = $('#oppleft').val();
    	var value = fix(calcEHS(ehs, n));
    	updateInfo(ehs);
    	history(n, value, ehs);
	    $('#btn').button('reset');
    });

    $(function() {
    	$('[data-toggle="tooltip"]').tooltip();

        var clipboard = new Clipboard('.copy', {
            text: function(trigger) {
                return copyHistory();
            }
        });
    });

    Language.set('index').load();

}(window.Language));