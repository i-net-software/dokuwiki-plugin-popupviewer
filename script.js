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

		var style = "width:" + this.endWidth + 'px;';
		if (!this.isImage) {
			style += "height:" + this.endHeight + 'px;';
		}

		this.contentDiv.style.cssText = style; // Really nasty IE6 hacking!
		this.contentDiv.setAttribute('style', style);

		style = "top:" + this.endMarginTop + 'px;';

		if (!this.isRTL) {
			style += "left:" + this.endMarginLeft + 'px;';
		} else {
			style += "right:" + this.endMarginLeft + 'px;';
		}

		this.controlDiv.style.cssText = style; // Really nasty IE6 hacking!
		this.controlDiv.setAttribute('style', style);
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
			$('#popupviewer').remove()
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
						var style = 'width:' + self.endWidth + 'px; height:' + self.endHeight + 'px;';
						selfCallback.image.style.cssText = style; // Really nasty IE6 hacking!
						selfCallback.image.setAttribute('style', style);
					};

					var errorCallback = function() {
						$('#popupviewer_content').append(selfCallback.image);
						$('#popupviewer_loader_div').remove();
						self.contentDiv.className = 'dokuwiki';
						self.contentDiv.className = 'isImage';

						self.setContentSize(selfCallback.image.offsetWidth, selfCallback.image.offsetHeight);
						var style = 'width:' + self.endWidth + 'px; height:' + self.endHeight + 'px;';
						selfCallback.image.style.cssText = style; // Really
																	// nasty IE6
																	// hacking!
						selfCallback.image.setAttribute('style', style);

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

	this.errorCallback = function(ajax) {

		var id = "errorCallbackForm";
		$('#'+id).remove();

		var form = document.createElement("form");
		form.setAttribute("action", self.page);
		form.setAttribute("method", "POST");
		form.id = id;
		ajax.requestFile = self.page;
		self.wasError = true;

		document.getElementsByTagName("body")[0].appendChild(form);

		// Create Completion function
		ajax.onCompletion = function() {

			if (ajax.responseXML) {
				var dwEle = $(ajax.responseXML).find('div.dokuwiki');
				if (dwEle.length > 0) {
					ajax.response = '<div class="dokuwiki">'
							+ dwEle[0].innerHTML + "</div>";
				}
			}

            if ( typeof self.callback == "function" ) {
    			self.callback(ajax.response);
			}
			if (typeof ajax.execute == "object" && ajax.execute.srcForm) {
				$(ajax.execute.srcForm).remove();
			}
		};

		// call via proxy
		var proxy = new iframeProxy(ajax, form);
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
					if ( $('#popupviewer_control_nextImage').size() > 0 && !this.getLast() ) {
						this.dispatchClick($('popupviewer_control_nextImage'));
					}
					break;
				case 37: // Left
					if ( $('#popupviewer_control_prevoiusImage').size() > 0 && !this.getFirst() ) {
						this.dispatchClick($('#popupviewer_control_prevoiusImage'));
					}
					break;
				case 27: // Escape
					this.removeOldViewer();
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

		var ajax = new sack(url);
		ajax.AjaxFailedAlert = function() {};
		ajax.encodeURIString = true;
		ajax.onCompletion = function() {

			if ((ajax.response === "" || (typeof ajax.xmlhttp.status != "undefined" && ajax.xmlhttp.status != 200))
					&& typeof errorCallback == "function") {
				errorCallback(ajax);
				return true;
			}

			// Google Ping
			if ( typeof googleanalytics_trackLink != "undefined" ) {
				googleanalytics_trackLink(trackLink);
			}
			if ( typeof callback == "function" ) {
    			callback(ajax.response);
			}
		};

		for ( var option in options) {
			if (option === null || options[option] === null ) {
				continue;
			}
			ajax.setVar(option, options[option]);
			if ( option == 'id' ) { trackLink = "/" + options[option].replace(new RegExp(":", "g"), "/"); }
		}

		try {
			ajax.runAJAX();
		} catch (e) {
			if (typeof errorCallback != "undefined") {
				errorCallback(ajax);
			}
		}
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

var iframeProxy = function(ajax, srcForm) {

	// Setup
	var self = this;

	if ( jQuery ) {
		var $ = jQuery;
	}

	this.iframe = null;
	this.ajax = ajax;
	this.error = false;
	this.srcForm = srcForm;
	this.src = typeof this.ajax.requestFile != 'undefined' && this.ajax.requestFile !== null ? this.ajax.requestFile : this.srcForm.getAttribute('action');
	
	this.onCompletion = function(self) {

		try {
			self.ajax.responseXML = window.frames[self.iframe.id].document;
		} catch (e) {
			try {
				self.ajax.response = window.frames[self.iframe.id].document.body.innerHTML;
			} catch (ee) { /* DEAD END */
			}
		}

		self.ajax.execute = self;

		try {
			self.ajax.onCompletion();
		} catch (ee) {
			self.error = ee;
			alert(ee);
			return false;
		}

		// Clean Up
		var self2 = self;
		window.setTimeout(function() {
			if (self2.iframe) {
				$(self2.iframe).remove();
			}
		}, 500);

		return true;
	};

	if ( typeof this.src == 'undefined' ) {
		self.onCompletion(self);
		return;
	}
	
	this.name = "iframeProxy"
		+ escape(this.src.replace(new RegExp("[\\W]", "g"), "")) + "_"
		+ Math.round(Math.random() * 1000000);


	// Return on duplicate
	if ($('#'+this.name).size() > 0) {
		this.error = "iframe exists";
		return;
	}

	// Build Frame
	this.iframe = document.createElement("iframe");

	this.iframe.src = this.src;
	this.iframe.name = this.name;
	this.iframe.id = this.name;
	this.iframe.width = "0px";
	this.iframe.height = "0px";
	this.iframe.style.display = "none";
	this.iframe.frameBorder = false;

	var wrapEvent = function() {
		self.onCompletion(self);
	};

	$(this.iframe).load(wrapEvent);

	try {
		document.getElementsByTagName("body")[0].appendChild(this.iframe);
		this.srcForm.target = this.name;
		this.srcForm.onsubmit = function() {
		};

		$(this.iframe).load(wrapEvent);
		// Stupid Event Creation in Iframes
		if (this.iframe.addEventListener) {
			this.iframe.addEventListener('load', wrapEvent, false);
		} else if (this.iframe.attachEvent) {
			this.iframe.attachEvent('onload', wrapEvent);
		} else {
			this.srcForm.submit();
		}

	} catch (e) { /* DEAD END */
		this.error = e;
		alert("Dead End: " + e);
	}
};