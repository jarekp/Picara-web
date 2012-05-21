/*
 JavaScript needed to get Gramene::Page Suckerfish-based 
 navbar menus to work.
*/
sfHover = function() {
  var sfEls = document.getElementById("gnav").getElementsByTagName("LI");
  for (var i=0; i<sfEls.length; i++) {
    sfEls[i].onmouseover=function() {
      //hack IE select box over drop-down navbar 
      sel = document.getElementsByTagName("select");
      for (var i=0; i<sel.length; i++) {
        sel[i].style.visibility = 'hidden';
      }
      this.className+=" sfhover";
    }
    sfEls[i].onmouseout=function() {
      sel = document.getElementsByTagName("select");
      for (var i=0; i<sel.length; i++) {
        sel[i].style.visibility = 'visible';
      }
      this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
    }
    sfEls[i].onclick=function() {
      this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
    }
    //sfEls[i].style.width = '1px'; IE 7 will not work well
  }
}

if (document.all) { //MS IE 
  if (window.attachEvent)  window.attachEvent("onload", sfHover);
  else { //IE 5.2 Mac does not  support attachEvent 
    var old = window.onload; 
    window.onload = function() { if (old) old(); sfHover(); }
  } 
}





function set_cookie(cookie, value, expires) {
	document.cookie = cookie +'=' + value + ';path=/;expires=' + expires.toGMTString();
}
	


function read_cookie(cookie_name) {
	var cookie = document.cookie;
	var pairs = cookie.split('; ');
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=');
		if (pair[0] == cookie_name) {
			return pair[1];
		}
	}
	return '';
}


				
//sticky cookies

function getStyleClass (className) {

    var classRegex             = new RegExp('[#.]' + className);

    for (var s = 0; s < document.styleSheets.length; s++) {

        if (document.styleSheets[s].rules) {
            for (var r = 0; r < document.styleSheets[s].rules.length; r++) {
                if
(classRegex.exec(document.styleSheets[s].rules[r].selectorText)) {
                    return document.styleSheets[s].rules[r];
                }
            }
        }
        else if(document.styleSheets[s].cssRules) {
            for (var r = 0; r < document.styleSheets[s].cssRules.length; r++) {
                if
(classRegex.exec(document.styleSheets[s].cssRules[r].selectorText)) {
                    return document.styleSheets[s].cssRules[r];
                }
            }
        }
    }
    
    return null;
}

function findCSSClass (className, tagName) {

	if (tagName == null) { tagName = ''; };

	var classRegex = new RegExp('^.' + className + '$');
	var elementRegex = new RegExp('^' + tagName.toLowerCase() + '.' + className + '$');

	var output = '';

	for (var s = 0; s < document.styleSheets.length; s++) {

		if (document.styleSheets[s].rules) {
			for (var r = 0; r < document.styleSheets[s].rules.length; r++) {
				if (classRegex.exec(document.styleSheets[s].rules[r].selectorText)
					|| elementRegex.exec(document.styleSheets[s].rules[r].selectorText)) {
					return document.styleSheets[s].rules[r];
				}
			}
		}
		else if(document.styleSheets[s].cssRules) {
			for (var r = 0; r < document.styleSheets[s].cssRules.length; r++) {
				if (classRegex.exec(document.styleSheets[s].cssRules[r].selectorText)
					|| elementRegex.exec(document.styleSheets[s].cssRules[r].selectorText)) {
					return document.styleSheets[s].cssRules[r];
				}
			}
		}
	}
	
	return output;
}

// tooltips

function toggle_tooltip (button, image, tip) {

    button.src = image;
    
    if (tip) {
        if (button.getAttribute('over') == 1) {
            button.setAttribute('over', 0);
            tip.style.display = 'none';
        }
        else {
            button.setAttribute('over', 1);
            var offsets = getPosition(button);

            tip.style.left  = offsets[0];
            tip.style.top   = offsets[1] + button.height + 5;
        
            tip.style.display = 'block';
        }
        
    }
    
//  e.cancelBubble = true;
}

