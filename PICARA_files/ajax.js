//simple functions for simple ajax requests. wrapHttpRequest takes an object
//with named params, makeHttpRequest is the older procedural approach w/unnamed
//arguments.
//
//the only required params are url (the url to load) and target (which must be
//the -element- (not just the ID)) into which to load the data.
//
//callback is a callback method that can be used for further processing
//method is post or get (default get)
//data_form is a form element. If passed, then all form fields will be
//encapsulated into the request and sent along as well

//quicker function for ajax calls - takes a URL and a target ID (very important!)
//wrappers around wrapHttpRequest, which you should use for more advanced options

function quickHttpRequest (url, targetID) {
    return wrapHttpRequest({
        url : url,
        target : document.getElementById(targetID)
    });
};



// wrapHttpRequest
//
// makes a fancy ajax call to the server. Accepts a number of arguments, passed in via an object
//
// url          - required. the URL to load.
// target       - required. the HTML element to stuff the results into. NOTE - this is an element, not
//                an ID. use document.getElementById('some_id') if you need to.
// method       - optional. the method of the request - "post" or "get". Defaults to "get"
// data_form    - optional. A form element of data to pass along with your request. Note - pass the form
//                element itself, not its name or id.
// args         - optional. an object to hand to the callback function with additional arguments to be used there.
//  args.append - optional. 1/0. Whether or not to append the results onto the target, or replace. Defaults to 0 to replace.
// showLoading  - optional. 1/0. Whether or not to stuff the "loading data" placeholder into the target. Defaults to 1.
// properties   - optional. additional properties to tack onto your httpRequest object.
// callback     - optional. The callback function to call when the request receives results. defaults to 'defaultHttpHandler'

function wrapHttpRequest (o) {

    if (o.callback == null) {
        o.callback = defaultHttpHandler;
    }

    if (o.method == null) {

        if (o.data_form != null && o.data_form.method.length) {
            o.method = o.data_form.method;
        }
        else {
            o.method = 'get';
        }

    }
    
    if (o.showLoading == null) {
        o.showLoading = 1;
    }
    
    var data = '';

    if (o.data_form != null) {
        data = stringify_form(o.data_form);
    }
    
    var httpReq = false;
    
    if (window.XMLHttpRequest) {
        try {
            httpReq = new XMLHttpRequest();
        }
        catch (e) {
            httpReq = false;
        }
    }
    else if (window.ActiveXObject) {
        try {
            httpReq = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                httpReq = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(e) {
                httpReq = false;
            }
        }
    }

    if (httpReq) {
        document.body.style.cursor = 'wait';

        if (o.showLoading) {
            var loadingDiv = document.createElement('div');
            loadingDiv.align = 'left';
            loadingDiv.innerHTML = '<img src="/images/loading.gif" style = "float : left"><h2>&nbsp;&nbsp;&nbsp;loading data</h2>';
            
            o.target.insertBefore(loadingDiv, o.target.firstChild);
    
            o.target.innerHTML = '<div align="left"><img src="/images/loading.gif" style = "float : left"><h2>&nbsp;&nbsp;&nbsp;loading data</h2></div>';
        }

        o.callback.xmlHttpRequest = httpReq;

        if (o.method.toLowerCase() == 'get') {
    		var d = encodeURI(new Date().getTime());
    		if (data != '') {
                o.url += '?' + data + '&ajax_date=' + d;
    		}
    		else {
                var hasQuestionMark = new RegExp('\\?');
                var joiner = '?';
                if (hasQuestionMark.exec(o.url)) { joiner = '&' };
    			o.url += joiner + 'ajax_date=' + d;
    		}
        }
        
        for (prop in o.properties) {
            httpReq[prop] = o.properties[prop];
        }
        
        //useful for debugging
        //alert(o.url);
    
        httpReq.open(o.method, o.url, true);
        if (o.method.toLowerCase() == 'post') {
            httpReq.setRequestHeader('Content-Type',
'application/x-www-form-urlencoded');
        }
    
        httpReq.onreadystatechange = function () {
            o.callback(httpReq, o.target, o.args);
        }

        httpReq.send(data);

        return httpReq;
    }

    return false;
}

function defaultHttpHandler (http, target, args) {
    if (http.readyState == 4) {
        document.body.style.cursor = 'default';
        
        /*
        
        // This section causes safari 2.0.4 to crash, so we can't do it. Dang.
        // instead, we just toss in the appropriate responseText.
        
        var containerDiv = document.createElement('div');
        containerDiv.innerHTML = http.responseText;
                    
        removeHeaderAndFooter(containerDiv);
        
        target.innerHTML = containerDiv.innerHTML;
        //*/

        
        if (args != null && args.append) {
            target.innerHTML += http.responseText;
            target.parentNode.scrollTop = target.parentNode.scrollHeight;
        }
        else {
            target.innerHTML = http.responseText;
        }
    }
}

function rewriteHttpHandler (http, target, args) {

    if (http.readyState == 4) {

        document.body.style.cursor = 'default';

        var containerDiv = document.createElement('div');
        containerDiv.innerHTML = http.responseText;
                    
        removeHeaderAndFooter(containerDiv);
        retargetLinks(containerDiv, target);
        
        target.innerHTML = containerDiv.innerHTML;
        target.setAttribute('loaded', 1);

    }
}

function stringify_form(data_form) {
    var data = '';
    var i = 0;
    for (i = 0; i < data_form.elements.length; i++) {
        if (data_form.elements[i].name && (data_form.elements[i].type !=
            'checkbox' || data_form.elements[i].checked)) {
                data += (data ? '&' : '') +
                encodeURIComponent(data_form.elements[i].name) + '=' +
                encodeURIComponent(data_form.elements[i].value);
            }
        }
    
    return data;
}
