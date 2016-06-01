/* =================================================================================
 * AUVERCLOUD SAFENOTE: Secured notes management (formerly KySSME 1.0 then SOS 2.0 then LOCKER 2.1 then SafeNote 3.0)
 * Version: 5.0
 *
 * SAFENOTE is a web application that aims at demonstrating how to develop a client/server web application
 * using only client technologies (HTML, CSS, JavaScript, jQuery) and the AuverCloud HTTP API server.
 *
 * SAFENOTE provides end users with a service to edit and manage simple and secured notes.
 *
 * SAFENOTE includes technologies from the following sources:
 * 		- jQuery: http://jquery.com/
 * 		- jQuery mobile: http://jquerymobile.com/
 * 		- Tooltipster: http://iamceege.github.io/tooltipster/
 * 		- Crypto-js: https://code.google.com/p/crypto-js/
 * 		- Sortable: https://github.com/RubaXa/Sortable
 * 		- Normalize CSS: https://necolas.github.io/normalize.css/
 *
 * SAFENOTE also includes an icon font from IcoMoon (https://icomoon.io/).
 * If you operate a SafeNote-like service using this code a license must be paid to IcoMoon
 *
 * Copyright 2014, 2015, 2016 Guillaume DORBES
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
 * ================================================================================= */

var safenote = {
	// Application version
	VERSION : "5.0",
	// Width threshold for mobile view
	WIDTH_MOBILE : 768,
	// Web app URL: Required for callback from email confirmation
	URL : "https://www.auvercloud.com/app/safenote/",
	// Supported languages. The default language is the first in the array
	LANG : ["en", "fr"],
	// Side menu width
	MENU_WIDTH : 240,
	// Regular expressions: email, password, cyphering key
	REX_EMAIL : new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$"),
	REX_PASSWORD : new RegExp("^[0-9]{8,16}$"),
	REX_KEY : new RegExp("^[a-zA-Z0-9]{8,64}$"),
	// Cyphering key Time-to-Live in ms (10mn). After this time the user's cyphering key must be re-entered
	TTL : 600000,
	// Timer in ms to close an open note automatically (5mn). After this time any detailed view of notes is closed.
	AUTOCLOSE : 300000,
	// Current language: Undefined on start
	lang : false,
	// Context: web or native (ex. Cordova)
	context : "web",
	// URL parameters (e.g. callback URL from email confirmation message)
	param : false,
	// Init time before autoclosing note
	closeTime : arc.FOREVER,
	// User data
	data : {}
};

/* ---------------------------------------------------------------------------------
 * Function: ui
 * Purpose:	Init User Interface and related events
 * Called by: init()
 * Parameter(s): N/A
 * Return: N/A
 */
function ui() {

	// ------------------- GLOBAL UI -------------------

	// Application version
	$("#version").html(safenote.VERSION);

	// Audio objects
	$("body").audioAppend({
		id : "audio-ding",
		name : "ding",
		path : "../safenote/media/"
	});
	$("body").audioAppend({
		id : "audio-error",
		name : "error",
		path : "../safenote/media/"
	});
	$("body").audioAppend({
		id : "audio-trash",
		name : "trash",
		path : "../safenote/media/"
	});

	// Disable hover fx, toolbar and print if touchable screen
	if (arc.touchable()) {
		$(".hover").removeClass("hover");
		$("#toolbar").remove();
		$("#side-print, #print").remove();
	}

	// Show animation which is appropriate according to current language
	if (arc.device.lang() == "fr")
		$("#safenotefr_hype_container").show();
	else
		$("#safenoteen_hype_container").show();

	// Init Hype callback
	if ("HYPE_eventListeners" in window === false) {
		window.HYPE_eventListeners = Array();
	}

	// Form input focus
	$(".input-wrapper input, .input-wrapper textarea").focus(function() {
		$(this).addClass("focus");
		$(this).siblings().addClass("focus");
	});

	// Form input blur
	$(".input-wrapper input, .input-wrapper textarea").blur(function() {
		$(this).removeClass("focus");
		$(this).siblings().removeClass("focus");
	});

	// Top screen notification
	$("#notif").click(function() {
		$(this).slideUp();
	});

	// ------------------- RESIZE ON EVENT -------------------
	arc.size(function() {
		var h = $(window).height();
		var w = $(window).width();
		var sdh = h - $("#head").height() - $("footer").height();

		// Private application min height
		$("#app").css("min-height", h);

		// default background icon size for private UI
		$("#empty .icon-file-text2").css("font-size", $("#empty").height() / 2 + "px");

		// Empty message and message list
		$("#note-closed").css("line-height", sdh + "px");
		$("#list, #note-open").css("min-height", sdh + "px");

		// List and Note UI according to screen width
		if (w < safenote.WIDTH_MOBILE) {

			$("#list, #note").width("100%");

			// Menu button according to opened note
			if ($("#note-open").css("display") == "block") {
				$("#list").hide();
				$("#note").show();
				$("#btn-plus, #btn-menu").hide();
				$("#btn-back").css("display", "inline-block");
			} else {
				$("#note").hide();
				$("#list").show();

				// Reset header buttons if not special views: FAQ or preferences
				if ($("#faq").css("display") != "block" && $("#pref").css("display") != "block") {
					$("#btn-back").hide();
					$("#btn-plus, #btn-menu").css("display", "inline-block");
				}
			}
		} else {
			$("#list").width("33.33%").show();
			$("#note").width("66.66%").show();

			// Reset header buttons if not special views: FAQ or preferences
			if ($("#faq").css("display") != "block" && $("#pref").css("display") != "block") {
				$("#btn-back").hide();
				$("#btn-plus, #btn-menu").css("display", "inline-block");
			}
		}
	});

	// ------------------- FOOTER -------------------

	$("#flag").click(function() {
		$(".shadow, #languages").show();
		$(".shadow").unbind("click").click(function() {
			$(".shadow, #languages").hide();
		});
	});

	$("#languages .btn").click(function(e) {

		e.stopImmediatePropagation();
		$(".shadow, #languages").hide();

		// Close popup
		if ($(this).hasClass("cancel"))
			return;

		var lang = $(this).attr("id").substr(5, 2);
		if (arc.DEBUG)
			console.log("- safenote: Language change =", lang);

		safenote.param.lang = arc.device.lang(lang);
		localize(start);
	});

	// ------------------- PUBLIC SECTION -------------------

	// Checkmark to play intro
	$("#show-intro").click(function() {
		var check = $(this).children(".checkmark");
		if (check.hasClass("icon-checkbox-checked")) {
			check.removeClass("icon-checkbox-checked").addClass("icon-checkbox-unchecked");
			arc.cake.write("introduction", "hide");
		} else {
			check.removeClass("icon-checkbox-unchecked").addClass("icon-checkbox-checked");
			arc.cake.write("introduction", "show");
		}
	});

	// Refresh Signup challenge
	$("#tip_signup_challenge").click(function() {

		// Find related input
		var input = $(this).siblings("input").first();

		// Update challenge
		arc.api({
			api : "challenge_new",
			height : 28,
			method : "operation",
			color : "random"
		}, {
			success : function(r) {
				if (r.code != "200")
					return;

				// Update challenge and clear input
				$("#tip_signup_challenge > img").attr("src", "data:image/png;base64," + r.data.img);
				input.data("token", r.data.token);
				input.val("");
			}
		});
	});

	// Hide signin - Show signup
	$("#btn_form_signup").click(function(e) {
		$("#btn-to-signup,  #form-signin").hide();
		$("#btn-to-signin,  #form-signup").show();
		$("#form-signup .form-error").html("");
		$("#tip_signup_challenge").trigger("click");
	});
	// Hide signup - Show signin
	$("#btn_form_signin").click(function() {
		$("#btn-to-signin,  #form-signup").hide();
		$("#btn-to-signup,  #form-signin").show();
		$("#form-signin .form-error").html("");
	});

	// RemAuth hover
	$("#btn_remauth").hover(function() {
		$("#label_signin_pwd, #input-wrapper-pwd").css("opacity", 0.2);
	}, function() {
		$("#label_signin_pwd, #input-wrapper-pwd").css("opacity", 1.0);
	});

	// Signup
	$("#btn_signup").click(function() {

		// Clear error
		$("#form-signup .form-error").html("");

		// Load email template
		$.get("html/signup_" + safenote.lang + ".html", function(mailBody) {

			// Send request
			arc.api({
				api : "subscribe",
				email : $("#signup-email").val(),
				token : $("#signup-challenge").data("token"),
				challenge : $("#signup-challenge").val(),
				subject : MSG.subject_signup[safenote.lang],
				content : mailBody.replace(/[\n\r]/g, ""),
				pwd_type : "num",
				pwd_len : 8,
				callback : safenote.URL
			}, {
				success : function(r) {
					if (r.code != "200") {
						errorMessage(r, "#form-signup .form-error");
						$("#tip_signup_challenge").trigger("click");
						return;
					}

					// Back to signin form
					$("#audio-ding").audioPlay();
					$("#btn_form_signin").trigger("click");

					// Notify user
					$("#notif").css("display", "table");
					$("#notif-body").html(MSG.notif_signup[safenote.lang] + "<i class='yellow'>" + $("#signup-email").val() + "</i>.");

					// Clear email input
					$("#signup-email").val("");
				}
			});

		}, 'html');
	});

	// Password reset
	$("#btn_reset").click(function() {

		// Clear error
		$("#form-signup .form-error").html("");

		// Load email template
		$.get("html/reset_" + safenote.lang + ".html", function(mailBody) {

			// Send request
			arc.api({
				api : "password_reset",
				email : $("#signup-email").val(),
				token : $("#signup-challenge").data("token"),
				challenge : $("#signup-challenge").val(),
				subject : MSG.subject_reset[safenote.lang],
				content : mailBody.replace(/[\n\r]/g, ""),
				pwd_type : "num",
				pwd_len : 8,
				callback : safenote.URL
			}, {
				success : function(r) {
					if (r.code != "200") {
						errorMessage(r, "#form-signup .form-error");
						$("#tip_signup_challenge").trigger("click");
						return;
					}

					// Back to signin form
					$("#audio-ding").audioPlay();
					$("#btn_form_signin").trigger("click");

					// Notify user
					$("#notif").css("display", "table");
					$("#notif-body").html(MSG.notif_signup[safenote.lang] + "<i class='yellow'>" + $("#signup-email").val() + "</i>.");

					// Clear email input
					$("#signup-email").val("");
				}
			});

		}, 'html');
	});

	// Signin
	$("#btn_signin").click(function() {

		// Send request
		arc.api({
			api : "signin",
			email : $("#signin-email").val(),
			password : $("#signin-pwd").val(),
			fingerprint : arc.device.fingerprint(),
			ttl : "forever",
			lang : safenote.lang
		}, {
			success : function(r) {

				if (r.code != "200") {
					errorMessage(r, "#form-signin .form-error");

					// In case of wrong password the message is customized afterwards
					if (r.code == "652")
						$("#form-signin .form-error").html($("#form-signin .form-error").html().replace("%number%", r.data));
					return;
				}

				// Clear signin input
				$("#signin-email, #signin-pwd ").val("");

				// Login OK after this point
				$("#audio-ding").audioPlay();

				// Store session data: User ID, Session ID, End of Session time
				arc.sessionStore({
					uuid : r.data.uuid,
					usid : r.data.usid,
					udid : arc.device.fingerprint(),
					eost : r.data.eost,
				});

				// Start session
				session();
			}
		});
	});

	// <ENTER> on signin password
	$("#signin-pwd").keydown(function(e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			$("#btn_signin").trigger("click");
		}
	});

	// RemAuth login
	$("#btn_remauth").click(function() {

		// Launch RemAuth authentication with standard POST function provided by RemAuth client
		arc.remauth.post("https://api.remauth.com/authenticate", {

			key : "d090dfb17ba24d7bb580eab029d09fb5",
			token : arc.remauth.access("d090dfb17ba24d7bb580eab029d09fb5")[1],
			email : $("#signin-email").val(),
			invite : safenote.lang

		}).done(function(r) {

			// Exit on error
			if (r.code != "200") {
				errorMessage(r, "#form-signin .form-error");
				return;
			}

			// User is not yet subscribed to RemAuth. Invite has been sent and user is notified
			if (r.data == "invited") {
				arc.remauth.popup(MSG.invited[safenote.lang].replace("%email%", $("#signin-email").val()));
				return;
			}

			// Clear signin input
			$("#signin-email, #signin-pwd ").val("");

			// RemAuth authentication well started => show waiting UI
			arc.remauth.waiting(r.data, {

				// Callback on authentication status change
				callbackAuthent : function() {
					if (arc.debug)
						console.log("#RemAuth authentication response = ", r.data.email, r.data.uaid);

					// Send request
					arc.api({
						api : "remauth",
						email : r.data.email,
						uaid : r.data.uaid,
						fingerprint : arc.device.fingerprint(),
						ttl : "forever"
					}, {
						success : function(ri) {

							// Authentication errors e.g. invalid uaid, authentication failure...
							if (ri.code != "200") {
								errorMessage(ri, "#form-signin .form-error");
								return;
							}

							// Login OK after this point
							$("#audio-ding").audioPlay();
							$("#form-signin .form-error").html("");

							// Start session
							arc.sessionStore({
								uuid : ri.data.uuid,
								usid : ri.data.usid,
								udid : arc.device.fingerprint(),
								eost : ri.data.eost,
							});
							session();
						}
					});
				}
			});
		});
	});

	// ------------------- HEADER BUTTONS -------------------

	// Show side menu
	$("#btn-menu").bind("tap", function(e) {
		e.stopImmediatePropagation();
		$("#menu-shadow").show();
		$("#main, #head, #menu-shadow").css("left", safenote.MENU_WIDTH + "px");
		$("#menu").width(safenote.MENU_WIDTH);
	});

	// New note
	$("#btn-plus").click(function() {

		// Get a new data ID related to an empty string
		arc.api({
			api : "data_up",
			data : ""
		}, {
			session : true,
			success : function(o) {

				if (o.code != "200") {
					$("#audio-error").audioPlay();
					return;
				}

				// Add the new data ID to the user data list
				safenote.data.appSOS.list.unshift({
					id : o.data,
					name : MSG.default_note_name[safenote.lang],
					time : Math.round(new Date() / 1000)
				});

				// Refresh the list UI
				list();

				// Save
				arc.api({
					api : "profile_set",
					profile : JSON.stringify(safenote.data)
				}, {
					session : true
				});
			}
		});

	});

	// Back button to closed note display:
	$("#btn-back").click(function() {
		$("#list > li").removeClass("white");
		$("#note-closed").show();
		$("#note-open").hide();

		// Back to list UI on mobile view
		if ($("#list").css("display") != "block") {
			$("#note").hide();
			$("#list").show();
		}
		$(window).trigger('resize');
	});

	// ------------------- SIDE MENU -------------------

	// Hide side menu
	$("#menu-shadow").bind("tap", function() {
		$("#menu").width(0);
		$("#main, #head, #menu-shadow").css("left", 0);
		$("#menu-shadow").hide();
	});

	// Side menu: Signout
	$("#side-signout").click(function() {

		// Restore default private UI
		$("#menu-shadow").trigger("tap");

		// Clear client session data
		arc.cake.erase("uuid");
		arc.cake.erase("usid");
		arc.cake.erase("udid");
		arc.cake.erase("eost");

		// Clear server session data
		arc.api({
			api : "signout"
		});

		// Clear user data
		$("#note-name").val();
		$("#list, #note-content").html("");
		safenote.data = {};

		// Back to public UI
		$("#private").hide();
		$("#public").show();
	});

	// Side menu toggle UI. Called when selecting FAQ and Preferences
	var sideToggle = function(target) {

		// Hide side menu
		$("#menu-shadow").trigger("tap");

		// Define current view
		if ($("#empty").css("display") == "table")
			view = "#empty";
		else
			view = "#regular";

		// Update UI
		$("#btn-menu, #btn-plus").hide();
		$(view).hide();
		$(target).show();

		// Enable back btn
		$("#btn-quit").css("display", "inline-block").unbind("click").click(function() {

			$(target).hide();
			$("#btn-quit").hide();
			$(view).show();
			$("#btn-menu, #btn-plus").css("display", "inline-block");
		});
	};

	// Side menu: FAQ
	$("#side-faq").click(function() {
		sideToggle("#faq");
		$("#faq-content").load("html/faq_" + safenote.lang + ".html", function() {

			$(".faq-item h2").prepend("<span class='icon-minus3'>&nbsp;</span><span class='icon-plus3 hidden'>&nbsp;</span>").click(function() {
				$(this).siblings("p, ul").toggle();
				$(this).children(".icon-minus3, .icon-plus3").toggle();
			});
		});
	});

	// Side menu: Pref
	$("#side-pref").click(function() {

		// Clear preference error(s) and input
		$("#form-password .form-error").html("");
		$("#password-input1, #password-input2").val("");

		// Toggle UI
		sideToggle("#pref");
	});

	// Side menu: Print
	$("#side-print").click(function() {

		// Toggle side menu
		$("#menu-shadow").trigger("tap");

		// Display list of notes if key is live
		keyCheck(function() {

			// Init print UI
			$("#portrait").hide();
			$("#print").show();
			$("#print-list").html("");

			// Build the list
			safenote.data.appSOS.list.forEach(function(note) {

				// Note title
				$("#print-list").append("<div class='print-note-name'>" + note.name + "</div><div class='print-note-content' id='pnc-" + note.id + "'></div>");

				// Note content
				arc.api({
					api : "data_down",
					id : note.id
				}, {
					session : true,
					success : function(o) {
						if (o.code != "200")
							return;

						// AES decrypt of text using MD5 hash of user key as encryption key
						$("#pnc-" + note.id).html(Crypto.AES.decrypt(o.data.data, Crypto.MD5($("#list").data("keyLive"))));
					}
				});

				// Refresh autoclose timer
				safenote.closeTime = new Date().getTime() + safenote.AUTOCLOSE;
			});
		});
	});

	// ------------------- PREFERENCES -------------------

	$("#btn_password").click(function() {

		// Clear error
		$("#form-password .form-error").html("");

		// Passwords match?
		if ($("#password-input1").val() != $("#password-input2").val()) {
			$("#form-password .form-error").html(MSG.err_pwd_match[safenote.lang]);
			$("#audio-error").audioPlay();
			return;
		}
		// Invalid password
		if (!safenote.REX_PASSWORD.test($("#password-input1").val())) {
			$("#form-password .form-error").html(MSG.err_pwd_invalid[safenote.lang]);
			$("#audio-error").audioPlay();
			return;
		}

		// Request
		arc.api({
			api : "password_change",
			password : $("#password-input1").val(),
		}, {
			session : true,
			success : function(r) {
				if (r.code != "200") {
					errorMessage(r, "#form-password .form-error");
					return;
				}

				// Feedback
				$("#password-input1, #password-input2").val("");
				$("#form-password .success").show().fadeOut(2000);
				$("#audio-ding").audioPlay();
			}
		});
	});

	// ------------------- NOTE EDIT -------------------

	// Subject change
	$("#message-subject").change(function() {
		var itemSubject = $("#list #" + $("#message-edit").data("mid") + " .item-subject > .subject-value");
		$("#upload").show().fadeOut(300);
		arc.api({
			api : "message_update",
			mid : $("#message-edit").data("mid"),
			subject : $("#message-subject").val(),
			language : safenote.lang
		}, {
			session : true,
			success : function(r) {

				// Response error
				if (r.code != "200") {
					errorMessage(r, "#error-subject");
					$("#audio-error").audioPlay();
					return;
				}
				// On success update subject in list
				itemSubject.html($("#message-subject").val());
			}
		});

	}).focus(function() {
		$("#error-subject").html("");
	});

	// Note name update
	var nameUpdate = function() {
		// Define the current list item UI and time
		var item = $("#" + $("#list").data("current"));
		var time = new Date();

		// Update the item
		item.find(".item-name").html($("#note-name").val());
		item.find(".item-time").data("time", time / 1000);
		item.find(".item-update").html(arc.getTime({
			"time" : time
		}));

		// Save the list
		listSave();
	};

	// Note name change and <ENTER>.
	$("#note-name").change(nameUpdate).keydown(function(e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			nameUpdate();

			// Focus on content edit
			$("#note-content").focus();
		}
	});

	// Note content update now (force = true) or depending on timer
	var noteUpdate = function(force) {

		// Define the current list item UI and time
		var id = $("#list").data("current");
		var item = $("#" + id);
		var time = new Date();

		// Upload text note and list at least every 5s  if not idle (see arc.TIMER)
		arc.delayed(function() {

			// Update the item time
			item.find(".item-time").data("time", time / 1000);
			item.find(".item-update").html(arc.getTime({
				"time" : time
			}));

			// Save AES encrypt of text using MD5 hash of user key as encryption key
			arc.api({
				api : "data_up",
				id : id,
				data : Crypto.AES.encrypt($("#note-content").html(), Crypto.MD5($("#list").data("keyLive")))
			}, {
				session : true
			});

			// Save the list
			listSave();
		}, force);

		// Update autoclose deadline
		safenote.closeTime = time.getTime() + safenote.AUTOCLOSE;

	};

	// Note content update on editing and toolbar toggle
	$("#note-content").on("keyup", function(e) {
		noteUpdate(false);
	}).blur(function() {
		noteUpdate(true);
		$("#toolbar").hide();
	}).focus(function() {
		if ($(window).width() > 768)
			$("#toolbar").show();
		else
			$("#toolbar").hide();
	});

	// Text tools
	$("#toolbar > div").mousedown(function(e) {
		e.preventDefault();
		var str = $(this).attr("class");
		switch(str.substr(0,str.indexOf(' '))) {
		case "tool-bold":
			document.execCommand("bold", false, "");
			break;
		case "tool-under":
			document.execCommand("underline", false, "");
			break;
		case "tool-ital":
			document.execCommand("italic", false, "");
			break;
		case "tool-color":
			switch($(this).attr("id")) {
			case "col-black":
				document.execCommand("forecolor", false, "#000");
				break;
			case "col-grey":
				document.execCommand("forecolor", false, "#888");
				break;
			case "col-red":
				document.execCommand("forecolor", false, "#a00");
				break;
			case "col-green":
				document.execCommand("forecolor", false, "#0a0");
				break;
			case "col-blue":
				document.execCommand("forecolor", false, "#08A1D9");
				break;
			case "col-yellow":
				document.execCommand("forecolor", false, "#FFCC00");
				break;
			case "col-purple":
				document.execCommand("forecolor", false, "#800080");
				break;
			}
			break;
		case "tool-less":
			document.execCommand("outdent", false, "");
			break;
		case "tool-more":
			document.execCommand("indent", false, "");
			break;
		case "tool-left":
			document.execCommand("justifyLeft", false, "");
			break;
		case "tool-center":
			document.execCommand("justifyCenter", false, "");
			break;
		case "tool-right":
			document.execCommand("justifyRight", false, "");
			break;
		case "tool-justify":
			document.execCommand("justifyFull", false, "");
			break;
		case "tool-bullet":
			document.execCommand("insertUnorderedList", false, "");
			break;
		case "tool-number":
			document.execCommand("insertOrderedList", false, "");
			break;
		case "tool-line":
			document.execCommand("inserthorizontalrule", false, "");
			break;
		case "tool-default":
			document.execCommand("removeFormat", false, "");
			break;
		}
		noteUpdate(true);
	});

	// ------------------- PRINT NOTES -------------------

	$("#print-head .cancel").click(function() {
		$("#print").hide();
		$("#portrait").show();

	});

	$("#print-head .print").click(function() {
		window.print();
		$("#print-head .cancel").trigger("click");
	});
}

/* ---------------------------------------------------------------------------------
 * Function: keyCheck
 * Purpose:	Check if the cyphering key exists and is alive. Display forms accordingly.
 * Called by: Any function which requires a live key: Open note, Delete note, Print note.
 * Parameter(s): callback = Function to execute when the cyphering key is alive i.e. input < 10mn
 * Return: N/A
 */
function keyCheck(callback) {

	// Track callback for debug
	var callbackExec = function() {
		var validity = new Date($("#list").data("keyTime"));
		if (arc.DEBUG)
			console.log("- safenote: Key based callback validity =", validity.toString());
		callback();

	};

	// If the key is not yet set, show the key definition UI
	if (!safenote.data.appSOS.key) {

		// Reset form UI
		$("#key-new").css("display", "table");
		$("#form-key-new .form-error").html("");
		$("#key_new_1, #key_new_2").val("");
		$("#key_new_1").focus();

		// Cancel key input
		$("#btn_new_key_cancel").unbind("click").click(function() {
			$("#key-new").hide();
		});

		// Confirm key input
		$("#btn_new_key_confirm").unbind("click").click(function() {

			// Inputs do not match
			if ($("#key_new_1").val() != $("#key_new_2").val()) {
				$("#audio-error").audioPlay();
				$("#form-key-new .form-error").html(MSG.key_not_match[safenote.lang]);
				return;
			}
			// Inputs are note valid
			if (!safenote.REX_KEY.test($("#key_new_1").val())) {
				$("#audio-error").audioPlay();
				$("#form-key-new .form-error").html(MSG.key_not_valid[safenote.lang]);
				return;
			}

			// Store the key hash and clear inputs
			safenote.data.appSOS.key = Crypto.SHA256($("#key_new_1").val());
			listSave();

			// Save temporary unhashed key value in the DOM #list
			$("#list").data("keyLive", $("#key_new_1").val());
			$("#list").data("keyTime", new Date().getTime() + safenote.TTL);

			// Clear form
			$("#key_new_1, #key_new_2").val("");
			$("#key-new").hide();

			// Exec callback
			callbackExec();
		});

		return;
	}

	// If the key is not alive (input < 10 mn), show the key input UI
	if ($("#list").data("keyTime") == 0 || new Date().getTime() > $("#list").data("keyTime")) {

		// Reset form UI
		$("#key-enter").css("display", "table");
		$("#form-key-enter .form-error").html("");
		$("#key_enter").focus();

		// Reset live key data
		$("#list").data("keyLive", false);
		$("#list").data("keyTime", 0);

		// Cancel key input
		$("#btn_enter_key_cancel").unbind("click").click(function() {
			$("#key-enter").hide();
		});

		// Test key input and apply callback if right value
		var testKey = function() {
			// Wrong cyphering key
			if (Crypto.SHA256($("#key_enter").val()) != safenote.data.appSOS.key) {
				$("#audio-error").audioPlay();
				$("#form-key-enter .form-error").html(MSG.key_wrong[safenote.lang]);
				return;
			}

			// Save temporary unhashed key value in the DOM #list
			$("#list").data("keyLive", $("#key_enter").val());
			$("#list").data("keyTime", new Date().getTime() + safenote.TTL);

			// Clear form
			$("#key_enter").val("");
			$("#key-enter").hide();

			// Exec callback
			callbackExec();
		};

		// Take care of <ENTER> and <ESC> to test input or to leave form
		$("#key_enter").unbind("keydown").keydown(function(e) {

			switch(e.keyCode) {
			case 13:
				e.preventDefault();
				testKey();
				break;
			case 27:
				$("#key-enter").hide();
				break;
			}
		});

		// Click to test
		$("#btn_enter_key_confirm").unbind("click").click(testKey);

		return;
	}

	// After this point, the key is alive then its TTL is refreshed and the callback is executed
	$("#list").data("keyTime", new Date().getTime() + safenote.TTL);
	callbackExec();
}

/* ---------------------------------------------------------------------------------
 * Function: list
 * Purpose:	Refresh the list of notes, even empty.
 * Called by: On start and when adding/removing note
 * Parameter(s): N/A
 * Return: N/A
 */
function list() {

	// HTML UI for list item
	var itemUI = "<li><div class='item-handler icon-sort2 hover'></div><div class='item-entry hover'><div class='item-name'></div><div class='item-time'><span class='icon-clock3'></span><span class='item-update'></span></div></div><div class='item-delete icon-cancel-circle hover'></div></li>";
	var itemDeleteUI = "<div class='item-delete-ui'><div class='btn double delete-confirm red hover'>" + MSG.delete_confirm[safenote.lang] + "</div><div class='btn double delete-cancel dark hover'>" + MSG.delete_cancel[safenote.lang] + "</div></div>";

	// Clear list UI
	$("#list").html("");

	if (safenote.data.appSOS.list.length != 0) {

		// Set UI for list view

		$("#empty").hide();
		$("#regular").show();
		$("#note-open").hide();
		$("#note-closed").show();

		// Build the list
		safenote.data.appSOS.list.forEach(function(note) {
			$("#list").append(itemUI);

			var last = $("#list > li:last-child");

			// Device dependent display
			if (!arc.touchable()) {
				last.find(".item-handler, .item-entry, .item-delete").addClass("hover");
			}

			last.attr("id", note.id);
			last.find(".item-name").html(note.name);
			last.find(".item-time").data("time", note.time);
			last.find(".item-update").html(arc.getTime({
				"time" : new Date(note.time * 1000)
			}));
		});

		// Make the list sortable using the handler to drag and drop
		var sortable = Sortable.create($("#list")[0], {
			animation : 0,
			handle : ".item-handler",
			draggable : "li",
			onEnd : listSave
		});

		// Delete note
		$(".item-delete").unbind("click").click(function() {

			// Clear any former delete UI
			$("#list .item-delete-ui").remove();

			// Define current
			var item = $(this).parent();

			// Add confirmation UI and events
			item.append(itemDeleteUI);
			item.find(".delete-cancel").click(function() {
				item.find(".item-delete-ui").remove();
			});
			item.find(".delete-confirm").click(function() {
				item.find(".item-delete-ui").remove();

				// Delete note after checking key
				keyCheck(function() {

					// Delete note on server
					arc.api({
						api : "data_delete",
						id : item.attr("id")
					}, {
						session : true
					});

					// Update list
					item.slideUp(500, function() {
						item.remove();
						listSave();
						list();
					});
				});
			});

		});

		// Open note
		$(".item-entry").unbind("click").click(function() {

			// Define current note
			var item = $(this).parent();
			$("#list").data("current", item.attr("id"));

			// Clear any former delete UI
			$("#list .item-delete-ui").remove();

			// Open note after checking if key is defined and alive
			keyCheck(function() {

				// Enhance current list item
				$("#list > li").removeClass("white");
				item.addClass("white");

				// Update edit UI and clear input
				$("#note-closed").hide();
				$("#note-open").show();
				$("#note-name").val("");
				$("#note-content").html("");
				$(window).trigger('resize');

				// Set note name
				$("#note-name").val(item.find(".item-name").html());

				// Download note from server
				arc.api({
					api : "data_down",
					id : item.attr("id")
				}, {
					session : true,
					success : function(o) {
						if (o.code != "200") {
							if (arc.DEBUG)
								console.log("safenote: Text loading error", o.code, o.msg);
							return;
						}

						// Show text content
						if (o.data.data != "") {
							// AES decrypt of text using MD5 hash of user key as encryption key
							$("#note-content").html(Crypto.AES.decrypt(o.data.data, Crypto.MD5($("#list").data("keyLive"))));
						}

						// Set autoclose deadline
						safenote.closeTime = new Date().getTime() + safenote.AUTOCLOSE;
					}
				});

			});
		});

	} else {

		// Reset UI for empty list

		$("#regular").hide();
		$("#empty").css("display", "table");
	}
}

/* ---------------------------------------------------------------------------------
 * Function: listSave
 * Purpose: Parse the list UI and save the user data
 * Called by: Anywhere a note is changed
 * Parameter(s) N/A
 * Return: N/A
 */
function listSave() {

	// Parse the UI list
	var l = [];
	$("#list > li").each(function() {
		l.push({
			"id" : $(this).attr("id"),
			"name" : $(this).find(".item-name").html(),
			"time" : $(this).find(".item-time").data("time")
		});
	});

	// Update user profile
	safenote.data.appSOS.list = l;

	// Save
	arc.api({
		api : "profile_set",
		profile : JSON.stringify(safenote.data)
	}, {
		session : true
	});

	// Visual feedback in footer
	$("#upload").show().fadeOut(500);
}

/* ---------------------------------------------------------------------------------
 * Function: errorMessage
 * Purpose:	Insert error message (localized or default) defined by code in HTML field
 * Called by: Signup and signin forms
 * Parameter(s): - response = API response
 * 				 - field = HTML field in jQuery syntax
 * Return: N/A
 */
function errorMessage(response, field) {

	// Get localized msg if any
	var error = MSG["err" + response.code];

	// Other get default message
	if (!error)
		error = response.msg;
	else
		error = error[safenote.lang];

	// Insert msg in field
	$(field).html(error);

	// Audio feedback
	$("#audio-error").audioPlay();
}

/* ---------------------------------------------------------------------------------
 * Function: autoclose
 * Purpose: Loop to close automatically an open note according to safenote.AUTOCLOSE timer
 * Called by: session()
 * Parameter(s): N/A
 * Return: N/A
 */
function autoclose() {
	if (new Date().getTime() > safenote.closeTime) {
		// Clear autoclose deadline
		safenote.closeTime = arc.FOREVER;

		// Close edit and print UI
		$("#btn-back").trigger("click");
		$("#print-head .cancel").trigger("click");

		if (arc.DEBUG)
			console.log("- safenote: Autoclose");
	}
	if (arc.DEBUG)
		console.log("- safenote: now", new Date().getTime());
	// Loop every 5 seconds
	setTimeout(autoclose, 5000);
}

/* ---------------------------------------------------------------------------------
 * Function: session
 * Purpose:	Init session after signin or valid signed session
 * Called by: start() and signin event
 * Parameter(s): N/A
 * Return: N/A
 */

function session() {

	// Show private UI
	$("#public").hide();
	$("#private").show();

	// Update bg icon size
	$(window).trigger('resize');

	// Init the cyphering key timer
	$("#list").data("keyLive", false);
	$("#list").data("keyTime", 0);

	// Load or init user profile
	arc.api({
		api : "profile_get"
	}, {
		session : true,
		success : function(o) {

			if (o.data.profile == "") {
				// New user
				safenote.data = {
					// Application data template
					appSOS : {
						// Ciphering key: Not yet defined
						key : "",
						// Empty list of notes
						list : [],
					},
					// Customized note about the user
					note : "SafeNote user!"
				};
			} else
				// Existing user
				safenote.data = JSON.parse(o.data.profile);

			// Update location
			arc.api({
				api : "location"
			}, {
				method : "get",
				success : (function(r) {
					safenote.data.ip = r.data.ip;
					safenote.data.country = r.data.country;
				})
			});

			// Show message list if any
			list();

			// Start autoclose note edit
			autoclose();
		}
	});
}

/* ---------------------------------------------------------------------------------
 * Function: start
 * Purpose:	Start application when UI and localization are initialized
 * Called by: localize()
 * Parameter(s): N/A
 * Return: N/A
 */
function start() {

	// Manage callback if any with well sized token
	if (safenote.param.api == "callback" && safenote.param.token.length == 20) {

		// Subscriber confirmed or New password => Close former session
		arc.cake.erase("uuid");
		arc.cake.erase("usid");
		arc.cake.erase("udid");
		arc.cake.erase("eost");

		arc.api({
			api : "callback",
			token : safenote.param.token
		}, {
			method : "get",
			success : function(r) {

				// Show notification bar
				$("#notif").css("display", "table");

				// Notify error...
				if (r.code != "200") {
					errorMessage(r, "#notif-body");
					return;
				}

				// .. or notify feedback
				$("#notif-body").html(MSG["callback_" + r.data.action][safenote.lang] + "<i class='yellow'>" + r.data.email + "</i>.");
				$("#signin-email").val(r.data.email);
				$("#audio-ding").audioPlay();

			}
		});

		// Clear URL
		history.replaceState({}, "safenote", window.location.href.split("?")[0]);
	}

	// Check valid session
	arc.api({
		api : "signed"
	}, {
		session : true,
		success : function(r) {
			$("#public").css("display", "table");
			if (r.code == "200")
				session();
		}
	});

}

/* ---------------------------------------------------------------------------------
 * Function: localize
 * Purpose:	Define the user language in the available ones and apply it.
 * Called by: init() and language change from user event
 * Parameter(s): 	- callback = function(lang) to apply when localization is done
 * Return: N/A
 */
function localize(callback) {

	// Internal callback when language is defined
	var languageApply = function(lang) {

		// Check if language is supported. Otherwise apply default one.
		if (safenote.LANG.indexOf(lang) == -1)
			lang = arc.device.lang(safenote.LANG[0]);

		if (arc.DEBUG)
			console.log("- safenote: Language =", lang);

		// Apply current language to lang dependent classes
		$(".lang").removeClass(safenote.LANG.join(" ")).addClass(lang);

		try {
			// Clear tooltips when language changes
			$('.tooltip').tooltipster("destroy");
		} catch (e) {
			// Nothing to destroy on first launch
		}

		// Apply localized messages
		arc.localizeById(lang, MSG);

		// Init tooltips
		$('.tooltip').tooltipster({
			theme : 'tooltip-custom',
			restoration : 'current',
			animation : 'grow',
			delay : 600,
			maxWidth : 300,
			contentAsHTML : true,
			hideOnClick : true
		});

		// Update document language and store value
		$("html").attr("lang", lang);
		safenote.lang = lang;

		// Callback when localization is OK
		callback();
	};

	// Define language for both web and native application
	if (safenote.context == "native") {
		// Cordova plugin: globalization
		navigator.globalization.getPreferredLanguage(function(lang) {

			// Apply device lange in the enabled one
			languageApply(lang.value.substr(0, 2).toLowerCase());

			// Disable language change
			$("#flag").hide();
		});
	} else {
		// Apply language parameter if any
		if (safenote.param.lang)
			languageApply(arc.device.lang(safenote.param.lang));
		else
			languageApply(arc.device.lang());
	}
}

/* ---------------------------------------------------------------------------------
 * Function: init
 * Purpose: Application init.
 * Called by: Document ready or page load or cache event.
 * Parameter(s): N/A
 * Return: N/A
 */

function init() {

	// Load jQuery and AuverCloud extensions (lib4.js)
	extendAuverCloud();
	extendJquery();

	// Init AuverCloud for this application
	arc = $.extend({}, arc, {
		// Debug mode
		DEBUG : false,
		// Application key. To customize with your own key if your want to operate the service (see auvercloud.com)
		APP_KEY : "43a2348027cdb8d216f4fb15fd9e1e4f53a93ef40b65f",
		// Application name. Used to define a local storage domain to avoid collisions between data from multiple AuverCloud apps.
		APP_NAME : "SafeNote"
	});

	if (arc.DEBUG)
		console.log("- safenote: Context =", safenote.context);

	// Retrieve URL parameters if any
	safenote.param = arc.param();

	// Init UI data, events and localization then start
	ui();
	localize(start);

	// Page tracking
	arc.api({
		api : "page_track"
	});

	// Show RemAuth UI if META detected
	if ($('meta[name=RemAuth-token]').attr("content")) {

		// Update login UI
		$("#btn_signin").addClass("double").html(MSG.btn_signin_double[safenote.lang]);
		$("#intro_remauth").show();
		$("#btn_remauth").css("display", "inline-block");

		// Init RemAuth client: Required for (1) popup + waiting UI (2) web socket client initialization
		arc.remauth = new RemAuth({
			debug : arc.DEBUG,
			lang : safenote.lang
		});
	}
}

/* ---------------------------------------------------------------------------------
 * EVERYTHING STARTS HERE:
 * 		- Context web or native
 * 		- jQuery or deviceready
 * 		- Modern browser or old IE
 * 		- Application cache and related UI
 */

if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
	// Native app mode (ex. Cordova)
	safenote.context = "native";
	document.addEventListener('deviceready', init, false);
} else {
	// Web app mode
	if (document.getElementById("oldie"))
		// IE < 10 is not supported
		window.onload = function() {
			document.body.innerHTML = "<br><p style='text-align:center;'>Microsoft Internet Explorer old versions are not supported.<br><br>Les versions anciennes de Microsoft Internet Explorer ne sont pas supportées.</p>";
		};
	else
		// Any modern browser
		$(init);
}
/* =================================================================================
 * EoF
 * ================================================================================= */