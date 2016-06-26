(function(Language) {

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

    var cardsToTemplate = function(sets, div) {
    	var tplText = '';
    	for (var cards of sets) {
    		tplText += '<div class="set-cards">';
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

    $(function() {
        $('[data-evaluate]').each(function() {
            var self = $(this);
            var range = self.data('evaluate').toString();
            var sets = RangeEvaluator.fromRange(range);
            cardsToTemplate(sets, self);
        });
    });

    Language.set('help').load();

}(window.Language));