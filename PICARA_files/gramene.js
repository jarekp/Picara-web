document.addEventListener('DOMContentLoaded', prep_footer_images, false);
	if (window.attachEvent) {
		window.attachEvent('onload', prep_footer_images);
	}
	
	function prep_footer_images () {
		var images = document.getElementsByTagName('img');

		for (var i = 0; i < images.length; i++) {
			var img = images[i];
			var img_class = img.getAttribute('class');

			if (img_class != null && img_class.search(/\bleft_footer\b/) >= 0) {
				img.addEventListener('mouseover', function() { footer_img(this, 'left') }, false);
				img.addEventListener('mouseout',  function() { footer_out() }, false);
			}
			
			if (img_class != null && img_class.search(/\bright_footer\b/) >= 0) {
				img.addEventListener('mouseover', function() { footer_img(this, 'right') }, false);
				img.addEventListener('mouseout',  function() { footer_out() }, false);
			}
		}
	}

	function footer_img(img, alignment) {
		var footer_popup = document.getElementById('footer_popup');
		footer_popup.innerHTML = img.getAttribute('alt');
		popup(img, 'footer_popup', true);
	}
	
	function footer_out() {
		//document.getElementById('footer_display').innerHTML = '';
		popdown(document.getElementById('footer_popup'));
	}
	
	function popup (target, menu_id, useArrow) {
		var menu = document.getElementById(menu_id);
		var arrow = document.getElementById('arrow');
		var footer = document.getElementById('footer');
		if (menu.style.display == 'none' || menu.style.display == null || menu.style.display == '') {
			var position = getPosition(target);
			var footer_position = getPosition(footer);

			menu.style.right = null;
			menu.style.left = '-999px';
			menu.style.display = 'block';
			if (useArrow) {
				arrow.style.display = 'block';
			}
			var positionX = position[0];

			if (positionX + menu.offsetWidth >= document.body.offsetWidth) {
				menu.style.left = null;
				menu.style.right = '5px';
			}
			else {
				var targetClass = target.getAttribute('class');
				if (targetClass == 'right_footer') {
					//sigh. Magic numbers. The footer_display div has a margin of 2 pixels.
					positionX -= 2;
				}
			
				menu.style.left = positionX + 'px';
				
			}
			
			//2 is a magic number - width of the footer border
			var arrowHeight = useArrow ? arrow.offsetHeight : 0;
			menu.style.top = (footer_position[1] - menu.offsetHeight - arrowHeight + 1) + 'px';

			if (arrowHeight) {
				arrow.style.top = (footer_position[1] - arrow.offsetHeight) + 'px';
				arrow.style.left = positionX + target.offsetWidth / 2 + 'px';
			}
		}
		else {
			menu.style.display = 'none';
			arrow.style.display = 'none';
		}
	}
	
	function popdown (menu) {
		menu.style.display = 'none';
		document.getElementById('arrow').style.display = 'none';
	}


	function getPosition(theElement) { 
		var positionX = 0; 
		var positionY = 0; 

		while (theElement != null) { 
			positionX += theElement.offsetLeft; 
			positionY += theElement.offsetTop; 
	
			theElement = theElement.offsetParent; 
		} 

		positionX += window.pageXOffset;
		positionY += window.pageYOffset;

		return [positionX, positionY]; 
	}
	
	function openURL(e, url) {
		e.cancelBubble = true;
	    if (e.metaKey) {
        	open(url);
		}
		else {
			location.href = url;
		}
	}
