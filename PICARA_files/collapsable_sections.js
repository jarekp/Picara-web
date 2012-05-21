function toggle_section(img, div, sender) {

    if (img == null) {
        return;
    }

    if (toggle_section.displayStyle == 'block' 
       || (toggle_section.displayStyle == null && div.style.display == 'none')
    ) {
		img.src = '/images/minus.png';
		div.style.display = 'block';

		//XXX for sticky future content
		var today = new Date();
		//86400 seconds per day, 1000 milliseconds in a second, 7 days
		expires = new Date(today.getTime() + (86400 * 1000 * 7) );

		if (sender != null) {
			//document.cookie = sender.id + '=open; path=' + location.pathname + ";expires=" + expires.toGMTString();
			set_sticky_cookie(sender.id, 'open');
		}
    }
    else {
        img.src = '/images/plus.png';
        div.style.display = 'none';

		//XXX for sticky future content
		if (sender != null) {
			//document.cookie = sender.id + '=closed; path=' + location.pathname + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
			set_sticky_cookie(sender.id, 'closed');
		}

    }
}

// wrappers to call toggle_all on the appropriate class to the
// appropriate display style

function expand_all_sections (ns, container, sender) {
    toggle_all(ns, container, new RegExp(ns + "-header-\\d+"), 'block', 1, sender);
}

function collapse_all_sections (ns, container, sender) {
    toggle_all(ns, container, new RegExp(ns + "-header-\\d+"), 'none', 1, sender);
}

function show_empty_sections (ns, container, sender) {
    toggle_all(ns, container, new RegExp(ns + "-section-empty-\\d+"), 'block', 0, sender);
}

function hide_empty_sections (ns, container, sender) {
    toggle_all(ns, container, new RegExp(ns + "-section-empty-\\d+"), 'none', 0, sender);
}

function toggle_all(ns, container, regex, displayStyle, shouldClick, sender) {

    var children = container.childNodes;
    for (var i = 0; i < children.length; i++) {

        // IMPORTANT. Check the node's type to make sure it's an
        // element. text blocks don't have classes, for instance
        if (children[i].nodeType == Node.ELEMENT_NODE) {
            var id = children[i].getAttribute('id');
            if (regex.exec(id)) {
            	//if we've told the function to click, then set the toggle_section function to the display_style,
            	// and click
                if (shouldClick) {
	                toggle_section.displayStyle = displayStyle;
	                eval(children[i].getAttribute('onclick'));
				}
				//otherwise, just set the element to the displayStyle
				else {
					children[i].style.display = displayStyle;
				}
            }
        }
        
        toggle_all(ns, children[i], regex, displayStyle, shouldClick, sender);
    };

    toggle_section.displayStyle = null;
}

function childWithId(container, id) {
	var children = container.childNodes;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == Node.ELEMENT_NODE) {
        	if (children[i].getAttribute('id') == id) {
        		return children[i];
        	}
        	else {
        		var descendent = childWithId(children[i], id);
        		if (descendent != null) {
        			return descendent;
        		}
        	}
        }
    }
    
    return null;
}

function toggleHttpHandler (http, target, args) {
    if (http.readyState == 4) {
        defaultHttpHandler(http, target);
        target.setAttribute('loaded', 1);
    }
}

function gmapHttpHandler (http, target, args) {

    if (http.readyState == 4) {

        toggleHttpHandler(http, target, args);

    }
}


function removeHeaderAndFooter(container) {

	var divs = container.getElementsByTagName('div');
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].getAttribute('id') == 'grm_header' || divs[i].getAttribute('id') == 'grm_footer') {
			divs[i].parentNode.removeChild(divs[i]);
		}
	}
	
	return container.innerHTML;

}

function retargetLinks (container, target) {

	var urlRegex	= new RegExp('^http');
	var validLinkRegex	= new RegExp('(/|html?)$');			

	var links = container.getElementsByTagName('a');

	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (link.getAttribute('onclick') == null
			&& ! urlRegex.exec(link.getAttribute('href'))
			&& validLinkRegex.exec(link.getAttribute('href'))
			) {
			link.setAttribute('onclick',
				'wrapHttpRequest({url : "'
				+ link.getAttribute('href')
				+ '", target: document.getElementById("'
				+ target.getAttribute('id') + '"), callback: rewriteHttpHandler}); return false'
			);
		}
		
	}
	
	var forms = container.getElementsByTagName('form');
	
	for (var i = 0; i < forms.length; i++) {
		var form = forms[i];
		if (form.getAttribute('onclick') == null
			&& ! urlRegex.exec(form.getAttribute('href'))
			) {
		
			form.setAttribute('onsubmit',
				'wrapHttpRequest({url : "'
				+ form.getAttribute('action')
				+ '", target: document.getElementById("'
				+ target.getAttribute('id') + '"), callback: rewriteHttpHandler,'
				+ 'data_form : this, method : "' + form.getAttribute('method') + '"}); return false'
			);
				
		
		}
	}
	
	return container.innerHTML;

}

function ajax_toggle_section (img, url, target, sender, customHandler) {

    if (target.getAttribute('loaded')) {
        toggle_section(img, target, sender);
    }
    else {
    	if (ajax_toggle_section.url != null) {
    		url = ajax_toggle_section.url;
    	}
        toggle_section(img, target, sender);
        var handler = customHandler ? customHandler : toggleHttpHandler;
        wrapHttpRequest({ url: url, target:target, callback: handler});
    }
}
//end ajax-y stuff

//handle sticky cookies

function set_sticky_cookie(id, state) {
	var sticky_cookie = read_sticky_cookie();
	
	//okay, if it's in there AND it should be shut, we delete it
	if (is_sticky(id) && state == 'closed') {

		var idRegex = new RegExp(location.pathname + ':' + id);

		sticky_cookie = sticky_cookie.replace(idRegex, '');
		//and clean up after it
		sticky_cookie = sticky_cookie.replace(/^!/, '');
		sticky_cookie = sticky_cookie.replace(/!$/, '');
		sticky_cookie = sticky_cookie.replace(/!!/, '!');
		
	}
	//otherwise, it should be open. Add it, if necessary
	else if (! is_sticky(id) && state == 'open') {
		sticky_cookie = sticky_cookie + (sticky_cookie.length ? '!' : '') + location.pathname + ':' +id;
	}
	
	var today = new Date();
	//86400 seconds per day, 1000 milliseconds in a second, 7 days
	expires = new Date(today.getTime() + (86400 * 1000 * 7) );
	//alert('sticky_cookie=' + sticky_cookie + ';path=/;expires=' + expires.toGMTString());
	set_cookie('sticky_cookie', sticky_cookie, expires);
	//document.cookie = 'sticky_cookie=' + sticky_cookie + ';path=/;expires=' + expires.toGMTString();
}

function read_sticky_cookie() {
	return read_cookie('sticky_cookie');
}

function is_sticky(id) {
	var cookie_string = location.pathname + ':' + id;
	var sticky_cookie = read_sticky_cookie();
	if (sticky_cookie.indexOf(cookie_string) >= 0) {
		return true;
	}
	else {
		return false;
	}
}
