
//console functions
var dole = (function (g, e, b) {
    var c = e.console = e.console || {},
      f = g.console,
      a = "log info warn error debug dir".split(" "),
      d = function () { };

    c.disable = function () {
        for (var h = 0, j = a.length; h < j; h++) {
            c[a[h]] = d;
        }
    };
    c.enable = function () {
        var h = a.length;

        while (--h >= 0) {
            (function (j, k) {
                c[k] = function () {
                    var i = Array.prototype.slice.call(arguments),
                      l = i.join(", ");

                    if (!f) {
                        if ("status" in g) {
                            g.status = l;
                        }
                        return;
                    }
                    f.firebug ? f[k].apply(window, i) : f[k] ? f[k](l) : f.log(l);
                };
            })(h, a[h])
        }
    };

    b ? c.enable() : c.disable();
    c.enable();
    return e;
}(window, dole || {}, /(local|test)/.test(window.location.hostname)));

//window functions
(function (dole, $) {
    var win = dole.win = {};

    win.onDelayedResize = function (f, e) {
        //f is the function to call when the delayed resize occurs
        //e is boolean to execute the function immediately
        if (e) {
            f();
        }
        var d = (function () {
            //dole.console.log( 'win.onDelayedResize d: ' + f );
            //g is the variable that holds a reference to the timer
            var g = 0;
            return function (i, h) {
                clearTimeout(g);
                g = setTimeout(i, h || 250);
            }
        }());
        $(window).resize(function () {
            d(f);
        });
    };
    win.viewportHeight = function () {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    };
    win.viewportWidth = function () {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    };
    win.contentHeight = function () {
        return $(document).height();
    };
    win.matchViewport = function (d) {
        if (Modernizr.mq("only all")) {
            if (Modernizr.mq(d)) {
                return true;
            } else {
                return false;
            }
        } else {
            if ((d.indexOf("min-width") > 0 && win.viewportWidth() >= d.replace("(min-width:", "").replace("px)", "")) || (d.indexOf("min-height") > 0 && win.viewportHeight() >= d.replace("(min-height:", "").replace("px)", ""))) {
                return true;
            } else {
                return false;
            }
        }
    };

    win.onFontResize = function (f, e) {
        //dole.console.log(f);
        if (e) {
            f();
        }
        $(document).bind("fontresize", function () {
            f();
        });
    }

    win.onPageLoad = function (f, e) {
        if (e) {
            f();
        }
    };

}(window.dole = window.dole || {}, jQuery));

//feature globals
(function (dole, $) {
    var features = dole.features = {};

    features.transitions = Modernizr.csstransitions;
    features.css3d = Modernizr.csstransforms3d;
    features.touch = Modernizr.touch;
    features.ie9 = !(Modernizr.flexbox || Modernizr.flexboxlegacy);
    features.tablet = Modernizr.tablet;

    var i = document.createElement("input");
    i.setAttribute("type", "date");

    features.datetype = i.type !== "text" ? true : false;

}(window.dole = window.dole || {}, jQuery));

//query string
(function (dole, $) {
    var query = dole.query = {};

    query.urlParams = {};

    query.init = function () {
        var decode = function (str) {

            var pairs = str.split('&');
            var result = {};

            pairs.forEach(function (pair) {
                pair = pair.split('=');
                var name = pair[0]
                var value = pair[1]
                if (name.length) {
                    if (result[name] !== undefined) {
                        if (!result[name].push) {
                            result[name] = [result[name]];
                        }
                        result[name].push(value || '');
                    } else {
                        result[name] = value || '';
                    }
                }
            });
            return (result);
        },
        params = window.location.search.substring(1);
        query.urlParams = decode(params);
    }

    query.size = function () {
        var size = 0, key;
        for (key in query.urlParams) {
            if (query.urlParams.hasOwnProperty(key)) { size++ };
        }
        return size;
    }

    $(function () {
        query.init();
    })

}(window.dole = window.dole || {}, jQuery));

//lang
(function (dole, $) {
    var language = dole.language = {},
        debug = true;

    language.str = 'en';

    language.setLanguage = function () {
        var lang = language.str;
        if (lang = (/^\/([a-z]{2,})\//).exec(window.location.pathname)) {
            language.str = lang[1];
        }
    }
    language.getLanguage = function () {
        var lang = language.str;
        if (lang = (/^\/([a-z]{2,})\//).exec(window.location.pathname)) {
            language.str = lang[1];
        }
        return language.str;
    }

    language.init = function () {
        language.setLanguage(); //sets language according to language code in url
    }

    $(function () {
        language.init();
        //postpone this until after i18n loads
    })

}(window.dole = window.dole || {}, jQuery));

//where to buy
(function (dole, $) {
    var wtb = dole.wtb = {},
        debug = false,

        wtbDataURL = '/service/AddCorsHeaders.ashx?url=http://www2.itemlocator.net/ils/locatorJSON/?',

        wtbPackage = $('#tab-packaged'),
        wtbPackageResults = wtbPackage.find('#dole-package-results'),
        wtbPackageResultsContainer = wtbPackageResults.find('.dole-wtb-results-list'),
        wtbPackageData,

        wtbFresh = $('#tab-fresh'),
        wtbFreshResults = wtbFresh.find('#dole-results'),
        wtbFreshResultsContainer = wtbFreshResults.find('.dole-wtb-results-list'),
        wtbFreshData;

    wtb.cats = {};
    wtb.subcats = {};
    wtb.loaded = false;

    wtb.init = function () {
        if (wtbPackage && wtbPackage.length > 0) {
            wtb.package.init();
        };
        if (wtbFresh && wtbFresh.length > 0) {
            wtb.fresh.init();
        };
    }

    wtb.package = {}
    wtb.package.init = function () {
        var filter = wtbPackage.find('.dole-filter');
        var dataSrc = filter.data('filterData');

        if (filter.length > 0) {
            wtb.loadPackageData(filter, dataSrc);
        } else {
            wtb.postalCodeSearch();
        }
    }
    wtb.package.getRetailers = function () {
        var ajaxData = $('#dole-wtb').serialize(),
            ajaxUrl = $('#dole-wtb').data('retailerUrl'),
            ajaxMethod = $('#dole-wtb').attr('method');

        $.getJSON(wtbDataURL + ajaxData, function (data) {
            wtb.package.showRetailers(data);
        });
    }
    /*
    wtb.package.getRetailers = function() {
      var ajaxData = $('#dole-wtb').serialize(),
          ajaxUrl = $('#dole-wtb').data('retailerUrl'),
          ajaxMethod = $('#dole-wtb').attr('method'),

          ajaxProxy = '/en/where-to-buy/proxy.php';

      //dole.console.log(data);

      if (debug) {
        //ajaxUrl = './js/result-sample.json';
        ajaxUrl = '/' + dole.language.getLanguage() + '/js/result-sample.json';
        ajaxMethod = 'GET';
      }

      $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        if (options.url.match(/^http?:/)) {
          options.headers = {};
          options.headers['X-Proxy-URL'] = options.url;
          options.url = ajaxProxy;
        }
        //console.log(options);

      });

      $.support.cors = true;
      $.ajax({
        //crossDomain: true,
        //crossOrigin: true,
        url: ajaxUrl,
        //async: false,
        method: ajaxMethod,
        data: ajaxData,
        dataType: 'json'
      }).done(function( response, textStatus, xhr ) {

        //console.log('done');

        //dole.console.log(xhr.responseText);
        wtb.package.showRetailers(response);

      }).fail(function( xhr, textStatus, thrownError ) {
        wtbPackageResultsContainer.html('');

        //console.log('error');

        if (debug) {
          //dole.console.log(xhr.responseText);
          //dole.console.log(textStatus);
          //dole.console.log(thrownError);
        }

        wtbPackageResults.show();
        wtbPackageResultsContainer.html('<p>There was a problem fetching the data. Please try again</p>');
      });
    }
    */
    wtb.package.showRetailers = function (results) {

        wtbPackageResultsContainer.html('');

        //dole.console.log(results.nearbyStores);
        wtbPackageResults.show();
        if (debug) {
            wtbPackageResultsContainer.html('<p><i>Sample Data</i></p>');
        }

        if (results.nearbyStores.length > 0) {
            //dole.console.log('display results');
            //dole.console.log( results.nearbyStores );

            $(results.nearbyStores).each(function (index, store) {

                /*var retailer = store.name;
                var address = store.address;
                var city = store.city;
                var state = store.state;
                var zip = store.zip;
                var phone = store.phone;*/

                var storeItem = '<div class="dole-wtb-retailer-address">';
                storeItem += '<div class="fn">' + store.name + '</div>';
                storeItem += '<div class="street-address">' + store.address + '</div>';
                if (store.address2) {
                    storeItem += '<div class="street-address">' + store.address2 + '</div>';
                }
                storeItem += '<div class="locality region postal-code">' + store.city + ', ' + store.state + ' ' + store.zip + '</div>';
                storeItem += '<div class="phone">' + store.phone + '</div>';
                storeItem += '<div class="directions"><a href="https://www.google.com/maps/place/' + store.address + '+' + store.city + '+' + store.state + '" target="_blank">Map</a></div>';

                $(storeItem).appendTo(wtbPackageResultsContainer);

            });

        } else {
            wtbPackageResultsContainer.html('<p>No results</p>');
        }
        //$(results).each(function(index, result){
    }

    wtb.fresh = {};
    wtb.fresh.init = function () {
        var filter = wtbFresh.find('.dole-filter');
        var dataSrc = filter.data('filterData');

        if (filter.length > 0) {
            wtb.loadFreshData(filter, dataSrc);
        }
    }
    wtb.fresh.showRetailers = function (data) {
        $('#dole-results').show();
        wtbFreshResultsContainer.html('');

        //dole.console.log(data);

        $(data).each(function (index, retailer) {
            wtbFreshResultsContainer.append('<img src="' + retailer.image + '" title="' + retailer.title + '">');
        })
    }

    wtb.loadFreshData = function (el, src) {
        //var ajaxUrl = './js/'+src+'.json'; //local
        //var ajaxUrl = '/' + dole.language.getLanguage() + '/js/' + src + '.json'; //staging
        var ajaxUrl = '/sites/dole_com/js/' + src + '.json';

        $.support.cors = true;
        $.ajax({
            crossDomain: true,
            url: ajaxUrl,
            async: false,
            dataType: "json"
        }).done(function (response, textStatus, xhr) {

            wtb.loaded = true
            wtb.buildFreshList(el, response);
            //dole.console.log(xhr.responseText);

        }).fail(function (xhr, textStatus, thrownError) {
            if (debug) {
                //dole.console.log(xhr.responseText);
                dole.console.log(textStatus);
                dole.console.log(thrownError);
            }
        });
    }

    wtb.buildFreshList = function (el, results) {
        var filterTarget = el.find('select'),
            filterSubmit = el.parents('div[id^="tab-"]').find('button'),
            related = filterTarget.parent().data('filterRelated'),
            optionTarget = $('.dole-dropdown[data-filter-options=' + related + ']').find('select');

        //dole.console.log(related);

        $(results).each(function (index, result) {
            var filterSelectList = '';

            $(result.categories).each(function (index, category) {
                filterSelectList += '<option value="' + category.id + '">' + category.title + '</option>';
            })

            $(filterSelectList).appendTo(filterTarget);

        });

        $(filterTarget).on('change', function () {
            if (related) {
                var filter = this.value;
                //remove all of the 'option' elements
                optionTarget.find('option[value!="-1"]').remove();

                $(results).each(function (index, result) {
                    $(result.categories).each(function (index, category) {

                        wtbFreshResults.hide();

                        if (category.id == filter) {
                            if (category.products) {

                                //If the category has products
                                //reset and build the select list
                                optionSelectList = '';
                                $(category.products).each(function (index, product) {
                                    optionSelectList += '<option value="' + product.id + '">' + product.title + '</option>';
                                })
                                //  append the options to the select and remove the disabled attribute
                                //  enable the submit button as well
                                $(optionSelectList).appendTo(optionTarget);
                                optionTarget.removeAttr('disabled');
                                filterSubmit.attr('disabled', 'disabled');

                                optionTarget.on("change", function () {
                                    wtbFreshResults.hide();

                                    if (this.value != -1) {
                                        var value = this.value;
                                        filterSubmit.removeAttr('disabled');

                                        $(category.products).each(function (index, product) {
                                            if (product.id == value) {
                                                wtbFreshData = product.retailers;
                                            }
                                        })

                                    } else {
                                        filterSubmit.attr('disabled', 'disabled');
                                    }
                                })

                            } else {
                                //If there are no products (sub-categories)
                                //  disable the related select and enable the submit button
                                optionTarget.attr('disabled', 'disabled');
                                filterSubmit.removeAttr('disabled');
                                optionTarget.find('option[value!="-1"]').remove();
                                optionTarget.val("-1");

                                wtbFreshData = category.retailers;

                            }

                        } else if (filter == -1) {
                            //If default is selected
                            //  remove all select options and set selected to -1
                            //  disable the related select and submit button
                            //  clear the data
                            optionTarget.attr('disabled', 'disabled');
                            filterSubmit.attr('disabled', 'disabled');
                            optionTarget.find('option[value!="-1"]').remove();
                            optionTarget.val("-1");

                            wtbFreshData = {};

                        }

                    })
                })



            } else {
                dole.console.log('change no related');
            }

            filterSubmit.on('click', function (e) {
                e.preventDefault();
                wtb.fresh.showRetailers(wtbFreshData);
            })

        });
    }

    wtb.loadPackageData = function (el, src) {
        //var ajaxUrl = './js/'+src+'.json'; //local
        //var ajaxUrl = '/' + dole.language.getLanguage() + '/js/' + src + '.json'; //stage
        var ajaxUrl = '/sites/dole_com/js/' + src + '.json';

        $.support.cors = true;
        $.ajax({
            crossDomain: true,
            url: ajaxUrl,
            async: false,
            dataType: "json"
        }).done(function (response, textStatus, xhr) {

            wtb.loaded = true
            wtb.buildPackageList(el, response);
            //dole.console.log(xhr.responseText);

        }).fail(function (xhr, textStatus, thrownError) {
            if (debug) {
                //dole.console.log(xhr.responseText);
                dole.console.log(textStatus);
                dole.console.log(thrownError);
            }
        });
    }

    wtb.buildPackageList = function (el, results) {
        var filterTarget = el.find('select'),
            filterSubmit = el.parents('div[id^="tab-"]').find('button'),
            related = filterTarget.parent().data('filterRelated'),
            optionTarget = $('.dole-dropdown[data-filter-options=' + related + ']').find('select');


        $(results).each(function (index, result) {
            var filterSelectList = '';

            $(result.categories).each(function (index, category) {
                filterSelectList += '<option value="' + category.id + '">' + category.title + '</option>';
            })

            $(filterSelectList).appendTo(filterTarget);

        });

        $(filterTarget).on('change', function () {
            if (related) {
                var filter = this.value;
                //remove all of the 'option' elements
                optionTarget.find('option[value!="-1"]').remove();

                $(results).each(function (index, result) {
                    $(result.categories).each(function (index, category) {

                        wtbPackageResults.hide();

                        if (category.id == filter) {
                            if (category.products) {

                                //If the category has products
                                //  reset and build the select list
                                optionSelectList = '';
                                $(category.products).each(function (index, product) {
                                    optionSelectList += '<option value="' + product.id + '">' + product.title + '</option>';
                                })
                                //  append the options to the select and remove the disabled attribute
                                //  enable the submit button as well
                                $(optionSelectList).appendTo(optionTarget);
                                optionTarget.removeAttr('disabled');
                                filterSubmit.attr('disabled', 'disabled');

                                optionTarget.on("change", function () {

                                    wtbPackageResults.hide();

                                    if (this.value != -1) {
                                        filterSubmit.removeAttr('disabled');

                                        var value = this.value;
                                        $(category.products).each(function (index, product) {
                                            if (product.id == value) {
                                                wtbPackageData = product.id;
                                            }
                                        })
                                    } else {
                                        filterSubmit.attr('disabled', 'disabled');
                                    }
                                })

                                //wtbFreshData = filterData;

                            } else {
                                //If there are no products
                                //  clear and disable the select list
                                //  and enable submit button
                                //  set data set to category.retailers
                                optionTarget.attr('disabled', 'disabled');
                                filterSubmit.removeAttr('disabled');
                                optionTarget.find('option[value!="-1"]').remove();
                                optionTarget.val("-1");

                                //wtbFreshData = category.retailers;
                            }

                        } else if (filter == -1) {
                            //If selecting the default
                            //  clear and disable the select list
                            //  and enable submit button
                            //  clear data set
                            optionTarget.attr('disabled', 'disabled');
                            filterSubmit.attr('disabled', 'disabled');
                            optionTarget.find('option[value!="-1"]').remove();
                            optionTarget.val("-1");

                            //wtbPackageData = {};
                        }

                    })
                })
            } else {
                dole.console.log('change no related');
            }
        });

        filterSubmit.on('click', function (e) {
            e.preventDefault();
            wtb.package.getRetailers();
            //dole.console.log(filterData);
        })
    }

    wtb.postalCodeSearch = function () {
        filterSubmit = $('#submit_btn');
        filterSubmit.on('click', function (e) {
            e.preventDefault();
            wtb.package.getRetailers();
            //dole.console.log(filterData);
        })
    }

    $(function () {
        wtb.init();
        //postpone this until after i18n loads
    })

}(window.dole = window.dole || {}, jQuery));

//newsletter
(function (dole, $) {
    var news = dole.news = {},
        debug = true,
        isValid = true,

        newsShow = $('#dole-subscribe-start'),
        newsFormContainer = $('#dole-subscribe-form'),

        newsForm = $('#dole-subscribe'),
        newsSubmit = newsForm.find('button'),

        newsEmailField = $('#dole-subscribe-email'),
        newsFirstField = $('#dole-subscribe-first'),
        newsLastField = $('#dole-subscribe-last'),

        newsIntro = newsForm.parents('.dole-subscribe').find('.dole-subscribe-intro'),
        newsMessage = newsForm.parents('.dole-subscribe').find('.dole-subscribe-msg');


    news.init = function () {
        //newsFormContainer.hide();

        newsSubmit.on('click', function (e) {
            e.preventDefault();

            if (news.validate()) {
                news.signup();
            }
        })
    }

    news.validate = function () {

        isValid = true;

        if (newsFirstField.val() && newsFirstField.val() != '') {
            newsFirstField.removeClass('dole-form-invalid');
        } else {
            isValid = false;
            newsFirstField.addClass('dole-form-invalid');
        }

        if (newsLastField.val() && newsLastField.val() != '') {
            newsLastField.removeClass('dole-form-invalid');
        } else {
            isValid = false;
            newsLastField.addClass('dole-form-invalid');
        }

        if (newsEmailField.val() && news.isEmail(newsEmailField.val())) {
            newsEmailField.removeClass('dole-form-invalid');
        } else {
            isValid = false;
            newsEmailField.addClass('dole-form-invalid');
        }

        return isValid;
    }

    news.isEmail = function (email) {
        if (/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
            return true;
        } else {
            return false;
        }
    }

    news.signup = function () {
        var ajaxData = newsForm.serialize(),
            ajaxMethod = newsForm.attr('method'),
            ajaxUrl = 'http://newsletter.dole.com/API/SocialProject/api/users';

        newsSubmit.attr('disabled', 'disabled');

        var data = '{"key":"38tX5c39Q8v26kgXK7bBWfdn0b2mO953","form_id":"1","first_name":"' + newsFirstField.val() + '","last_name":"' + newsLastField.val() + '","email":"' + newsEmailField.val() + '"}';
        //
        //dole.console.log(data);

        $.support.cors = true;
        $.ajax({
            crossDomain: true,
            url: ajaxUrl,
            async: false,
            method: ajaxMethod,
            data: data,
            dataType: 'json'
        }).done(function (response, textStatus, xhr) {

            /*console.log('done');

            console.log(response);
            console.log(textStatus);
            console.log(xhr);*/

            //var obj = jQuery.parseJSON(xhr.responseText);
            //console.log(obj);

            //if (response === '{"Success"}') {
            if (response.Success === 'true') {
                newsForm.hide();

                newsIntro.hide();
                newsMessage.show();
                newsMessage.html('<p>Thank you for subscribing!</p>');

            } else {
                news.showError('There was a problem submitting the data. Please try again.');
            }

        }).fail(function (xhr, textStatus, thrownError) {

            /*console.log('fail');

            console.log(xhr);
            console.log(textStatus);
            console.log(thrownError);*/

            news.showError('There was a problem contacting the server. Please try again.');
        });
    }

    news.showError = function (msg) {
        newsIntro.hide();
        newsMessage.show();
        newsMessage.html('<p>' + msg + '</p>');

        newsSubmit.removeAttr('disabled');
    }

    $(function () {
        news.init();
    })

}(window.dole = window.dole || {}, jQuery));

//utils
(function (dole, $) {
    var utils = dole.utils = {};
    var printBtn;

    utils.init = function () {
        printBtn = $('.dole-content-sharing').find('.dole-link-print a');
        if (printBtn) {
            printBtn.on('click', function (e) {
                e.preventDefault();
                utils.printPage(e);
            })
        }

        emailBtn = $('.dole-content-sharing').find('.dole-link-email a');
        if (emailBtn) {
            emailBtn.on('click', function (e) {
                e.preventDefault();
                utils.emailPage(e);
            })
        }
    }

    utils.printPage = function () {
        window.print();
    }
    utils.emailPage = function () {
        var pageTitle = $(document).find("title").text();
        var link = "mailto:"
                 + "?subject=" + escape(pageTitle)
                 + "&body=" + escape(window.location.href)
        ;

        window.location.href = link;
    }


    /* Determine if browser cookies are enabled */
    utils.hasCookiesEnabled = function () {
        var cookieName = "utilsCookieTest_" + (new Date().getTime().toString());
        utils.setCookie(cookieName, "true");
        if (utils.getCookie(cookieName) == "true") {
            utils.deleteCookie(cookieName);
            return true;
        } else {
            return false;
        }
    }

    /* Get cookie value */
    utils.getCookie = function (name) {
        if (document.cookie) {
            if (document.cookie.indexOf(name) != -1) {
                var cookiePairs = document.cookie.split(';');
                for (var i = 0; i < cookiePairs.length; i++) {
                    var cookieNameValue = cookiePairs[i].split('=');
                    cookieNameValue[0] = cookieNameValue[0].replace(/^\s+|\s+$/g, '');
                    if (cookieNameValue[0] == name) {
                        if (cookieNameValue.length > 1) {
                            return decodeURIComponent(cookieNameValue[1].replace(/^\s+|\s+$/g, ''));
                        }
                    }
                }
            }
        }
        return null;
    }

    /* Set domain-level cookie value and expiration */
    utils.setCookie = function (name, value, expires) {
        var dateNotSet = false;

        if (expires == null) {
            dateNotSet = true;
            //expires = new Date();
            //expires.setFullYear(expires.getFullYear() + 1);
        }
        document.cookie = name + '=' + encodeURIComponent(value) + (dateNotSet ? '' : '; expires=' + expires.toGMTString()) + '; path=/';
    }

    /* Delete cookie */
    utils.deleteCookie = function (name) {
        utils.setCookie(name, '', new Date(0));
    }

    utils.clearCookies = function () {
        utils.deleteCookie('plus-activated');
        utils.deleteCookie('plus-coached');
        utils.deleteCookie('plus-veg');
        utils.deleteCookie('plus-kids');
        utils.deleteCookie('plus-juice');
        utils.deleteCookie('plus-active');
        utils.deleteCookie('plus-calories');
        utils.deleteCookie('plus-entertain');
        utils.deleteCookie('plus-fast');
        utils.deleteCookie('plus-parent');
        utils.deleteCookie('plus-protein');
        utils.deleteCookie('plus-snack');
        utils.deleteCookie('plus-spicy');
        utils.deleteCookie('plus-sweet');
    }

    $(function () {
        utils.init();
    })

}(window.dole = window.dole || {}, jQuery));

//external links
(function (dole, $) {
    var external = dole.external = {};

    external.init = function () {
        $("a[href^=http]").each(function () {
            var gridItem = $(this).parents("div[class*=dole-grid-item]").length > 0;
            //var $icon = $("<i class='dole-icon dole-icon-external'></i>");

            if (this.href.indexOf(location.hostname) == -1) {
                $(this).attr({
                    target: "_blank",
                    title: "Opens in a new window"
                })

                if (gridItem) {
                    //$(this).append($icon).addClass('dole-link-external');
                    $(this).parent().addClass('dole-link-external');
                }

                $(this).on('click', function () {
                    ga('send', 'event', 'ExternalLink', 'Clickthrough', $(this).attr('href'));
                })

            }

        })
    }

    $(function () {
        external.init();
    })

}(window.dole = window.dole || {}, jQuery));

//content toggles
(function (dole, $) {
    var toggle = dole.toggle = {},
        mainContent = $('#dole-content'),
        toggles = mainContent.find('.dole-content-toggle'),
        toggleTriggers = toggles.find('.dole-content-toggle-trigger');


    toggle.init = function () {
        toggleTriggers.on('click', function () {
            var j = $(this),
                t = j.data('toggleTarget');


            j.parent().toggleClass('open');
            if (j.parent().hasClass('dole-comments-toggle')) {
                window.dispatchEvent(new Event('resize'));
            }
            return false;
        })
    }

    $(function () {
        toggle.init();
    })

}(window.dole = window.dole || {}, jQuery));

//packery
(function (dole, $) {
    var packr = dole.packr = {},
        container = $('#packery'),
        containers = $("div[id^=packery]");

    packr.loaded = false;

    packr.init = function () {
        if (!packr.loaded) {
            containers.each(function () {
                $(this).packery({
                    isInitLayout: false,
                    columnWidth: '.dole-grid-sizer',
                    rowHeight: 180,
                    itemSelector: '.dole-grid-item',
                    percentPosition: true
                });
            });

            packr.loaded = true;
            packr.resize();

        } else {
            packr.resize();
        }
    }

    packr.resize = function () {
        containers.each(function () {
            $(this).packery();
        });
    }

    packr.destroy = function () {
        containers.each(function () {
            $(this).packery('destroy');
        });
    }

    packr.append = function (newItems) {
        //var $items = newItems.find('.dole-grid-item');
        var $items = $.parseHTML(newItems);
        container.append($items).packery('appended', $items);
    }

    $(function () {
        dole.win.onDelayedResize(packr.init, true)
    })

}(window.dole = window.dole || {}, jQuery));

//you+
(function (dole, $) {
    var plus = dole.plus = {},
        //plusContainer = $('#packery'),
        plusItems = $('.dole-plus'),
        plusCoach = $('#dole-plus-coach'),
        plusExpires = new Date();


    plus.init = function () {

        plusExpires.setFullYear(plusExpires.getFullYear() + 1);

        plusCoach.find('.dole-plus-close a').on('click', function (e) {
            if (plusCoach.hasClass('show')) {
                plusCoach.removeClass('show');
            }
            e.preventDefault();
        })

        $('#dole-cookie-clear').on('click', function (e) {
            dole.utils.clearCookies();
            e.preventDefault();
        });

        plusItems.each(function () {

            plus.showSelected($(this));

            $(this).on('click', function (e) {
                var j = $(this),
                    k = j.hasClass('dole-plus-selected'),
                    t = j.data('plusType');

                //dole.console.log(t);

                if (k) {
                    plus.deselect(j, t);
                } else {
                    plus.select(j, t);
                }

                if (!plus.checkActivation()) {
                    //var expires = new Date();
                    //expires.setFullYear(expires.getFullYear() + 1);
                    dole.utils.setCookie('plus-activated', 'true', plusExpires);
                }
                plus.showCoach();


                e.preventDefault();
            })
        })

        //plus.showSelected();

        //check cookie - if no interaction, show warnings
        if (!plus.checkActivation()) {
            $('#dole-plus-hero').show();
        }

    }

    plus.showSelected = function (j) {
        var t = j.data('plusType');
        if (dole.utils.getCookie('plus-' + t) === 'true') {
            //dole.console.log(dole.utils.getCookie('plus-' + t));
            //plusActivated = true;
            plus.select(j, t);
        }
    }

    plus.checkActivation = function () {
        if (dole.utils.getCookie('plus-activated') === 'true') {
            return true;
        }
        return false;
    }

    plus.select = function (j, t) {
        //var expires = new Date();
        //expires.setFullYear(expires.getFullYear() + 1);

        j.addClass('dole-plus-selected');
        dole.utils.setCookie('plus-' + t, 'true', plusExpires);
    }

    plus.deselect = function (j, t) {
        j.removeClass('dole-plus-selected');
        dole.utils.deleteCookie('plus-' + t);
    }

    plus.showCoach = function (j) {
        if (dole.utils.getCookie('plus-coached') != 'true') {
            plusCoach.addClass('show');

            //var expires = new Date();
            //expires.setFullYear(expires.getFullYear() + 1);
            dole.utils.setCookie('plus-coached', 'true', plusExpires);
        }
    }


    $(function () {
        plus.init();
    })

}(window.dole = window.dole || {}, jQuery));

//equal height columns
(function (dole, $) {
    var equal = dole.equal = {},
        row = $('.eq-height-row');

    equal.init = function () {
        if (dole.win.matchViewport("(min-width:890px)")) {
            row.each(function () {
                var $maxHeight = 0,
                    $colHeight;

                $columns = $('.eq-height-col', $(this));
                $columns.each(function () {

                    $(this).attr('style', 'height:auto;');

                    $colHeight = $(this).outerHeight();

                    if ($colHeight > $maxHeight) {
                        $maxHeight = $colHeight;
                    }

                    //dole.console.log( $(this).attr('class') + ': ' + $maxHeight);

                });
                $columns.outerHeight($maxHeight);
            });
        } else {
            row.each(function () {
                $columns = $('.eq-height-col', $(this));
                $columns.each(function () {
                    $(this).attr('style', 'height:auto;');
                });
            });
        }
    }

    $(function () {
        /*$(window).on("load", function() {
           dole.win.onDelayedResize(equal.init, true);
        })*/
        //dole.win.onDelayedResize(equal.init, false);
        //setTimeout(equal.init, 100); // this is because of the delayed google font rendering
        dole.win.onDelayedResize(equal.init, true);
    })

}(window.dole = window.dole || {}, jQuery));

//main search
(function (dole, $) {
    var search = dole.search = {},
        searchTrigger = $('#dole-search-fs'),
        searchOverlay = $('#dole-search-overlay'),
        searchClose = searchOverlay.find('.dole-search-close');

    search.isOpen = false;

    search.init = function () {
        //initialize handlers
        searchTrigger.on('click', function (e) {
            e.preventDefault();

            search.open();
        })

        searchClose.on('click', function (e) {
            e.preventDefault();

            if (search.isOpen) {
                search.close();
            }
        })

        $(document).on('keydown', function (e) {
            if (e.keyCode === 27) { // ESC
                if (search.isOpen) {
                    search.close();
                }
            }
        });

    }

    search.open = function () {
        $('body').addClass('search-open');
        searchOverlay.addClass('open');
        search.isOpen = true;
        $('input#site-search').focus();
    }

    search.close = function () {
        $('body').removeClass('search-open');
        searchOverlay.removeClass('open');
        search.isOpen = false;
    }

    $(function () {
        search.init();
    })

}(window.dole = window.dole || {}, jQuery));

//tabs
(function (dole, $) {
    var tabs = dole.tabs = {},
        tabcontainer = $('#dole-tabs'),
        tabitems = $('a', tabcontainer);

    tabs.init = function () {
        if (tabcontainer.length > 0) {
            tabitems.on('click', function (e) {
                e.preventDefault();

                tabcontainer.find('li').removeClass('active');
                $(this).parent('li').addClass('active');

                tabcontainer.find("div[id^='tab']").hide();
                tabcontainer.find('div#' + this.className).show();
            });
        }
    }

    $(function () {
        tabs.init();
    })

}(window.dole = window.dole || {}, jQuery));

/* End dole-framework */

//Mobile menu
(function (dole, $) {

    var menu = dole.menu = {},
      siteOverlay = $('.dole-site-overlay'),

      mainNav = $("#dole-nav"),
      mainContent = $("#dole-content"),
      navContainer = mainNav.find(".dole-main-nav"),
      menuContainer = mainNav.find(".dole-menu"),

      navMenu = navContainer.find(".dole-nav-menu"),

      subNavMenu = mainNav.find(".dole-secondary-nav"),
      subNavContainer = subNavMenu.find('.dole-secondary-nav-header'),
      subNavSections = subNavContainer.find(".dole-secondary-nav-items"),
      subNavFooter = subNavMenu.find('.dole-secondary-nav-footer'),

      navCollapse = subNavMenu.find(".dole-navbar-close"),

      navControl = mainNav.find(".dole-navbar-toggle"),


      //navItems = menu.find("li"),
      navItems = navMenu.children("li"),
      navLinks = $('a:not(.dole-secondary-nav-items a)', navItems),

      subNavMenuItems = $('.dole-secondary-nav a'),
      subNavItems = $("#menus"),

      /*siteUtils = mainContent.find('.dole-site-utils'),
      languageToggle = siteUtils.find('.dole-lang'),

      userUtils = menuContainer.find('.dole-utils-user'),
      userLogin = userUtils.find('.dole-nav-menu-user'),

      mobileUtils = menuContainer.find('#dole-mobile-utils'),
      mobileUtilsLang = mobileUtils.find('.dole-mobile-utils-lang'),
      mobileUtilsUser = mobileUtils.find('.dole-mobile-utils-user'),*/

      mobileTrigger = mainNav.find(".dole-menu-toggle"),

      navContainerMaxHeight = '',
      subNavTarget = '',
      menuSpeed = '0.5s',
      classTimer, hoverDelay, exitDelay;


    menu.currentType = "";
    menu.open = false;
    menu.enhancedMenu = Modernizr.csstransitions;
    //menu.enhancedMenu = false;

    menu.init = function () {
        //console.log('init on delayed resize');
        if (dole.win.matchViewport("(min-width:740px)")) {
            if (menu.currentType !== "full") {
                menu.full();
            }
        } else {
            //navContainer.css('max-height', dole.win.viewportHeight() );
            if (menu.currentType !== "small") {
                menu.small();
            }
        }
    };

    menu.full = function () {
        menu.small.deactivate();
        menu.full.activate();
        menu.open = false;
    };

    menu.full.activate = function () {
        menu.currentType = "full";
        mainNav.addClass("dole-menu-full");

        menu.setHeight();
        menu.columnOffset();

        if (Modernizr.touch) {
            // Only add the touch event handlers for touch devices
            menu.full.setInterfaceTouch();
            //menu.full.setInterfaceMouse();
        } else {
            // Add mouse handlers for other devices
            menu.full.setInterfaceMouse();
        }
    };
    menu.full.deactivate = function () {
        if (menu.currentType === "full") {
            mainNav.removeClass("dole-menu-full");
            subNavSections.removeClass('open');
        }

        if (Modernizr.touch) {
            // Remove the touch event handlers for touch devices
            menu.full.removeInterfaceTouch();
        } else {
            // Remove mouse handlers for other devices
            menu.full.removeInterfaceMouse();
        }

        menu.full.close();
    };

    menu.full.setInterfaceMouse = function () {

        navItems.on("click", function () {
            var j = $(this),
              k = j.hasClass("sfhover"),
              t = j.find('a').data('navTarget');

            if (!menu.open) {
                menu.full.open();
            }

            navItems.removeClass('active');
            j.addClass('active');
            //open div from data-nav-target
            subNavSections.removeClass('open');
            subNavSections.each(function () {
                if ($(this).hasClass(t)) {
                    $(this).addClass('open');
                }
            });
            return false;
        });


        navCollapse.on("click", function () {
            if (menu.open) {
                menu.full.close();
            }
            return false;
        });

        /*
        $(document).on('keydown', function (e) {
          if (e.keyCode == 77 && e.ctrlKey) {
            //console.log('ctrl m');
            if( !menu.open ) {
              menu.full.open();
            } else {
              menu.full.close();
            }
          }
        });
        */

        $(document).on('keydown', function (e) {
            if (e.keyCode === 27) { // ESC
                //console.log('esc');
                if (menu.open) {
                    menu.full.close();
                }

            }
        });

        siteOverlay.on('touchmove', function (e) {
            e.preventDefault();
        });
        siteOverlay.on('click', function (e) {
            menu.full.close();
        });

    };
    menu.full.setInterfaceTouch = function () {
        $("body").on("touchstart", function (e) {
            var $target = $(e.target);
            if (!$target.parents().hasClass("dole-nav-menu")) {
                menu.handleDOMEvent();
            }
        });

        navItems.find('a').on("touchstart", function (e) {
            var $target = $(event.target);

            var j = $(this),
              t = j.data('navTarget');

            if (!menu.open) {
                menu.full.open();
            }

            navItems.removeClass('active');
            j.parent().addClass('active');
            //open div from data-nav-target
            subNavSections.removeClass('open');
            subNavSections.each(function () {
                if ($(this).hasClass(t)) {
                    $(this).addClass('open');
                }
            });
            if (t) {
                e.preventDefault();
            }
        });

        navCollapse.on("touchstart", function (e) {
            if (menu.open) {
                menu.full.close();
            }
            e.preventDefault();
        });

        siteOverlay.on('touchmove', function (e) {
            e.preventDefault();
        });

        /*function removeIOSRubberEffect( element ) {

            element.addEventListener( "touchstart", function () {

                var top = element.scrollTop, totalScroll = element.scrollHeight, currentScroll = top + element.offsetHeight;

                if ( top === 0 ) {
                    element.scrollTop = 1;
                } else if ( currentScroll === totalScroll ) {
                    element.scrollTop = top - 1;
                }

            } );

        }*/

        subNavMenu.on("touchstart", function () {
            var j = $(this),
              menuTop = j.scrollTop(),
              totalScroll = j.prop('scrollHeight');
            currentScroll = menuTop + j.prop('offsetHeight');

            if (menuTop === 0) {
                j.scrollTop(1);
            } else if (currentScroll === totalScroll) {
                j.scrollTop(menuTop - 1);
            }

            //console.log(totalScroll);
            //console.log(menuTop);

        });

        subNavMenuItems.on("touchstart", function (event) {
            //window.location = $target.attr('href');
            //subNavTarget = $(event.target);
            //console.log(event);
            //window.location = $target.attr('href');
            //event.preventDefault();
        }).on("touchend", function (event) {
            //var $target = $(event.target);
            //console.log(event);

            /*if (subNavTarget == $target) {
              window.location = $target.attr('href');
            } else {
              subNavTarget = '';
            }*/
            //window.location = $target.attr('href');
        });
    };

    menu.full.removeInterfaceMouse = function () {
        navItems.off('click');
        navCollapse.off('click');
        $(document).off('keydown');
        siteOverlay.off('click');
    };
    menu.full.removeInterfaceTouch = function () {
        $("body").off("touchstart");
        navLinks.off("touchstart");
        subNavMenu.off("touchstart");
        subNavMenuItems.off("touchstart touchend");
    };

    menu.full.open = function () {

        if (menu.enhancedMenu) {
            $('body').addClass('menu-open');
            mainNav.addClass('dole-menu-open');
            mainContent.addClass('dole-menu-open');
        } else {
            //$('body').addClass('menu-open');
            //mainNav.addClass('active');
            $('body').addClass('menu-open');
            mainNav.animate({
                left: '400px'
            }, menuSpeed);
            //mainContent.animate({left: '300px'}, menuSpeed);
        }
        menu.open = true;
    };
    menu.full.close = function () {

        if (menu.enhancedMenu) {
            $('body').removeClass('menu-open');
            mainNav.removeClass('dole-menu-open');
            mainContent.removeClass('dole-menu-open');

            navItems.removeClass('active');
        } else {
            $('body').removeClass('menu-open');
            mainNav.animate({
                left: '0px'
            }, '0.5s');

            navItems.removeClass('active');
        }

        /*exitDelay = setTimeout(function () {
          $('body').removeClass('menu-open');
        }, 600);*/

        menu.open = false;
    };

    menu.small = function () {
        menu.full.deactivate();
        menu.small.activate();

        menu.open = false;
    };

    menu.small.activate = function () {
        menu.currentType = "small";
        mainNav.addClass("dole-menu-small");

        menu.setHeight();
        menu.columnOffset();

        menu.small.setInterface();

        menu.small.setupSubmenu();

    };
    menu.small.deactivate = function () {
        if (menu.currentType === "small") {
            mainNav.removeClass("dole-menu-small");
        }

        menu.small.removeInterface();

        menu.small.close();

        menu.small.resetSubmenu();
    };

    menu.small.setupSubmenu = function () {
        navItems.each(function () {
            var j = $(this),
              t = j.find('a').data('navTarget');

            //Sitecore seems to want to apply the data-target to the li, not the a

            subNavSections.each(function () {
                if ($(this).hasClass(t)) {
                    $(this).detach().appendTo(j);
                }
            });
        });

        subNavFooter.detach().appendTo(menuContainer);

        //languageToggle.detach().appendTo(mobileUtilsLang);
    };
    menu.small.resetSubmenu = function () {
        navItems.each(function () {
            var j = $(this);
            /*var j = $(this),
                t = j.find('a').data('navTarget');*/

            j.find('.dole-secondary-nav-items').detach().appendTo(subNavContainer);
        });

        subNavFooter.detach().appendTo(subNavMenu);

        //languageToggle.detach().appendTo(siteUtils);
    };

    menu.small.setInterface = function () {

        mobileTrigger.on('click', function () {
            if (!menu.open) {
                menu.small.open();
            } else {
                menu.small.close();
            }
            return false;
        });

        navLinks.on("click", function () {
            var j = $(this),
              k = j.hasClass("sfhover"),
              t = j.find('dole-secondary-nav-items');

            if (!j.parent().hasClass('open')) {
                j.parent().addClass('open');
            } else {
                j.parent().removeClass('open');
            }


            return false;
        });

        siteOverlay.on('touchmove', function (e) {
            e.preventDefault();
        });
        menuContainer.on("touchstart", function () {
            var j = $(this),
              menuTop = j.scrollTop(),
              totalScroll = j.prop('scrollHeight');
            currentScroll = menuTop + j.prop('offsetHeight');

            if (menuTop === 0) {
                j.scrollTop(1);
            } else if (currentScroll === totalScroll) {
                j.scrollTop(menuTop - 1);
            }

            //console.log(totalScroll);
            //console.log(menuTop);

        });

    };
    menu.small.removeInterface = function () {

        mobileTrigger.off('click');
        navLinks.off("click");
        menuContainer.off("touchstart");

    };

    menu.small.open = function () {
        if (menu.enhancedMenu) {
            $('body').addClass('menu-open');
            menuContainer.css('height', 'auto');
            //mainNav.addClass('dole-menu-open');
            //mainContent.addClass('dole-menu-open');
        } else {
            //$('body').addClass('menu-open');
            //mainNav.animate({left: '400px'}, menuSpeed);
        }
        menu.open = true;
    };
    menu.small.close = function () {
        $('body').removeClass('menu-open');
        menuContainer.css('height', '0');

        menu.open = false;
    };

    menu.handleDOMEvent = function (j) {
        //navItems.removeClass('sfhover');
    };

    menu.columnOffset = function () {
        if (menu.currentType == "full") {

            subNavSections.each(function () {
                var cols = $(this).find('.dole-nav-column');
                var title = $(this).find('.dole-nav-title');

                if (cols.length > 0 && title.length == 0) {
                    var col1 = cols.eq(0);
                    var col2 = cols.eq(1);

                    //need to find second item, as the first needs to sit apart
                    //var item = col1.children('li:eq(1)');
                    var item = col1.find('li:eq(1)');
                    var offset = item.position();

                    col2.css('margin-top', offset.top + 'px');

                }

            });


        } else {
            subNavSections.each(function () {
                $(this).find('.dole-nav-column').css('margin-top', 'auto');
            });
        }
    };

    menu.setHeight = function () {
        if (menu.currentType == "full") {

            var $maxHeight = 0,
              $colHeight;

            subNavSections.each(function () {
                //console.log();
                $(this).attr('style', 'height:auto;');

                $colHeight = $(this).outerHeight();
                //console.log($colHeight);

                if ($colHeight > $maxHeight) {
                    $maxHeight = $colHeight;
                }

                //otmpc.console.log( $(this).attr('class') + ': ' + $maxHeight);

            });

            $('.dole-secondary-nav-header', subNavMenu).outerHeight($maxHeight);
        } else {
            //console.log('small');
            $('.dole-secondary-nav-header', subNavMenu).outerHeight('auto');
        }
    };

    $(function () {
        dole.win.onDelayedResize(menu.init, true);
    });
}(window.dole = window.dole || {}, jQuery));

/* End menu */

//article comment bar positioning
(function (dole, $) {

    var comments = dole.comments = {},
        mainContent = $('.dole-content-main'),
        sideBar = $('.dole-content-side'),
        topContent = $('.dole-content-top'),
        //commentBar = $('.dole-content-article .dole-comments-toggle a'),
        commentBar = $('.dole-comments-toggle a'),
        mainHeight,
        contentHeight,
        sidebarHeight,
        toggleHeight,
        topHeight,
        aniHeight,
        winWidth;

    //comments.init = false;
    //comments.selector = $('.dole-content-article .dole-comments-bar');

    comments.position = function () {
        /*if (!comments.init && commentBar.length > 0) {
          comments.init = true;
          //comments.selector.fadeIn('fast');
        }*/

        if (commentBar.length > 0) {
            if (dole.win.matchViewport("(min-width:960px)")) {

                topContent.css('padding-bottom', '0');

                mainHeight = mainContent.outerHeight();
                contentHeight = topContent.outerHeight();
                sidebarHeight = sideBar.outerHeight();
                toggleHeight = commentBar.outerHeight(true);

                //dole.console.log('main: ' + mainHeight);
                //dole.console.log('content: ' + contentHeight);
                //dole.console.log('side: ' + sidebarHeight);
                //dole.console.log('toggle: ' + toggleHeight);

                var otherHeight = contentHeight + toggleHeight + 30;

                if (sidebarHeight > otherHeight) {
                    //mainContent.animate({height: sidebarHeight + "px"}, 200);

                    //dole.console.log('position ---------------');
                    //dole.console.log('other: ' + otherHeight);

                    var setHeight = sidebarHeight - contentHeight - toggleHeight - 14;

                    //dole.console.log ( 'final: ' + (sidebarHeight - contentHeight) );
                    topContent.css('padding-bottom', setHeight + "px");

                } else {
                    //mainContent.css('height', 'auto');
                    topContent.css('padding-bottom', '30px');
                }
            } else {
                //mainContent.css('height', 'auto');
                topContent.css('padding-bottom', '30px');
            }
        }

    };

    $(function () {
        dole.win.onDelayedResize(comments.position, true);
        //setTimeout(dole.combar.position, 100);
        //dole.combar.position();
    });

}(window.dole = window.dole || {}, jQuery));

//recipe tag functions
(function (dole, $) {

    var recipeTags = dole.recipeTags = {},
        tagInput = $('.dole-tag-input'),
        sortOptions = $('.dole-sort-options'),
        addButton = $('.dole-recipe-results .dole-filter-tag-panel button'),
        inputLabel = $('.dole-recipe-results .dole-filter-tag-panel label'),
        tagContainer = $('.dole-recipe-results .dole-filter-tag-panel .dole-tag-input'),
        inputText = $('.dole-recipe-results .dole-filter-tag-panel .dole-tag-input .tagsinput input');

    recipeTags.init = true;
    recipeTags.tagCount = 0;

    recipeTags.borderTest = function () {

        if (dole.win.matchViewport("(min-width:1024px)")) {

            this.tagInputHeight = tagInput.height();
            this.sortOptHeight = sortOptions.height();

            if (this.tagInputHeight > this.sortOptHeight) {
                tagInput.css('border-right', '1px solid #c7ec48');
                sortOptions.css('border-left', 'none');
            } else {
                tagInput.css('border-right', 'none');
                sortOptions.css('border-left', '1px solid #c7ec48');
            }

        }

    };

    recipeTags.inputSize = function () {
        this.addButtonWidth = addButton.outerWidth();
        this.inputLabelWidth = inputLabel.outerWidth();
        this.tagWidth = tagContainer.outerWidth();

        this.listTagSelector = $('#dole-tag-list_tag');

        if (dole.win.matchViewport("(min-width:820px)")) {
            this.inputTextWidth = this.tagWidth - this.addButtonWidth - this.inputLabelWidth - 50;
        } else {
            this.inputTextWidth = this.tagWidth - 50;
        }

        this.listTagSelector.css('width', this.inputTextWidth + 'px');

        this.listTagSelector.autocomplete({
            minLength: 2,
            source: ["banana", "apple", "orange", "tomato", "pineapple", "strawberry", "chicken"],
            close: function (e, u) {
                dole.recipeTags.autoTag(e, u);
            }
        });
    };

    recipeTags.showFilter = function () {
        this.filterPanel = $('.dole-recipe-results .dole-filter-tag-panel');
        this.dropArrow = $('.dole-sort-by-bar a.sort-by span');
        this.filterPanel.slideToggle('fast', this.inputSize);

        this.dropArrow.toggleClass('open');
    };

    recipeTags.addTag = function () {

        recipeTags.tagName = $('#dole-tag-list_tagsinput span.tag:last-of-type span').text();
        if (recipeTags.tagCount >= 5) {
            $('#dole-tag-list_tag').attr('data-default', "Maximum Of 5 Tags");
            recipeTags.tagCount++;
            $('#dole-tag-list').removeTag(recipeTags.tagName);

        } else {
            $('#dole-tag-list_tag').attr('data-default', "Enter An Ingredient");
            recipeTags.tagCount++;
            recipeTags.borderTest();
        }

    };

    recipeTags.removeTag = function () {

        $('#dole-tag-list_tag').attr('data-default', "Enter An Ingredient");

        if (recipeTags.tagCount > 0) {
            recipeTags.tagCount--;
        }

        recipeTags.borderTest();
    };

    recipeTags.autoTag = function (e, u) {

        this.val = $(e.target).val();
        $('#dole-tag-list').addTag(this.val);

    };

    $(function () {

        if ($('#dole-tag-list').get().length > 0) {

            $('#dole-tag-list').tagsInput({
                //'autocomplete_url': url_to_autocomplete_api,
                //'autocomplete': { option: value, option: value},
                'height': 'auto',
                'width': '100%',
                'interactive': true,
                'defaultText': 'Enter An Ingredient',
                'onAddTag': recipeTags.addTag,
                'onRemoveTag': recipeTags.removeTag,
                'onChange': recipeTags.borderTest(),
                'removeWithBackspace': false,
                'minChars': 2,
                'maxChars': 50, //if not provided there is no limit
                'placeholderColor': '#CCDF8C',
                'activeColor': '#fff'
            });

        }

        dole.win.onDelayedResize(recipeTags.inputSize, false);

        $('.dole-recipe-results .dole-sort-by-bar .sort-by').tap(function (e) {
            e.preventDefault();
            this.blur();
            dole.recipeTags.showFilter();
        });

    });


}(window.dole = window.dole || {}, jQuery));

//video page sort
(function (dole, $) {

    var videoSort = dole.videoSort = {},
        videoSortToggles = $('.dole-video-results'),
        videoSortTriggers = videoSortToggles.find('a.sort-by');

    videoSort.init = function () {

        if (videoSortToggles.length > 0) {

            videoSort.addResetHandler();
            videoSortTriggers.on('click', function () {
                var j = $(this),
                    icon = j.find('span'),
                    target = j.parents('.dole-sort-by-bar'),
                    options = target.find('.dole-sort-options');

                icon.toggleClass('open');
                options.slideToggle('fast');

                return false;
            });

        }
    }

    videoSort.showOptions = function (el) {
        //this.dropArrow = $('.dole-sort-by-bar a.sort-by span');
        //this.options = $('.dole-video-results .dole-sort-options');

        //this.options.slideToggle('fast');
        //this.dropArrow.toggleClass('open');

        //console.log(el);
        el.addClass('open');

    };

    videoSort.hideOptions = function (el) {
        //this.dropArrow = $('.dole-sort-by-bar a.sort-by span');
        //this.options = $('.dole-video-results .dole-sort-options');

        //this.options.slideToggle('fast');
        //this.dropArrow.toggleClass('open');

        //console.log(el);
        el.removeClass('open');

    };

    videoSort.addResetHandler = function () {

        $(window).on('scroll', function (e) {
            videoSort.closeAllToggles(e);
        });

        $('body').on('click', function (e) {
            var $target = $(e.target);
            if (!$target.parents().hasClass('dole-sort-by-bar')) {
                videoSort.closeAllToggles(e);
            }
        });

    }

    videoSort.closeAllToggles = function (e) {
        videoSortTriggers.each(function () {
            var j = $(this),
                icon = j.find('span'),
                target = j.parents('.dole-sort-by-bar'),
                options = target.find('.dole-sort-options');

            icon.removeClass('open');
            options.slideUp('fast');
        })
    }

    $(function () {
        videoSort.init();
    });

}(window.dole = window.dole || {}, jQuery));

//Generic sort by bar
(function (dole, $) {

    var sortBy = dole.sortBy = {},
        sortToggles = $('.dole-results-bar');

    sortBy.init = function () {
        sortToggles.each(function () {

            $trigger = $('a.dole-sort-by', $(this));
            $trigger.on('click', function (e) {
                e.preventDefault();
                console.log('trigger click');
            })
            //$(this).dropArrow = $('.dole-sort-by-bar a.sort-by span');
            //$(this).options = $('.dole-video-results .dole-sort-options');

            //$(this).options.slideToggle('fast');
            //$(this).dropArrow.toggleClass('open');
        })
    }



    /*sortBy.showOptions = function () {
      this.dropArrow = $('.dole-sort-by-bar a.sort-by span');
      this.options = $('.dole-video-results .dole-sort-options');

      this.options.slideToggle('fast');
      this.dropArrow.toggleClass('open');

    };*/

    $(function () {
        sortBy.init();
    });

}(window.dole = window.dole || {}, jQuery));

//language menu functions
(function (dole, $) {

    var langMenu = dole.langMenu = {};

    langMenu.showOptions = function () {
        if ($('.dole-lang-options-menu').hasClass('open')) {
            //$('.dole-lang-options').removeClass('open');
            $('.dole-lang-options-menu').removeClass('open');
            $('.dole-lang-options').fadeOut('slow');
        } else {
            $('.dole-lang-options').fadeIn('slow');
            $('.dole-lang-options-menu').addClass('open');
            //$('.dole-lang-options').addClass('open');
        }
    };

    $(function () {
        $('.dole-lang > a').tap(function (e) {
            e.preventDefault();
            this.blur();
            dole.langMenu.showOptions();
        })

    });

}(window.dole = window.dole || {}, jQuery));

//masthead search functions
(function (dole, $) {

    var mastSearch = dole.mastSearch = {};
    var newHeight = 0;

    mastSearch.tagCount = 0;

    mastSearch.makeActive = function (element) {

        $('.dole-search-nav-panel ul li').removeClass('active-search-item open-search-item');
        if (!$(element).parent().hasClass('dole-no-hover')) {
            $(element).parent().addClass('active-search-item');
        }

        $(element).parents('.dole-search-nav-panel li').addClass('open-search-item');

    };

    mastSearch.showFilter = function () {

        this.filterPanel = $('.dole-search-nav-panel');
        this.dropArrow = $('.dole-search-masthead .dole-filter-bar a span');
        this.filterPanel.slideToggle('fast', dole.mastSearch.heightSlide);
        this.dropArrow.toggleClass('open');

        this.listTagSelector = $('#dole-search-tag-list_tag');
        this.listTagSelector.autocomplete({
            minLength: 2,
            source: ["banana", "apple", "apricot", "almond", "orange", "tomato", "pineapple", "strawberry", "chicken"],
            create: function () {
                $('ul.ui-autocomplete').addClass('dole-mast-search-auto');
            },
            close: function (e, u) {
                dole.mastSearch.autoTag(e, u);
            }
        });

    };

    mastSearch.heightSlide = function () {

        this.col = $('.dole-search-nav-panel ul');
        newHeight = 0;

        this.col.each(function (i) {

            var testHeight = 0;
            var pad = 40;

            if ($(this).parent().hasClass('open-search-item')) {
                testHeight = $(this).outerHeight();
            }


            if (testHeight + pad > newHeight) {
                newHeight = testHeight + pad;
            }

        });

        $('.dole-search-nav-panel').animate({ height: newHeight + 'px' });

        mastSearch.setWidth();

    };

    mastSearch.setWidth = function () {

        this.tagPanel = $('#dole-search-tag-list');
        this.tagPanel.parent().css('padding', '0');

        if (dole.win.matchViewport("(min-width:620px)")) {
            this.tagPanel.parent().parent().css({ width: "200%" });
        } else {
            this.tagPanel.parent().parent().css({ width: "auto" });
        }
    };

    mastSearch.addTag = function () {

        mastSearch.tagCount++;
        mastSearch.tagName = $('#dole-search-tag-list_tagsinput span.tag:last-of-type span').text();

        if (mastSearch.tagCount > 5) {

            $('#dole-search-tag-list_tag').attr('data-default', "Max - 5 Tags");
            $('#dole-search-tag-list').removeTag(mastSearch.tagName);

        } else if (mastSearch.tagCount == 4) {

            //$('#dole-search-tag-list_tag').attr('data-default', "Max - 5 Tags");

        } else {
            $('#dole-search-tag-list_tag').attr('data-default', "keyword");
        }

        mastSearch.heightSlide();

    };

    mastSearch.removeTag = function () {

        $('#dole-search-tag-list_tag').attr('data-default', "keyword");

        if (mastSearch.tagCount > 0) {
            mastSearch.tagCount--;
        }

    };

    mastSearch.autoTag = function (e, u) {

        this.val = $(e.target).val();
        $('#dole-search-tag-list').addTag(this.val);

    };

    dole.win.onDelayedResize(mastSearch.heightSlide, true);

    $(function () {

        $('.dole-search-nav-panel ul li').tap(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).children().blur();
            dole.mastSearch.makeActive(e.target);
            dole.mastSearch.heightSlide();
        });

        $('.dole-search-masthead .dole-filter-bar a').tap(function (e) {

            e.preventDefault();
            this.blur();
            dole.mastSearch.showFilter();
        });

        if ($('#dole-search-tag-list').get().length > 0) {

            $('#dole-search-tag-list').tagsInput({
                //'autocomplete_url': url_to_autocomplete_api,
                //'autocomplete': { option: 'value', option2: 'value2'},
                'height': 'auto',
                'width': '100%',
                'interactive': true,
                'defaultText': 'keyword',
                'onAddTag': mastSearch.addTag,
                'onRemoveTag': mastSearch.removeTag,
                'onChange': mastSearch.setWidth(),
                'removeWithBackspace': false,
                'minChars': 2,
                'maxChars': 50, //if not provided there is no limit
                'placeholderColor': '#ccc',
                'activeColor': '#666'
            });

        }

    });

}(window.dole = window.dole || {}, jQuery));

//faq toggles
(function (dole, $) {

    var faq = dole.faq = {},
        toggles = $('#faq-list').find('.dole-faq-toggle');

    faq.init = function () {
        toggles.on('click', function (e) {
            e.preventDefault();
            this.blur();
            console.log(this);
            dole.faq.showPanel(this);
        });
    }

    faq.showPanel = function (element) {

        this.filterPanel = $(element).parent().next();
        //this.filterPanel.slideToggle('fast');
        this.filterPanel.toggleClass('open');

        this.dropArrow = $(element);
        this.dropArrow.toggleClass('open');

    };

    /*$('.dole-faq-answers .dole-wrapper a.dole-faq-toggle').tap(function (e) {
      e.preventDefault();
      this.blur();
      console.log(e.target);
      dole.faq.showPanel(e.target);
    });*/

    $(function () {
        faq.init();
    })

}(window.dole = window.dole || {}, jQuery));

//date picker
(function (dole, $) {
    var datepicker = dole.datepicker = {};
    var dateInput = $('#dole-datepicker');

    datepicker.style = function () {
        $('#ui-datepicker-div').addClass('dole-contact-theme');
    };

    if (!dole.features.datetype) {
        dateInput.datepicker({
            //options
        });
        dateInput.val('Select Date');
        dole.datepicker.style();
    }


}(window.dole = window.dole || {}, jQuery));

//jQuery validate
(function (dole, $) {

    var jqValidate = dole.jqValidate = {};

    this.inputs = $('form.dole-contact-us input, form.dole-contact-us select');
    this.inputs.each(function () {
        if ($(this).attr('required')) {
            $(this).siblings('label').addClass('dole-required-label');
            $(this).parent().siblings('label').addClass('dole-required-label');
        }
    });


    if ($().validate) {

        $.validator.addMethod("not",
                function (value, element, params) {
                    return this.optional(element) || value != params;
                },
                "Please enter the correct value");

        $(function () {
            $('#contact-us-full, #contact-us-general').validate({
                errorElement: 'div',
                errorClass: "dole-form-error",
                ignore: 'input[type=date]'
            });

        });

    }

}(window.dole = window.dole || {}, jQuery));


/* timeline */
jQuery(document).ready(function ($) {
    var timelineBlocks = $('.timeline li'),
		offset = 0.8;

    //hide timeline blocks which are outside the viewport
    hideBlocks(timelineBlocks, offset);

    //on scolling, show/animate timeline blocks when enter the viewport
    $(window).on('scroll', function () {
        (!window.requestAnimationFrame)
			? setTimeout(function () { showBlocks(timelineBlocks, offset); }, 100)
			: window.requestAnimationFrame(function () { showBlocks(timelineBlocks, offset); });
    });

    function hideBlocks(blocks, offset) {
        blocks.each(function () {
            ($(this).offset().top > $(window).scrollTop() + $(window).height() * offset) && $(this).find('.timeline-badge, .timeline-panel').addClass('is-hidden');
        });
    }

    function showBlocks(blocks, offset) {
        blocks.each(function () {
            ($(this).offset().top <= $(window).scrollTop() + $(window).height() * offset && $(this).find('.timeline-badge, .timeline-panel').hasClass('is-hidden')) && $(this).find('.timeline-badge, .timeline-panel').removeClass('is-hidden').addClass('bounce-in');
        });
    }
});
/* End timeline */