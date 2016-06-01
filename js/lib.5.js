/* =================================================================================================
 * AUVERCLOUD JAVASCRIPT AND JQUERY UTILITIES
 * Useful AuverCloud Runtime Client and jQuery extensions
 *
 * Version: 4.0
 *
 * Copyright 2014, 2015 Guillaume DORBES
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ================================================================================================= */

/* ---------------------------------------------------------------------------------
 * Function: extendJquery
 * Purpose:	Useful jQuery methods
 * Parameter(s): N/A
 * Return: N/A
 */
function extendJquery() {

	/* ---------------------------------------------------------------------------------
	 * JQ method: audioAppend
	 * Purpose:	Append a new Audio object defined by params
	 * Parameter(s): See details in code below
	 * Return: this
	 */
	$.fn.audioAppend = function(options) {

		// New Audio default settings
		var settings = $.extend({
			id : "my-audio",
			path : "",
			type : ["mp3", "ogg", "m4a"],
			preload : true,
			autoplay : false,
			controls : false,
			name : "sound"
		}, options);
		var preload = (settings.preload) ? " preload='auto' " : " preload='none' ";
		var autoplay = (settings.autoplay) ? " autoplay " : "";
		var controls = (settings.controls) ? " controls " : " style='width:0;height:0' ";
		var html = "<audio id='" + settings.id + "'" + preload + autoplay + controls + ">";
		settings.type.forEach(function(ext) {
			html = html + "<source src='" + settings.path + settings.name + "." + ext + "' type='audio/" + ext + "'>";
		});
		html = html + "</audio>";
		$(this).append(html);
		if (arc.DEBUG)
			console.log("- New media =", settings.name);
		return this;
	};

	/* ---------------------------------------------------------------------------------
	 * JQ method: audioPlay
	 * Purpose:	Play an <audio>
	 * Parameter(s): N/A
	 * Return: this
	 */
	$.fn.audioPlay = function() {

		// No audio on touch screen
		if (arc.touchable())
			return;

		// Play sound
		var audio = $(this)[0];
		audio.pause();
		audio.load();
		audio.play();
		return this;
	};

	/* ---------------------------------------------------------------------------------
	 * JQ method: wink and winkColor
	 * Purpose: Display an HTML content or color for a defined time, then reset the display
	 * Parameter(s)	- html = HTML content
	 * 				- params = time and color. See below
	 * Return: this
	 */

	$.fn.wink = function(html, params) {
		// Default parameters
		params = $.extend({}, {
			color : "#0a0",
			time : 3000
		}, params);

		// Save current content
		var THIS = $(this);
		var save = THIS.html();

		// Display msg with appropriate color
		THIS.html("<span style='color:" + params.color + "'>" + html + "</span>");

		// restore initial content after fade out
		$(this).children("span").fadeOut(params.time, function() {
			THIS.html(save);
		});

		return this;
	};

	$.fn.winkColor = function(params) {
		// Default parameters
		params = $.extend({}, {
			color : "#0a0",
			time : 1000,
			restoreColor : false
		}, params);

		// Save restore color
		var THIS = $(this);
		if (!params.restoreColor)
			params.restoreColor = THIS.css("color");

		// Change color
		THIS.css("color", params.color);

		// restore initial color after fade out
		setTimeout(function() {
			THIS.css("color", params.restoreColor);
		}, params.time);

		return this;
	};

	/* ---------------------------------------------------------------------------------
	 * JQ method: linkScroll
	 * Purpose: Enable smooth scroll for internal link, taking care of fixed header height
	 * Parameter(s): - offset: Optional. Additional offset.
	 */
	$.fn.linkScroll = function(vOffset) {
		if (!vOffset)
			vOffset = 0;
		// Apply to multiple DOM elements
		$(this).each(function() {

			// Get the link
			var ref = $(this).attr("href");

			// Create click event
			$(this).unbind("click").click(function() {

				if (ref.substr(0, 1) != "#")
					// Load a page if not internal link
					window.location.href = ref;
				else
					// Otherwise smooth scrool initiated by click
					$('html, body').animate({
						scrollTop : $(ref).offset().top + vOffset
					}, 500);
			});
		});
	};
}

/* ---------------------------------------------------------------------------------
 * Function: extendAuverloud
 * Purpose:	Useful AuverCloud Runtime Client extensions
 * Parameter(s): N/A
 * Return: N/A
 */
function extendAuverCloud() {

	/* ---------------------------------------------------------------------------------
	 * Function: arc.removExt
	 * Purpose: Remove extension from a filename
	 * Parameter(s): s = string
	 * Return: 	result
	 */
	arc.removExt = function(s) {
		var r = s.split(".");
		r.pop();
		return r.join("");
	},

	/* ---------------------------------------------------------------------------------
	 * Function: arc.strClean
	 * Purpose: Clean string of accented and special chars
	 * Parameter(s): s = string
	 * Return: 	result
	 */
	arc.strClean = function(s) {
		var r = s.toLowerCase();
		r = r.replace(new RegExp("\\s", 'g'), "");
		r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
		r = r.replace(new RegExp("æ", 'g'), "ae");
		r = r.replace(new RegExp("ç", 'g'), "c");
		r = r.replace(new RegExp("[èéêë]", 'g'), "e");
		r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
		r = r.replace(new RegExp("ñ", 'g'), "n");
		r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
		r = r.replace(new RegExp("œ", 'g'), "oe");
		r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
		r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
		r = r.replace(new RegExp("\\W", 'g'), "");
		return r.replace(/[\|&%#§$£;\$%@".<>!:\ \[\]\)\)\)\)\)-)_+,-]/g, "");
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.param
	 * Purpose:	Return an associative array of the current url parameters
	 * Parameter(s):  N/A
	 * Return : Associative array of name/value
	 */
	arc.param = function() {
		var params = window.location.search.substr(1).split("&");
		var res = {};

		if (params[0])
			for (var i = 0; i < params.length; i++) {
				var param = params[i].split("=");
				res[param[0]] = param[1];
			}

		if (arc.DEBUG)
			console.log("- URL parameters =", res);
		return res;
	},

	/* ---------------------------------------------------------------------------------
	 * Function: arc.size
	 * Purpose:	Apply a function immediately and on resizing events
	 * Parameter(s): fn = Function
	 * Return: true / false
	 */
	arc.size = function(fn) {
		if ( typeof fn == "function") {
			fn();
			$(window).resize(fn);
			$(window).on("orientationchange", fn);
			return true;
		} else
			return false;
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.touchable
	 * Purpose:	Return true if touch screen
	 * Parameter(s):  N/A
	 * Return : true/false
	 */
	arc.touchable = function() {
		os = arc.device.os();
		if (os == "wphone" || os == "ios" || os == "android")
			return true;
		else
			return false;
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.getTime
	 * Purpose: Return a string with current date/time depending on parameters
	 * Parameter(s): options, see code below
	 * Return: 	result
	 */
	arc.getTime = function(options) {

		// Default settings
		var settings = $.extend({
			// Time
			time : new Date(),
			// Format
			format : "all"
		}, options);

		var thisDate = settings.time.getFullYear() + '-' + arc.fillInt(settings.time.getMonth() + 1, 2) + '-' + arc.fillInt(settings.time.getDate(), 2);
		var thisTime = arc.fillInt(settings.time.getHours(), 2) + ':' + arc.fillInt(settings.time.getMinutes(), 2) + ':' + arc.fillInt(settings.time.getSeconds(), 2);
		switch(settings.format) {
		case "date":
			return thisDate;
		case "time":
			return thisTime;
		default:
			return thisDate + " " + thisTime;
		}
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.fillInt
	 * Purpose: Convert integer to a string defined by a minimal length and a filler string
	 * Parameter(s):- i = integer
	 * 				- l = length
	 * 				- str = filler string. Optional: default = "0"
	 * Return: 	result
	 */
	arc.fillInt = function(i, l, str) {
		str = str || "0";
		var res = i.toString();
		var delta = l - res.length;
		while (delta > 0) {
			res = str + res;
			delta--;
		}
		return res;
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.urlDecode
	 * Purpose: Decode string urlendcoded
	 * Return: 	result
	 */
	arc.urlDecode = function(str) {
		return decodeURIComponent((str + '').replace(/\+/g, '%20'));
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.insertHTML
	 * Purpose: Equivalent to document.execCommand("insertHTML", false, str) but works with IE
	 */
	arc.insertHTML = function(str) {
		if (arc.device.browser() != "msie")
			document.execCommand("insertHTML", false, str);
		else {
			// IE <= 10
			if (document.selection) {
				var range = document.selection.createRange();
				range.pasteHTML(str);

				// IE 11 && Firefox, Opera .....
			} else if (document.getSelection) {
				var range = document.getSelection().getRangeAt(0);
				var nnode = document.createElement("b");
				range.surroundContents(nnode);
				nnode.innerHTML = str;
			}
		}
	};

	/* ---------------------------------------------------------------------------------
	 * Function: arc.delayed
	 * Purpose: If not forced (see parameters), apply a timer
	 * 			before triggering a function
	 * Parameter(s): 	- callback = function to trigger if forced or timer OK
	 * 					- force = true/false. Optional.
	 * Return: 	N/A
	 */
	arc.delayed = function(callback, force) {

		var timer = 5000;
		var now = new Date().getTime();

		// Force callback if required
		if (force) {
			// Stop timeout if any
			window.clearTimeout(arc.timeOut);
			// Reset snap timer
			arc.snapTime = now;
			// Apply call back
			callback();
			return;
		}

		// Apply callback if long time
		if ((now - arc.snapTime) > timer) {
			// Stop timeout if any
			window.clearTimeout(arc.timeOut);
			// Reset snap timer
			arc.snapTime = now;
			// Set timeout to apply callback lather if no further event
			arc.timeOut = setTimeout(callback, timer);
			callback();
			return;
		}
	};
	
	// Init snap time
	arc.snapTime = new Date().getTime();

	/* ---------------------------------------------------------------------------------
	 * Function: arc.localizeByID
	 * Purpose: Apply some language based messages to DOM elements
	 * 			Used by social bar to apply the right messages and tooltips
	 * Parameters:	- lang = Language e.g. "en", "fr"...
	 * 				- msg  = Associative array of messages {{id:{lang1:msg, lang2:msg2,..,prop:propValue}}, ...}
	 * 						 where propValue can be "html, "title" or "value"
	 * Return : N/A
	 */
	arc.localizeById = function(lang, msg) {
		for (var id in msg) {
			if (!msg.hasOwnProperty(id))
				continue;
			else {
				switch(msg[id].prop) {
				case "html":
					$("#" + id).html(msg[id][lang]);
					break;
				case "title":
					$("#" + id).attr("title", msg[id][lang]);
					break;
				case "placeholder":
					$("#" + id).attr("placeholder", msg[id][lang]);
					break;
				case "value":
					$("#" + id).val(msg[id][lang]);
					break;
				case "class-html":
					$("." + id).html(msg[id][lang]);
					break;
				case "class-append":
					$("." + id).append(msg[id][lang]);
					break;
				case "class-title":
					$("." + id).attr("title", msg[id][lang]);
					break;
				case "class-placeholder":
					$("." + id).attr("placeholder", msg[id][lang]);
					break;
				case"meta-definition":
					$('meta[name=description]').remove();
					$('head').append("<meta name='description' content='" + msg["meta_definition"][lang] + "'>");
					break;
				}

			}
		}
	};
	/* ---------------------------------------------------------------------------------
	 * Function: arc.snb
	 * Purpose: Localize social network bar UI and define related events
	 * Parameters:	See default parameters below
	 * Return : N/A
	 */
	arc.snb = function(options) {

		// Default settings
		var settings = $.extend({
			// URL default: Current url
			url : document.URL,

			// Title default: Document title
			title : document.title,

			// Summary default: Document description
			summary : $('meta[name=description]').attr("content"),

			// Hashtage default: None
			hashtag : "",

			// Twitter default ID
			twitter : "https://twitter.com/auvercloud",

			// Language default
			lang : arc.device.lang(),

			// Supported languages:
			langs : ["en", "fr"],

			// Default localized messages to apply to identified DOM components
			msgDOM : {
				snbContact : {
					fr : "nous contacter",
					en : "contact us",
					prop : "html"
				},
				snbContactEmail : {
					fr : "Contacter AuverCloud par email",
					en : "Contact AuverCloud by email",
					prop : "title"
				},
				snbShare : {
					fr : "partager",
					en : "share",
					prop : "html"
				},
				snbShareMail : {
					fr : "Partager par email",
					en : "Share by email",
					prop : "title"
				},
				snbShareFb : {
					fr : "Partager sur Facebook",
					en : "Share on Facebook",
					prop : "title"
				},
				snbShareTw : {
					fr : "Partager sur Twitter",
					en : "Share on Twitter",
					prop : "title"
				},
				snbShareGplus : {
					fr : "Partager sur Google+",
					en : "Share on Google+",
					prop : "title"
				},
				snbShareIn : {
					fr : "Partager sur Linkedin",
					en : "Share on Linkedin",
					prop : "title"
				},
				snbFollow : {
					fr : "suivre",
					en : "follow",
					prop : "html"
				},
				snbFollowTw : {
					fr : "Suivre sur Twitter",
					en : "Follow on Twitter",
					prop : "title"
				}
			},
			// Any Other Business default messages
			msgAOB : {
				emailSubject : {
					fr : "Page web intéressante : ",
					en : "Interesting web page: "
				},
				contactSubject : {
					fr : "Contact à partir de la page : ",
					en : "Contact from page: "
				}
			}
		}, options);

		// Applying default language if required
		if (settings.langs.indexOf(settings.lang) == -1)
			settings.lang = settings.langs[0];

		// Adding Timestamp and encoding URL parameters;
		settings.url = settings.url + "?in=" + Math.round(+new Date() / 1000);
		settings.url = encodeURIComponent(settings.url);
		settings.title = encodeURIComponent(settings.title);
		settings.summary = encodeURIComponent(settings.summary);

		// Localize DOM UI
		arc.localizeById(settings.lang, settings.msgDOM);

		// Contact by email
		$("#snbContactEmail").attr("href", "mailto:contact@auvercloud.fr?subject=" + settings.msgAOB.contactSubject[settings.lang] + settings.title);

		// Share by email
		$("#snbShareMail").attr("href", "mailto:?body=" + settings.url + "&subject=" + settings.msgAOB.emailSubject[settings.lang] + settings.title);

		// Share on FB
		$("#snbShareFb").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + settings.url);

		// Share on Twitter
		$("#snbShareTw").attr("href", "http://twitter.com/share?url=" + settings.url + "&hashtags=" + settings.hashtag);

		// Share on Google+
		$("#snbShareGplus").attr("href", "https://plus.google.com/share?url=" + settings.url);

		// Share on Linkedin
		$("#snbShareIn").attr("href", "https://www.linkedin.com/shareArticle?mini=true&url=" + settings.url + "&source=" + settings.url + "&title=" + settings.title + "&summary=" + settings.summary);

		// Follow on Twitter
		$("#snbFollowTw").attr("href", settings.twitter);

		// Add Open Graph URL properties
		$("head").append("<meta property='og:url' content='" + settings.url + "'/>");
		$("head").append("<meta property='og:title' content='" + settings.title + "'/>");
		$("head").append("<meta property='og:description' content='" + settings.summary + "'/>");
	};
	/* ---------------------------------------------------------------------------------
	 * Function: popup
	 * Purpose: Modal popup on shadowed background
	 * Parameters:	See default parameters below
	 * Return : N/A
	 */
	arc.popup = function(options) {

		var settings = $.extend({
			// Popup title
			title : "No title",
			// Popup content
			content : "<p>No content</p>",
			// Popup head bg color
			colorBG : "#888",
			// Popup head fg color
			colorFG : "#fff",
			// Confirm button
			confirm : "OK",
			// Cancel button
			cancel : "CANCEL",
			// Show Cancel button
			cancelShow : false,
			// Callback when confirmation popup
			callback : false,
			// Function to execute after UI display
			after : false,
			// FadeIn delay
			delay : 400
		}, options);

		// Remove any former shadowed content
		$("#shadow").remove();

		// Insert popup framework
		$("body").append("<div id='shadow' class='shadow'><div class='outer'><div class='middle'><div class='inner'><div id='popup'><div id='popup-head'></div><div id='popup-body'></div><div class='btn-bar-bottom'><div class='btn' id='popup-cancel'></div><div class='btn' id='popup-confirm'></div></div></div></div></div></div></div></div>");

		// Customize UI, content and events
		$("#popup").css("background-color", settings.colorBG);
		$("#popup-head").html(settings.title).css("color", settings.colorFG);
		$("#popup-body").html(settings.content);
		$("#popup-confirm").html(settings.confirm);

		var popupClear = function() {
			$(window).unbind("keyup");
			$("#shadow").remove();

		};

		// [ESC] cancel
		$(window).keyup(function(e) {
			if (e.which == 27)
				popupClear();
		});

		if (settings.callback) {

			// Callback or quit
			$("#popup-confirm").click(function(e) {
				e.stopPropagation(e);
				e.preventDefault(e);

				if ( typeof settings.callback == "function")
					settings.callback();

				popupClear();
			});

			// Show Cancel button only if required
			if (settings.cancelShow)
				$("#popup-cancel").html(settings.cancel).click(function(e) {
					e.stopPropagation(e);
					e.preventDefault(e);
					popupClear();
				});
			else {
				$("#popup-cancel").hide();
			}

		} else {
			// Just Quit
			$("#popup-cancel").hide();
			$("#popup-confirm").click(function(e) {
				e.stopPropagation(e);
				e.preventDefault(e);
				popupClear();
			});
		}

		$("#shadow").show();
		$("#popup").fadeIn(settings.delay, function() {
			if ( typeof settings.after == "function")
				settings.after();
		});
	};
}

/* =================================================================================================
 * EoF
 * ================================================================================================= */
