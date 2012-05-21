function suggest (search_box_id, options) {//results_box_id, cookie_name, url) {

    if (options == null) { options = new Object(); };

    if (options.cookie_name == null) { options.cookie_name = default_cookie_name(); };
    
    if (options.url == null) { options.url = default_suggestion_url(); };
    
    if (options.searchback == null) { options.searchback = searchback };
    
    if (options.minimum_length == null) { options.minimum_length = default_minimum_search_length() };

    if (options.show_only_failure == null) { options.show_only_failure = 0 };
    
    if (options.results_box_id == null) { options.results_box_id = default_results_box_id() };

    var search_box = document.getElementById(search_box_id);

    if (search_box.usingKeySelection) {
        search_box.usingKeySelection = 0;
        return;
    }

    var search_text = search_box.value;
    

    if (search_text.length < options.minimum_length) { 
        search_box.setAttribute('class', search_box.getAttribute('oldClassName'));
        if (search_box.getAttribute('class') == 'null') {
                search_box.removeAttribute('class');
        };
        hide_suggestions(options.results_box_id);
        return;
    };

    var data_form = search_box.form;

    //if we've been given arguments, then we just pass those to the script on the server. No other form elements.
    if (options.arguments != null) {
        options.method = 'get';
        var query_args = new Array();
        for (prop in options.arguments) {
            if (options.arguments[prop] instanceof Array) {
                var i = 0;
                for (i = 0; i < options.arguments[prop].length; i++) {
                    query_args.push(prop + '=' + options.arguments[prop][i]);
                }
            }
            else {
                query_args.push(prop + '=' + options.arguments[prop]);
            }
        }
        
        var search_field = default_search_box_name();
        if (options.search_field_name != null) {
            search_field = options.search_field_name;
        }
        
        query_args.push(search_field + '=' + search_text);
        
        options.url += '?' + query_args.join('&');
        data_form = null;
    }
    
    var disabled = read_cookie(options.cookie_name);

    if (search_text && disabled != 1) {
        
        if (search_box.suggestion_request != null) {
            search_box.suggestion_request.abort();
        }

        search_box.suggestion_request = wrapHttpRequest(
            {
                url         : options.url,
                data_form   : data_form,
                callback    : options.searchback,
                target      : results_box_for_id(options.results_box_id),
                method      : options.method,
                showLoading : 0,
                properties  : {
                    search_box_id  : search_box_id,
                    results_box_id : options.results_box_id,
                    cookie_name    : options.cookie_name,
                    failure_box_id : options.failure_box_id,
                    show_only_failure : options.show_only_failure,
                }
            }
        );


    }
    else {
        hide_suggestions(options.results_box_id);
    }
}

function searchback(http, target) {
    if (http.readyState == 4) {
    
        var results_box = document.getElementById(http.results_box_id);

        if (results_box != null) {
            results_box.last_suggestion = null;
            results_box.first_suggestion = null;
        }
    
        var search_box = document.getElementById(http.search_box_id);

        search_box.setAttribute('class', search_box.getAttribute('oldClassName'));
        if (search_box.getAttribute('class') == 'null') {
                search_box.removeAttribute('class');
        }
        if (http.responseText) {
            target.setAttribute('class', 'popup');
            target.innerHTML = http.responseText;
            search_box.last_suggestions = target.innerHTML;
            if (http.show_only_failure) {
                target.innerHTML = '';
                search_box.last_suggestions = null;
                hide_suggestions(http.results_box_id);
            }
            else {
                show_suggestions(http.search_box_id, http.results_box_id, http.cookie_name, true);
            }
        }
        else if (! http.responseText && http.failure_box_id) {
            target.innerHTML = document.getElementById(http.failure_box_id).innerHTML;
            target.setAttribute('class', 'failure_box');
            show_suggestions(http.search_box_id, http.results_box_id, http.cookie_name, true);
            search_box.last_suggestions = target.innerHTML;
            search_box.setAttribute('oldClassName', search_box.getAttribute('class'));
            if (findCSSClass('autocomplete_input_failure', 'div')) {
                search_box.setAttribute('class', 'autocomplete_input_failure');
            }
        }
        else {
            hide_suggestions(http.results_box_id);
        }
    }

}

function show_suggestions(search_box_id, results_box_id, cookie_name, skip_last_suggestions) {

    if (cookie_name == null) { cookie_name = default_cookie_name(); };
    
    var search_box = document.getElementById(search_box_id);

    var disabled = read_cookie(cookie_name);

    if (search_box.value.length && disabled != 1) {
        var search_box_position = getPosition(search_box);
    
        var results_box              = results_box_for_id(results_box_id);
        if (skip_last_suggestions == null && search_box.last_suggestions != null) {
            results_box.innerHTML         = search_box.last_suggestions;
        }
    
        if (results_box.innerHTML.length > 0 ) {
            results_box.style.left       = search_box_position[0] + 'px';
            results_box.style.top        = search_box_position[1]  + search_box.offsetHeight + 10 + 'px';
            results_box.style.width      = search_box.style.offsetWidth;
            results_box.style.visibility = 'visible';
            
            results_box.scrollTop = 0;
            
            document.results_box = results_box;

            if (document.autocompleteKeyListener != null) {
                document.removeEventListener('keydown', document.autocompleteKeyListener, false);
            }
            document.autocompleteKeyListener = function(evt) {

                    var usingDirectional = false;
                    search_box.usingKeySelection = 1;
                    
                
                    //go up
                    if (evt.keyCode == 38) {
                    
                        if (results_box.scrollTop > 13) {
                            results_box.scrollTop -= 13;
                        }
                    
                        usingDirectional = true;

                        if (results_box.last_suggestion == null) {
                            set_default_suggestion(results_box);
                        }
                        else {
                            results_box.last_suggestion.setAttribute('class', 'suggestion');
                            
                            var previous_suggestion = results_box.last_suggestion.previousSibling;
                            if (results_box.last_suggestion != results_box.first_suggestion) {
                                results_box.last_suggestion = previous_suggestion;
                            }
                        }

                        results_box.last_suggestion.setAttribute('class', 'selected_suggestion');
                        
                    }
                    //go down
                    else if (evt.keyCode == 40) {

                        results_box.scrollTop += 13;

                        usingDirectional = true;
                        
                        if (results_box.last_suggestion == null) {
                            set_default_suggestion(results_box);
                        }
                        else {

                            results_box.last_suggestion.setAttribute('class', 'suggestion');
                            
                            var next_suggestion = results_box.last_suggestion.nextSibling;

                            if (next_suggestion != null) {
                                results_box.last_suggestion = next_suggestion;
                            }
                                                        
                        }
                        
                        results_box.last_suggestion.setAttribute('class', 'selected_suggestion');
                        
                    }
                    //right arrow or escape, shut the box
                    else if (evt.keyCode == 39 || evt.keyCode == 27) {
                        make_suggestion(search_box.id, search_box.value, results_box.id);
                    }
                    else {
                        search_box.usingKeySelection = 0;
                    }
                    if (usingDirectional) {
                        var suggestion_text = document.all
                            ? results_box.last_suggestion.innerText
                            : results_box.last_suggestion.textContent;
                        
                        search_box.value = suggestion_text;
                        
                        //100 is a magic number - max height of the box
                        //13 is another magic number - height of the row
                        if (results_box.last_suggestion.offsetTop + 13 > results_box.scrollTop + 100
                            || results_box.last_suggestion.offsetTop < results_box.scrollTop) {
                            results_box.scrollTop = results_box.last_suggestion.offsetTop;
                        }

                    }

                };

            document.addEventListener('keydown', document.autocompleteKeyListener, false);
        }
    }

}

function set_default_suggestion (results_box) {
    results_box.last_suggestion = results_box.firstChild.nextSibling;
    results_box.first_suggestion = results_box.last_suggestion;
}

function set_last_suggestion(results_box_id, element) {
    var results_box = results_box_for_id(results_box_id);

    if (results_box.last_suggestion != null) {
        results_box.last_suggestion.setAttribute('class', 'suggestion');
    }
    
    set_default_suggestion(results_box);
    results_box.last_suggestion = element;
    element.setAttribute('class', 'selected_suggestion');
}

function wipe_last_suggestion(results_box_id, element) {
    var results_box = results_box_for_id(results_box_id);
    
    results_box.last_suggestion.setAttribute('class', 'suggestion');
    results_box.last_suggestion = null;
}

function hide_suggestions(results_box_id) {

    var results_box = results_box_for_id(results_box_id);
    
    if (results_box.remain_open) {
        return;
    }
    
    if (! results_box.mouseInsideOfBox) {
        results_box.style.visibility = 'hidden';
    }
    
    results_box.last_suggestion = null;
    results_box.first_suggestion = null;
    if (document.autocompleteKeyListener != null) {
        document.removeEventListener('keydown', document.autocompleteKeyListener, false);
    }
    document.autocompleteKeyListener = null;

}

function make_suggestion(search_box_id, text, results_box_id) {
    document.getElementById(search_box_id).value = text;

    outside_suggestions(results_box_id);

    hide_suggestions(results_box_id); 
}

function inside_suggestions(results_box_id) {
    results_box_for_id(results_box_id).mouseInsideOfBox = 1;
}

function outside_suggestions(results_box_id) {
    results_box_for_id(results_box_id).mouseInsideOfBox = 0;    
}

function enable_suggestions(cookie_name) {
    set_suggestion_cookie(cookie_name, 0);
}

function disable_suggestions(cookie_name, results_box_id) {
    set_suggestion_cookie(cookie_name, 1);
    
    outside_suggestions(results_box_id);
    hide_suggestions(results_box_id);
}

function set_suggestion_cookie(cookie_name, value) {
    //default cookie name is disable_suggestions
    if (cookie_name == null) { cookie_name = default_cookie_name(); };
    
    var today = new Date();
    expires = new Date(today.getTime() + (86400 * 1000 * 365) );
    set_cookie(cookie_name, value, expires);    
}

function default_cookie_name () {
    return 'disable_suggestions';
}

function default_suggestion_url () {
    return '/db/searches/popup_search';
}

function default_search_box_name () {
    return 'search_for';
}

function default_results_box_id () {
    return 'search_suggestions';
}

function default_minimum_search_length() {
    return 1;
}

function results_box_for_id(results_box_id) {
    if (results_box_id == null) {
        results_box_id = default_results_box_id();
    }
    
    return document.getElementById(results_box_id);
}

document.addEventListener('DOMContentLoaded', prep_autocomplete_boxes, false);

function prep_autocomplete_boxes () {
    var input_boxes = document.getElementsByTagName('input');

    for (var i = 0; i < input_boxes.length; i++) {
        var input_box = input_boxes[i];
        var box_class = input_box.getAttribute('class');
        if (box_class != null && box_class.search(/\bautocomplete\b/) >= 0) {
            input_box.addEventListener('keyup', function() { suggest(this.id) }, false);
            input_box.addEventListener('blur',  function() { hide_suggestions() }, false);
            input_box.addEventListener('focus', function() { show_suggestions(this.id) }, false);
        }
    }
}
            