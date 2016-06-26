(function(window, $) {
    window.Language = {
        currentLanguage: localStorage.getItem('language') || window.navigator.userLanguage || window.navigator.language,
        fileName: null,
        file: null,
        parse: function(json) {
            var l = json.locales;
            var self = this;
            var container = $('.container');

            container.hide();
            $('[data-localization]').each(function() {
                var selfInner = $(this);
                var localization = selfInner.data('localization');

                if (l.hasOwnProperty(localization)) {
                    var phrase = l[localization];                
                    if (phrase.hasOwnProperty(self.currentLanguage)) {                    
                        selfInner.html(phrase[self.currentLanguage]);
                    }
                }
            });
            container.show();
        },
        set: function(fileName) {
            this.fileName = fileName;
            return this;
        },
        load: function(language) {
            var self = this;
            if (language) {
                self.currentLanguage  = language;
                localStorage.setItem('language', language)
            }
            if (self.file === null) {
                $.getJSON('./data/' + self.fileName + '.json', function(json) {
                    self.file = json;
                    self.parse(json);
                });
            } else {
                self.parse(self.file);
            }
        }
    };

    $('.localization a').on('click', function() {
        var localization = $(this).find('.bfh-languages').data('language');
        Language.load(localization.replace('_', '-'));
    });

}(window, jQuery));