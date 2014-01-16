var popupviewer = function(showContent, isImage, width, height) {

	if ( jQuery ) {
		var $ = jQuery;
	}

	this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	this.screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	this.contentDiv = null;
	this.controlDiv = null;
	this.maxWidthFactor = 0.7;
	this.maxHeightFactor = 0.8;
	this.maxWidth = null;
	this.maxHeight = null;
	this.endWidth = 0;
	this.endHeight = 0;
	this.endMarginTop = 0;
	this.endMarginLeft = 0;
	this.isImage = false;
	this.additionalContent = null;
	this.additionalContentID = null;
	this.page = null;
	this.event = null;
	this.wasError = false;
	this.popupImageStack = null;

	this.showContent = null;
	this.isRTL = false;
	
	var self = this;

	this.getFirst = function() { /* To be implemented */
		if (!this.popupImageStack) {
			return false;
		}
		return this.popupImageStack[0].id == this.page;
	};

	this.getLast = function() { /* To be implemented */
		if (!this.popupImageStack) {
			return false;
		}
		return this.popupImageStack[this.popupImageStack.length - 1].id == this.page;
	};

	this.skipToImage = function(itemNr) {

		var previous = null;
		var elem = null;
		for ( var item in this.popupImageStack) {

			if ( !this.popupImageStack.hasOwnProperty(item) )
			{
				continue;
			}

			var check = this.popupImageStack[item];
			
			// previous was inpoint
			if (previous && previous.id == this.page) {
				elem = check;
				break;
			}

			// Found + must go
			if (check.id == this.page && itemNr < 0) {
				elem = previous;
				break;
			}

			previous = check;
			elem = check;
		}

		if (elem) {
			this.dispatchClick(elem);
		}
	};
	
	this.dispatchClick = function(elem) {
		if (elem == null) {
			return;
		}
		
		$(elem).trigger('click');
	};

	this.setContentSize = function(width, height, offsetHeight, offsetElement) {

		if (!this.contentDiv || !this.controlDiv) {
			return;
		}

		if (!width || width === 0) {
			width = this.screenWidth * this.maxWidthFactor;
		}

		if (!height || height === 0) {
			height = this.screenHeight * this.maxHeightFactor;
		}

		// If given, we want the optimal size
		if ( offsetElement )
		{
    		try {
        		// IE8 has isues
        		offsetElement.style.display = 'fixed';
    		} catch(e) {}

    		offsetElement.style.visibility = 'hidden';
    		offsetElement.style.width = '';
    		offsetElement.style.height = '';
    		
    		height = offsetElement.offsetHeight;
    		width = offsetElement.offsetWidth;

    		try {
        		// IE8 has isues
        		offsetElement.style.display = '';
    		} catch(e) {}
    		offsetElement.style.visibility = '';
		}

		width = parseFloat(width);
		height = parseFloat(height);
		offsetHeight = typeof offsetHeight == "undefined" || isNaN(parseFloat(offsetHeight)) ? 0 : parseFloat(offsetHeight); // may be undefined
		var ratio = width / height;

		height += offsetHeight;

		if (height > (this.screenHeight * 0.99) - 60) {
			height = (this.screenHeight * 0.99) - 60;

			if (this.isImage) { // If this is an image we will have to fix the size
				width = (height - offsetHeight) * ratio;
			} else {
				width += 20; // For the scroller Bar that will apear;
			}
		}

		if (width > (this.screenWidth * 0.99) - 40) {
			width = (this.screenWidth * 0.99) - 40;

			if (this.isImage) { // If Image is defined then we will have to fix it
				height = (width / ratio) + offsetHeight;
			}
		}

		this.endWidth = width + (this.isImage ? 0 : 24); // 24 Px for padding + Border if is Image
		this.endHeight = height;

		var xOffset = document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0;
		var yOffset = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0;

		this.endMarginTop = (this.screenHeight - height) * 0.5 + yOffset;
		if (this.endMarginTop < 5) {
			this.endMarginTop = 5;
		}

		this.endMarginLeft = (this.screenWidth - width) * 0.5 + xOffset;
		this.setSize();
		if ( !$('#popupviewer_loader_div').size() > 0 ) this.addNextAndPrevious();
	};

	this.setSize = function() {

		$(this.contentDiv).css({
			'width' : this.endWidth + 'px',
			'height' : !this.isImage ? this.endHeight + 'px' : 'auto'
		});

		$(this.controlDiv).css({
			'top'   : this.endMarginTop + 'px',
			'left'  : self.isRTL ? this.endMarginLeft + 'px' : 'auto',
			'right' : !self.isRTL ? this.endMarginLeft + 'px' : 'auto'
		});
	};

	this.addNextAndPrevious = function() {

		// If not already defined, do so now
		if (!this.popupImageStack) {
			this.popupImageStack = $(document).find('img.popupimage');
		}

		if (this.popupImageStack && this.popupImageStack.length > 1) {

			var previousImage = document.createElement('a');
			previousImage.id = 'popupviewer_control_prevoiusImage';

			var nextImage = document.createElement('a');
			nextImage.id = 'popupviewer_control_nextImage';

			var self = this;
			var skipEvent = function(event) { /* To be implemented */

				if (!event) {
					var event = window.event;
				}

				var target = ((event.target) ? event.target : event.srcElement).id.indexOf("next") > 0 ? 1 : -1;
				self.skipToImage(target);
			};

			// If this is not the last image - set inactive
			if (!this.getLast()) {
				$(nextImage).click(skipEvent);
			} else {
				nextImage.className = "inactive";
			}

			// If this is not the first image - set inactive
			if (!this.getFirst()) {
				$(previousImage).click(skipEvent);
			} else {
				previousImage.className = "inactive";
			}

			if ( $('#'+nextImage.id).size() > 0 ) { $('#'+nextImage.id).remove(); }
			if ( $('#'+previousImage.id).size() > 0 ) { $('#'+previousImage.id).remove(); }
			
			this.controlDiv.appendChild(nextImage);
			this.controlDiv.appendChild(previousImage);
		}
	};

	this.getIntValue = function(value) {
		return parseInt(value.substr(0, value.indexOf('px')), 10);
	};

	this.buildViewerWithLoader = function() {

		this.removeOldViewer();
		this.contentDiv = document.createElement('div');
		this.contentDiv.id = 'popupviewer_content';
		this.contentDiv.className = 'isImage';

		this.controlDiv = document.createElement('div');
		this.controlDiv.id = 'popupviewer_control';

		this.controlDiv.appendChild(this.contentDiv);

		var loaderDiv = document.createElement('div');
		loaderDiv.id = 'popupviewer_loader_div';

		this.contentDiv.appendChild(loaderDiv);

		var closeImage = document.createElement('a');
		closeImage.id = 'popupviewer_control_closeImage';

		this.controlDiv.appendChild(closeImage);

		var sampleDiv = document.createElement('div');
		sampleDiv.id = 'popupviewer';

		var overlayDiv = document.createElement('div');
		overlayDiv.id = 'popupviewer_overlay';

		var arVersion = navigator.appVersion.split("MSIE");
		var version = parseFloat(arVersion[1]);
		if (!(version >= 5.0 && version < 7.0)) {
			overlayDiv.style.position = 'fixed';
		} else {
			overlayDiv.style.height = (document.body.offsetHeight -1 ) + 'px';
			overlayDiv.style.width = (document.body.offsetWidth -1 ) + 'px';
		}

		sampleDiv.appendChild(overlayDiv);

		/* IE 6 Crasher */
		sampleDiv.appendChild(this.controlDiv);

		$(overlayDiv).click(self.removeOldViewer);
		$(closeImage).click(self.removeOldViewer);
		$(document).bind('keydown', self.globalEvent);

		// window.scrollTo(0, 0);
		document.getElementsByTagName('body')[0].style.overflow = 'hidden';
		document.getElementsByTagName('body')[0].appendChild(sampleDiv);

		this.setContentSize(210, 20);
	};

	this.removeOldViewer = function()
	{
		if ($('#popupviewer').size() > 0) {
			$('#popupviewer').remove();
			$(document).unbind('keydown', self.globalEvent);
		}
		document.getElementsByTagName('body')[0].style.overflow = 'auto';
	};

	this.displayContent = function(showContent, isImage, width, height) {

		this.isImage = isImage;

		if (!$('#popupviewer').size() > 0) {
			this.buildViewerWithLoader();
		}
		if (!showContent || showContent === null) {
			if (typeof (showContent) != 'undefined') {
				this.setContentSize(width, height);
			}
			return this;
		}

		if (isImage) {

			var img = new Image();
			img.src = showContent;
			img.className = "imageContent";

			if (this.event) {
				var elem = (this.event.target) ? this.event.target : this.event.srcElement;
				this.page = elem.id;
			}

			var check = new checkImageRoutine(img);
			var self = this;
			var callback = {

				image : img,
				error : function() {
					self.removeOldViewer();
				},
				finalize : function() {

					// var height = this.image.height;
					var selfCallback = this;

					// self.setContentSize(this.image.width, height, true);
					var callback = function(response) {

						var container = document.createElement('div');
						container.className = 'additionalContent dokuwiki';
						container.innerHTML = response;

						$('#popupviewer_loader_div').remove();
						$('#popupviewer_content').append(selfCallback.image);
						self.contentDiv.className = 'dokuwiki';
						self.contentDiv.className = 'isImage';
						$('#popupviewer_content').append(container);

						self.setContentSize(selfCallback.image.offsetWidth,selfCallback.image.offsetHeight,container.offsetHeight);
						$(selfCallback.image).css({
							'width':self.endWidth + 'px',
							'height':self.endHeight + 'px',
						})
					};

					var errorCallback = function() {
						$('#popupviewer_loader_div').remove();
						$('#popupviewer_content').append(selfCallback.image);
						self.contentDiv.className = 'dokuwiki';
						self.contentDiv.className = 'isImage';

						self.setContentSize(selfCallback.image.offsetWidth, selfCallback.image.offsetHeight);
						$(selfCallback.image).css({
							'width':self.endWidth + 'px',
							'height':self.endHeight + 'px',
						})

					};

					if (self.additionalContent) {
						callback(self.additionalContent);
					} else {
						self.runAJAX(callback, {
							'call' : '_popup_load_image_meta',
							'id' : self.additionalContentID
						}, errorCallback);
					}

				}
			};

			check.checkLoadImage(50, callback);
		} else {
			this.contentDiv.className = 'dokuwiki';
			this.contentDiv.innerHTML = showContent;
			this.setContentSize(width, height, null, this.contentDiv);
		}
	};

	this.linkReplacer = function(matches, depth) {

		var schema = matches[1];
		var urlpart = matches[2];

		if (urlpart.match(/^#(.*?)$/)) {
			// ScrollToDiv
			urlpart += "\" onclick=\"if(!event){var event=window.event;}if(event){event.cancelBubble=true;event.returnValue=false;}if(event&&event.stopPropagation){event.stopPropagation();}if(event&&event.preventDefault){event.preventDefault();}jQuery('#popupviewer_content').scrollTop=jQuery('#"
					+ ((urlpart == "#") ? "popupviewer_content" : urlpart
							.substr(1)) + "').offsetTop;return false;";
		} else if (!urlpart.match(new RegExp("^(https?:\/\/|mailto:|"
				+ escape(DOKU_BASE) + ")"))) {
			urlpart = depth + urlpart;
		}

		return schema + '="' + urlpart + '"';
	};

	this.callback = function(data) {

		/* Reset Init Events */
		window.oninit = function() {
		};

		/* check for script to be executed */
		var script = "";
		if (typeof data == "string" && data !== '') {
			data = data.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,
					function() {
						if (data !== null) {
							script += arguments[1].replace(new RegExp("(<!--\/\/--><!\\[CDATA\\[\/\/><!--|\/\/--><!\\]\\]>)", "gi"), "") + '\n';
						}
						return '';
					});

		}
	
		try {
			data = self.preg_replace_callback( '/(href|src|action)="([^"]*)"/ig', self.linkReplacer, data);
			self.displayContent(data, false, self.endWidth, self.endHeight);
		} catch (e) {
			alert(e);
			return self.removeOldViewer();
		}
		try {
			eval(script + "window.oninit();");
		} catch (scriptE) {
			alert("A script error occurred in PopUpViewer. This problem may not be as problematic and the site will run fine. But please get in contact with the sites owner and tell them what you did.\n\n" + scriptE);
		}
	};

	// lets try iframe on an error
	// This relies on the postMessage function of newer browsers
	// and needs: if ( typeof parent != 'undefined' && parent.postMessage) {
	// parent.postMessage(document.body.scrollHeight, '*'); }
	// on the onload function of the loaded pages body.
	this.errorCallback = function(successaction) {

		// Build Frame
		var iframe = document.createElement("iframe");
		iframe.id = "__contentIFrame";
		iframe.name = "__contentIFrame";
		iframe.setAttribute('scrolling', 'no');
		iframe.style.display = "none";

		var finished = false;
		var messageFunction = function(event) {

			finished = true;
			var data = event.data || event.originalEvent.data;
			// If this message does not come with what we want, discard it.
			if ((typeof data).toLowerCase() == "string" || !data.message
					|| data.message != 'frameContent') {
				alert("Could not load page via popupviewer. The page responded with a wrong message.");
				return;
			}
			
			successaction(data.body);

			$(iframe).remove();

			// Clear the window Event after we are done!
			$(window).unbind("message", messageFunction);
		};

		// load event for the iframe to display the content
		$(iframe).bind('load', function() {

			// Check If we can send a postMessage
			if (iframe.contentWindow.postMessage) {

				// Register the Message Event for PostMessage receival
				$(window).bind("message", messageFunction);

				// Send a message
				var message = "getFrameContent";
				iframe.contentWindow.postMessage(message, "*");
			}
		});

		window.setTimeout(function() {
			if (!finished) {
				$(iframe).remove();
				alert("Could not load page via popupviewer. The page is not available.");
			}
		}, 30000);

		iframe.src = self.page;
		document.getElementsByTagName('body')[0].appendChild(iframe);
	};

	this.loadAndDisplayPage = function(page, width, height, id, params) {

		if (this.event) {
			var elem = (this.event.target) ? this.event.target : this.event.srcElement;
			this.page = elem.href == page ? elem.getAttribute('href') : "";
		}

		this.endWidth = width;
		this.endHeight = height;

		var self = this;

		// Set custom params
		if ( (typeof params).toLowerCase() != "object" ) { params = {}; }
		if ( !params.call ) { params.call = '_popup_load_file'; }
		if ( !params.id ) { params.id = id; }
		this.runAJAX(self.callback, params, self.errorCallback);
	};
	
	this.globalEvent = function(e) {
		
		e = e||window.event;
		
		if ( e.keyCode ) {
			switch( e.keyCode ) {
				case 39: // Right
					if ( $('#popupviewer_control_nextImage').size() > 0 && !self.getLast() ) {
						self.dispatchClick($('popupviewer_control_nextImage'));
					}
					break;
				case 37: // Left
					if ( $('#popupviewer_control_prevoiusImage').size() > 0 && !self.getFirst() ) {
						self.dispatchClick($('#popupviewer_control_prevoiusImage'));
					}
					break;
				case 27: // Escape
					self.removeOldViewer();
					break;
			}
		}
		return;
	};

	this.runAJAX = function(callback, options, errorCallback, url) {

		var trackLink = url;
		if (typeof url == "undefined") {
			url = DOKU_BASE + 'lib/exe/ajax.php';
		}

		var success = function (data) {
			
			// Google Ping
			if ( typeof googleanalytics_trackLink != "undefined" ) {
				googleanalytics_trackLink(trackLink);
			}
			if ( typeof callback == "function" ) {
    			callback(data);
			}
		};

		$('#popupviewer_content').load(url, options, function( response, status, xhr ) {
		
			if ( status == "error" ) {
				// Retry
				errorCallback(success);
			} else {
				success(response);
			}
		
		});

	};

	this.preg_replace_callback = function(pattern, callback, subject, limit) {
		// Perform a regular expression search and replace using a callback
		// 
		// discuss at: http://geekfg.net/
		// + original by: Francois-Guillaume Ribreau (http://fgribreau)
		// * example 1:
		// preg_replace_callback("/(\\@[^\\s,\\.]*)/ig",function(matches){return
		// matches[0].toLowerCase();},'#FollowFriday @FGRibreau @GeekFG',1);
		// * returns 1: "#FollowFriday @fgribreau @GeekFG"
		// * example 2:
		// preg_replace_callback("/(\\@[^\\s,\\.]*)/ig",function(matches){return
		// matches[0].toLowerCase();},'#FollowFriday @FGRibreau @GeekFG');
		// * returns 2: "#FollowFriday @fgribreau @geekfg"

		limit = !limit ? -1 : limit;

		var _check = pattern.substr(0, 1), _flag = pattern.substr(pattern
				.lastIndexOf(_check) + 1), _pattern = pattern.substr(1, pattern
				.lastIndexOf(_check) - 1), reg = new RegExp(_pattern, _flag), rs = null, res = [], x = 0, list = [], depth = "", ret = subject;

		String.prototype.repeat = function(num) {
			return new Array(num + 1).join(this);
		};

		// This may generate urls like "../test/../test"
		if ( !this.page ) { this.page = ""; }
		depth = this.page.substr(0, this.page.lastIndexOf("/") + 1);

		if (limit === -1) {
			var tmp = [];

			do {
				tmp = reg.exec(subject);
				if (tmp !== null) {
					res.push(tmp);
				}
			} while (tmp !== null && _flag.indexOf('g') !== -1);
		} else {
			res.push(reg.exec(subject));
		}

		for (x = res.length - 1; x > -1; x--) {// explore match
			if (!list[res[x][0]]) {
				ret = ret.replace(new RegExp(res[x][0], "g"), callback(res[x],
						depth));
				list[res[x][0]] = true;
			}
		}
		return ret;
	};

	this.init = function(event) {
		if (!event) {
			var event = window.event;
		}
		if (event) {
			event.cancelBubble = true;
			event.returnValue = false;
			if (event.stopPropagation) {
				event.stopPropagation();
			}
			if (event.preventDefault) {
				event.preventDefault();
			}
		}
		this.event = event;
	};

	this.removeOldViewer();
	this.displayContent(showContent, isImage, width, height);
};

(function($){
	$(window).bind("message", function(event){
		
		var data = event.data || event.originalEvent.data;
		var source = event.source || event.originalEvent.source;
		if (data != "getFrameContent") {
			return;
		}

		try {
			source.postMessage({
				message : "frameContent",
				body : jQuery('html').html()
			}, "*");
		} catch (e) {
			alert("Fatal Exception! Could not load page via popupviewer.\n" + e);
		}
	});
})(jQuery);

var checkImageRoutine = function(inputImage) {

	this.image = null;
	this.counter = 500;
	this.isFinished = false;

	this.checkImages = function() {

		var isOK = this.isImageOk();
		if (!isOK && this.counter > 0) {
			this.counter--;
			return false;
		}

		if (isOK) {
			this.isFinished = true;
		}
		return true;
	};

	this.isImageOk = function(img) {

		if (this.isFinished) {
			return true;
		}

		if (!img) {
			img = this.image;
		}
		// During the onload event, IE correctly identifies any images
		// that weren't downloaded as not complete. Others should too.
		// Gecko-based browsers act like NS4 in that they imageflow this
		// incorrectly: they always return true.
		if (!img.complete) {
			return false;
		}

		// However, they do have two very useful properties: naturalWidth
		// and naturalHeight. These give the true size of the image. If
		// it failed to load, either of these should be zero.
		if (typeof img.naturalWidth != "undefined" && img.naturalWidth === 0) {
			return false;
		}

		// No other way of checking: assume it's ok.
		return true;
	};

	this.checkLoadImage = function(count, callback) {

		if (!count || count === 0) {
			if (callback && callback.error) {
				callback.error();
			}
			return false;
		}
		if (!this.isImageOk()) {
			var self = this;
			setTimeout(function() {
				self.checkLoadImage(count - 1, callback);
			}, 100);
			return;
		}

		if (callback && callback.finalize) {
			callback.finalize();
		}
		return true;
	};

	this.finish = function() {
		this.counter = 0;
	};

	this.image = inputImage;
	this.image.onload = this.finish;
	this.image.onabord = this.finish;
};