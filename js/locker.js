/* =================================================================================================
 * AUVERCLOUD LOCKER: Secured notes management
 * Version: 2.1
 *
 * LOCKER is a web application that aims at demonstrating how to develop a client/server web application
 * using only client technologies (HTML, CSS, JavaScript, jQuery) and the AuverCloud REST based API.
 *
 * LOCKER provides end userz with a service to edit and manage simple and secured notes.
 *
 * LOCKER includes technologies from the following sources:
 * 		- jQuery: http://jquery.com/
 * 		- jQuery mobile: http://jquerymobile.com/
 * 		- Crypto JS: https://code.google.com/p/crypto-js/
 * 		- Tooltipster: http://iamceege.github.io/tooltipster/
 *
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
 * =================================================================================================
 * LOCKER GLOBAL VARIABLES
 * ================================================================================================= */

var LOCKER = {
	// Application data
	data : {},

	// Password regular expression pattern
	PWD : new RegExp("^[0-9]{8,32}$"),

	// Cypehring key regular expression pattern
	REX : new RegExp("^[a-zA-Z0-9]{8,64}$"),

	// Cyphering key Time-to-Live in ms: 10mn
	TTL : 600000,

	// Timer in ms to close an open note automatically. Should be < TTL: 5mn
	AUTOCLOSE : 300000,
	RELEASE : {
		"en" : "Version 2.1 - December 18, 2014",
		"fr" : "Version 2.1 - 18 décembre 2014",
	}
};

// Init time before autoclosing note
LOCKER.closeTime = arc.FOREVER;

/* *************************************************************************************************
 * LOCKER: localize
 * =================================================================================================
 * Purpose: Apply language dependent messages
 * Parameter(s) - lang: Language code e.g. "en", "fr"...
 * Return: N/A
 *************************************************************************************************** */

function localize(lang) {
	// Clear tooltips
	try {
		$('.tooltip').tooltipster("destroy");
	} catch (e) {
		// On first launch, there is nothing to destroy
	}

	// Store the selected language as default for further page load
	arc.deviceLang(lang);

	// Update the language to messages related to static elements
	LOCKER.MSG.forEach(function(m) {
		if (m["static"])
			// Static msg only!
			if (!m["attr"])
				// No attribute => html
				$("#" + m.id).html(m[lang]);
			else
				// Otherwise the defined attribute
				$("#" + m.id).attr(m.attr, m[lang]);
	});

	// Special case: Titles and release
	$(".tool-default").attr("title", LOCKER.MSG[26][lang]).addClass("tooltip");
	$("#logout").attr("title", LOCKER.MSG[30][lang]).addClass("tooltip");
	$("#pwd-toggle").attr("title", LOCKER.MSG[31][lang]).addClass("tooltip");
	$("#note-new").attr("title", LOCKER.MSG[32][lang]).addClass("tooltip");
	$("#print-btn").attr("title", LOCKER.MSG[33][lang]).addClass("tooltip");
	$("#publicRelease").html(LOCKER.RELEASE[lang]);

	// Update META
	$("html").attr("lang", lang);
	document.title = LOCKER.MSG[35][lang];
	$('meta[name=description]').remove();
	$('head').append("<meta name='description' content='" + LOCKER.MSG[36][lang] + "'>");

	// Update generic footer
	// Apply AuverCloud generic UI
	snb({
		hashtag : "auvercloud"
	});

	// Init tooltips
	$('.tooltip').tooltipster({
		restoration : 'current',
		animation : 'grow',
		delay : 600
	});

}

/* *************************************************************************************************
 * LOCKER: ui
 * =================================================================================================
 * Purpose: Define User Interface events
 * Parameter(s) N/A
 * Return: N/A
 *************************************************************************************************** */

function ui() {

	// Disable toolbar for touch screen
	if (arc.deviceTouch()) {
		$("#toolbar").hide();
		$("#bar-text").css("margin-top", "0px");
	}

	// Close notification section
	$("#notif .icon-notif").click(function() {
		$("#notif").slideUp(100);
	});

	// Refresh capcha
	$("#capcha-refresh").click(function() {
		arc.api("utility_capcha_new", {
			// Clear any existing token for the considered img
			token : $("#sub-capcha img").data("token"),
			// Consider also "text"
			method : "operation",
			// width = height * 6
			height : 24,
			// color code without # or "random"
			color : "444444"
		}, function(data) {

			// Update capcha img and store related token
			$("#sub-capcha img").attr("src", arc.CAPCHA_PATH + data.data.token + ".png").data("token", data.data.token);

			// Clear capcha input
			$("#sub-capcha input").val("");
		});
	});

	// Focus form input
	$(".input input").focus(function() {
		$(this).parents(".input").find(".uico").removeClass("color-gray").addClass("color-blue");
	});

	// Hover form input
	$(".input input").blur(function() {
		$(this).parents(".input").find(".uico").removeClass("color-blue").addClass("color-gray");
	});

	// Click to change language
	$("#langEn, #langFr").click(function() {
		localize($(this).attr("id").substr(4).toLowerCase());
	});

	// Click to subscribe
	$("#subscribeOK").click(function() {

		// Clear error
		$("#subscribe-error").html("");

		// First retrieve current IP and country
		arc.api("utility_ip2country", {}, function(x) {

			// Init user profile
			var profile = JSON.stringify({
				// Application data template
				"appSOS" : {
					// Ciphering key: Not yet defined
					"key" : "",
					// Empty list of notes
					"list" : [],
				},
				// Current API caller IP
				"ip" : x.data.ip,
				// Current API caller country
				"country" : x.data.country,
				// Customized note about the user
				"note" : "This is a LOCKER user!"
			});

			// Send subscription data
			arc.api("user_subscriber_new", {
				// New user email. Password will be sent to this address after confirmation
				mailid : $("#subscribe-mailid").val(),
				// Capcha-like challenge result
				capcha : $("#subscribe-capcha").val(),
				// Capcha-like token
				token : $("#sub-capcha img").data("token"),
				// Callback address for confirmation links: This page
				callback : "https://www.auvercloud.com/app/locker/",
				// Customized confirm email subject
				confirm_subject : LOCKER.MSG[7][arc.deviceLang()],
				// Customized confirm email body
				confirm_body : LOCKER.MSG[8][arc.deviceLang()],
				// Customized conclude email subject
				conclude_subject : LOCKER.MSG[9][arc.deviceLang()],
				// Customized conclude email body
				conclude_body : LOCKER.MSG[10][arc.deviceLang()],
				// Initial user data
				user_data : profile
			}, function(o) {
				if (o.code != "200") {

					// Default confirmation error message
					var msg = o.msg;
					// Localized messages
					switch(o.code) {
					case "705":
						msg = LOCKER.MSG[2][arc.deviceLang()];
						break;
					case "706":
						msg = LOCKER.MSG[5][arc.deviceLang()];
						break;
					case "630":
						msg = LOCKER.MSG[4][arc.deviceLang()];
						break;
					case "421":
						msg = LOCKER.MSG[6][arc.deviceLang()];
						break;
					}

					$("#subscribe-error").html(msg);
					return;
				}

				// Subscribe OK after this point

				// Prefill login input
				$("#login-email").val($("#subscribe-mailid").val());

				// Clear subscribe input
				$("#subscribe-mailid").val("");

				// Refresh capcha
				$("#capcha-refresh").trigger("click");

				// Notify user
				$("#notif-msg").html(LOCKER.MSG[0][arc.deviceLang()]);
				$("#notif").slideDown(100);
			});
		});
	});

	// Click to subscribe
	$("#passwordOK").click(function() {

		// Clear error
		$("#subscribe-error").html("");

		// Send Password reset data
		arc.api("user_password_new", {
			// User email. The new password will be sent to this address after confirmation
			mailid : $("#subscribe-mailid").val(),
			// Capcha-like challenge result
			capcha : $("#subscribe-capcha").val(),
			// Capcha-like token
			token : $("#sub-capcha img").data("token"),
			// Callback address for confirmation links: This page
			callback : "https://www.auvercloud.com/app/locker/",
			// Customized confirm email subject
			confirm_subject : LOCKER.MSG[13][arc.deviceLang()],
			// Customized confirm email body
			confirm_body : LOCKER.MSG[14][arc.deviceLang()],
			// Customized conclude email subject
			conclude_subject : LOCKER.MSG[15][arc.deviceLang()],
			// Customized conclude email body
			conclude_body : LOCKER.MSG[16][arc.deviceLang()]
		}, function(o) {
			if (o.code != "200") {

				// Default confirmation error message
				var msg = o.msg;

				// Localized messages
				switch(o.code) {
				case "705":
					msg = LOCKER.MSG[2][arc.deviceLang()];
					break;
				case "706":
					msg = LOCKER.MSG[5][arc.deviceLang()];
					break;
				case "600":
					msg = LOCKER.MSG[12][arc.deviceLang()];
					break;
				case "601":
					msg = LOCKER.MSG[12][arc.deviceLang()];
					break;
				case "421":
					msg = LOCKER.MSG[6][arc.deviceLang()];
					break;
				}

				$("#subscribe-error").html(msg);
				return;
			}

			// Password reset OK after this point

			// Prefill login input
			$("#login-email").val($("#subscribe-mailid").val());

			// Clear subscribe input
			$("#subscribe-mailid").val("");

			// Refresh capcha
			$("#capcha-refresh").trigger("click");

			// Notify user
			$("#notif-msg").html(LOCKER.MSG[17][arc.deviceLang()]);
			$("#notif").slideDown(100);
		});
	});

	// Click to start session
	var start = function() {
		// Clear error
		$("#login-error").html("");

		// Send login data
		arc.api("user_session_start", {
			// Email ID
			usr : $("#login-email").val(),
			// Password
			pwd : $("#login-pwd").val(),
			// Device ID = Hash code, required for concurrent sessions on multiple devices. Otherwise any string.
			did : arc.deviceID(),
			// Time To Leave. "g" => Forever.
			ttl : "g"
		}, function(o) {

			if (o.code != "200") {

				// Default confirmation error message
				var msg = o.msg;

				// Localized messages
				switch(o.code) {
				case "600":
					msg = LOCKER.MSG[18][arc.deviceLang()];
					break;
				case "601":
					msg = LOCKER.MSG[18][arc.deviceLang()];
					break;
				case "604":
					msg = LOCKER.MSG[18][arc.deviceLang()];
					break;
				case "606":
					msg = LOCKER.MSG[37][arc.deviceLang()];
					break;
				case "421":
					msg = LOCKER.MSG[6][arc.deviceLang()];
					break;
				}

				$("#login-error").html(msg);
				return;
			}

			// Login OK after this point

			// Store session data: User ID, Session ID, End of Session time
			arc.userSessionStore(o.data.uid, o.data.sid, o.data.eos);

			// Set application data
			LOCKER.data = JSON.parse(o.data.data);

			// Start private UI
			$("#public").hide();
			list();
			$("#list").slideDown(100);
		});

	};
	$("#loginOK").click(start);
	$("#login-pwd").keydown(function(e) {
		if (e.which == 13)
			start();
	});

	// Click to log off
	$("#logout").click(function() {

		// Clear session data server and client sides
		arc.apiSession("user_session_stop", {});
		arc.userSessionDelete();
		LOCKER.data = {};

		// Back to public UI
		$("#list").hide();
		$("#public").slideDown(100);

	});

	// Click to create a new note
	$("#note-new").click(function(o) {

		// get a new data ID related to an empty string
		arc.apiSession("data_up", {
			data : ""
		}, function(o) {

			if (o.code != "200")
				return;

			// Add the new data ID to the user data list
			LOCKER.data.appSOS.list.unshift({
				id : o.data.data_id,
				name : "",
				time : arc.nowS()
			});

			// Refresh the list UI
			list();

			// Save
			arc.apiSession("user_data_set", {
				user_data : JSON.stringify(LOCKER.data)
			});
		});
	});

	// Keyup to search in note names
	$("#note-search input").keyup(function() {
		// Clear all items editing
		clearItem();

		// Show all entries if too short search string
		if ($(this).val().length < 2) {
			$(".item").show();
			return;
		}

		// Search regular expression
		var rg = new RegExp($(this).val(), 'i');
		$(".item").each(function() {
			if ($(this).find("input").val().search(rg) == -1)
				// Not found => Hide item
				$(this).hide();
			else
				// Found => Show item
				$(this).show();
		});
	});

	// Clear search
	$("#note-search .uico").click(function() {
		// Clear search
		$("#note-search input").val("");

		// Clear all items editing
		clearItem();

		// Show all items
		$(".item").show();
	});

	// Define secret key
	$("#keyNewStore").click(function() {
		//Clear error
		$("#key-new-error").html("");

		// Check inputs against regular expression
		if (!(LOCKER.REX.test($("#key-input1").val()) && LOCKER.REX.test($("#key-input2").val()))) {
			$("#key-new-error").html(LOCKER.MSG[23][arc.deviceLang()]);
			return;
		}

		// Check inputs match
		if ($("#key-input1").val() != $("#key-input2").val()) {
			$("#key-new-error").html(LOCKER.MSG[24][arc.deviceLang()]);
			return;
		}

		// Hide key definition UI
		$("#key-new").slideUp(100);

		// Store SHA256 of key and save
		LOCKER.data.appSOS.key = Crypto.SHA256($("#key-input1").val());
		listSave();

		// Store temporary unhashed key value in the DOM and load note
		$("#text").data("keyLive", $("#key-input1").val());
		$("#text").data("keyTime", arc.nowMS() + LOCKER.TTL);
		$("#key-input1, #key-input2").val("");
		textLoad($("#text").data("id"));
	});

	// Check secret key
	var keyCheck = function() {
		//Clear error
		$("#key-error").html("");

		// Check inputs against regular expression
		if (!LOCKER.REX.test($("#key-input").val())) {
			$("#key-error").html(LOCKER.MSG[23][arc.deviceLang()]);
			return;
		}

		// Check key against SHA256 hash
		if (Crypto.SHA256($("#key-input").val()) != LOCKER.data.appSOS.key) {
			$("#key-error").html(LOCKER.MSG[25][arc.deviceLang()]);
			return;
		}

		// Hide key definition UI
		$("#key-enter").slideUp(100);

		// Store temporary unhashed key value in the DOM and load note
		$("#text").data("keyLive", $("#key-input").val());
		$("#text").data("keyTime", arc.nowMS() + LOCKER.TTL);
		$("#key-input").val("");
		textLoad($("#text").data("id"));
	};
	$("#keyEnter").click(keyCheck);
	$("#key-input").keydown(function(e) {
		if (e.which == 13)
			keyCheck();
	});

	// Note change on editing
	$("#text-content").on("keyup", function(e) {
		textSave(false);
	});

	// Special action on editing
	$("#text-content").on("keydown", function(e) {

		// Tab => Indent
		if (e.keyCode == 9 && !e.shiftKey) {
			e.preventDefault();
			document.execCommand("indent", false, "");
		}

		// Shift Tab => Outdent
		if (e.keyCode == 9 && e.shiftKey) {
			e.preventDefault();
			document.execCommand("outdent", false, "");
		}
	});

	// Quit text edit
	$("#bar-text td:first-child").click(function() {
		// Force save now
		textSave(true);

		// Clear autoclose deadline
		LOCKER.closeTime = arc.FOREVER;

		// Hide text edit UI and restore its default view
		$("#text").hide();
		$("#text-content").hide().html("");
		$("#text-empty").show();

		// Show list view
		list();
		$("#list").slideDown(100);
	});

	// Text tools
	$("#toolbar td").mousedown(function(e) {
		e.preventDefault();
		switch($(this).attr("class")) {
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
		textSave();
	});

	// Toggle password change
	$("#pwd-toggle").click(function() {
		$("#pwd-new").toggle();
	});

	// Cancel password change
	$("#pwdNewCancel").click(function() {
		$("#pwd-new").slideUp();
	});

	// Password change
	$("#pwdNewStore").click(function() {
		$("#pwd-new-error").html("");

		// Check inputs against regular expression
		if (!(LOCKER.PWD.test($("#pwd-input1").val()) && LOCKER.PWD.test($("#pwd-input2").val()))) {
			$("#pwd-new-error").html(LOCKER.MSG[27][arc.deviceLang()]);
			return;
		}

		// Check inputs match
		if ($("#pwd-input1").val() != $("#pwd-input2").val()) {
			$("#pwd-new-error").html(LOCKER.MSG[28][arc.deviceLang()]);
			return;
		}

		arc.apiSession("user_password_update", {
			pwd : $("#pwd-input1").val()
		}, function(o) {
			if (o.code == "200")
				// Hide Password change UI
				$("#pwd-new").slideUp();
			else
				// Keep password change UI with error message
				$("#pwd-new-error").html(o.msg);
		});
	});

	// Printable list of notes
	$("#print-btn").click(function() {

		// No printable list if the key is not active
		if ($("#text").data("keyTime") == 0 || arc.nowMS() > $("#text").data("keyTime")) {
			alert(LOCKER.MSG[34][arc.deviceLang()]);
			return;
		}

		// Init, fill and show the list
		$("#print-list").html("");
		$("body").removeClass("shadow");
		$("#list").hide();
		$("#print").slideDown();

		// Build the list
		LOCKER.data.appSOS.list.forEach(function(note) {

			// Note title
			$("#print-list").append("<div class='print-note-title'>" + note.name + "</div><div class='print-note-content' id='pnc-" + note.id + "'></div>");

			// Note content
			arc.apiSession("data_down", {
				id : note.id
			}, function(o) {
				if (o.code != "200")
					return;

				// AES decrypt of text using MD5 hash of user key as encryption key
				$("#pnc-" + note.id).html(Crypto.AES.decrypt(o.data.data, Crypto.MD5($("#text").data("keyLive"))));
			});
		});
	});

	// Quit printable list
	$("#print .bar-head").click(function() {
		$("#print-list").html("");
		$("body").addClass("shadow");
		$("#print").hide();
		$("#list").slideDown();
	});
}

/* *************************************************************************************************
 * LOCKER: textSave
 * =================================================================================================
 * Purpose: Update UI and save encrypted text and list
 * Parameter(s) - force : If set to true save now, other save on timer arc.TIMER
 * Return: N/A
 *************************************************************************************************** */
function textSave(force) {
	// Upload text note and list at least every 5s  if not idle (see arc.TIMER)
	arc.delayed(function() {
		var id = $("#text").data("id");
		var now = arc.nowS();

		// Update latest save time in title and list
		$("#bar-text td:nth-child(2) >div:last-child").html(arc.getTime({
			"time" : new Date()
		}));
		$("#" + id + " .item-time").attr("locker-time", now);

		// Save AES encrypt of text using MD5 hash of user key as encryption key
		arc.apiSession("data_up", {
			id : id,
			data : Crypto.AES.encrypt($("#text-content").html(), Crypto.MD5($("#text").data("keyLive")))
		});
		listSave();
	}, force);

	// Update autoclose deadline
	LOCKER.closeTime = arc.nowMS() + LOCKER.AUTOCLOSE;
}

/* *************************************************************************************************
 * LOCKER: textLoad
 * =================================================================================================
 * Purpose: Load text from server, decrypt and display
 * Parameter(s) id = note ID
 * Return: N/A
 *************************************************************************************************** */

function textLoad(id) {
	// Download note from server
	arc.apiSession("data_down", {
		id : id
	}, function(o) {
		if (o.code != "200") {
			console.log("Text loading error", o.code, o.msg);
			return;
		}

		// Hide default UI
		$("#text-empty").hide();

		// Show text content
		if (o.data.data == "") {
			$("#text-content").html("").slideDown(100);
		} else {
			// AES decrypt of text using MD5 hash of user key as encryption key
			$("#text-content").html(Crypto.AES.decrypt(o.data.data, Crypto.MD5($("#text").data("keyLive")))).slideDown(100);
		}

		// Set autoclose deadline
		LOCKER.closeTime = arc.nowMS() + LOCKER.AUTOCLOSE;
	});

}

/* *************************************************************************************************
* LOCKER: list
* =================================================================================================
* Purpose: Build the note list UI
* Parameter(s) N/A
* Return: N/A
*************************************************************************************************** */

// List item template used to build the list UI
LOCKER.itemTemplate = "<tr class='item' id='%%id%%'><td><div class='uico'>&#xe3b0;</div><div class='uico'>&#xe3b2;</div></td><td><div class='item-name'><input disabled type='text' placeholder='%%ph%%' value='%%name%%' maxlength='64'></div><div class='item-mask'></div><div class='item-time' locker-time='%%time%%'>%%date%%</div><div class='item-del'></div></td><td class='uico'>&#xe366;</td></tr>";

function list() {

	if (LOCKER.data.appSOS.list.length == 0) {
		// No item in the list
		$("#list-empty").show();
		$("#list-full").hide();
		return;
	}

	// Clear the list view
	$("#list-full .item").remove();
	$("#list-empty").hide();
	$("#list-full").show();
	$("#list-full").data("semaphore", false);

	// Build the list
	LOCKER.data.appSOS.list.forEach(function(note) {
		var item = LOCKER.itemTemplate;
		item = item.replace("%%id%%", note.id);
		item = item.replace("%%name%%", note.name);
		item = item.replace("%%time%%", note.time);
		item = item.replace("%%ph%%", LOCKER.MSG[19][arc.deviceLang()]);
		item = item.replace("%%date%%", arc.getTime({
			"time" : new Date(note.time * 1000)
		}));
		$("#list-full").append(item);
	});

	// Prevent taphold to propagate to tap;
	$.event.special.tap.emitTapOnTaphold = false;

	// Enable/ disable name editing
	$(".item > td:nth-child(2)").taphold(function(e) {
		// Quit if note delete semaphore is set
		if ($("#list-full").data("semaphore"))
			return;

		if ($(this).find("input").prop("disabled")) {
			// Clear all items editing
			clearItem();

			// Enable this input
			$(this).find(".item-name").css("background-color", "#eee");
			$(this).find("input").css("background-color", "#eee").css("cursor", "text").prop("disabled", false).focus();
			// Hide the mask required to tap disabled input
			$(this).find(".item-mask").hide();
		} else {
			// Disable input
			$(this).find(".item-name").css("background-color", "#fff");
			$(this).find("input").css("background-color", "#fff").css("cursor", "pointer").prop("disabled", true);
		}
	});

	// Change name
	$(".item input").change(function() {
		// Clear all items editing
		clearItem();

		// Save list
		listSave();
	});

	// Move up item
	$(".item > td:first-child > div:first-child").click(function() {
		// Quit if note delete semaphore is set
		if ($("#list-full").data("semaphore"))
			return;

		// Clear all items editing
		clearItem();

		if ($(this).css("cursor") == "default")
			// No move up for the first item of the list
			return;

		// Move up
		var thisItem = $(this).parents(".item").first();
		thisItem.insertBefore($(thisItem).prev());

		// Save
		listSave();
	});

	// Move down item
	$(".item > td:first-child > div:last-child").click(function() {
		// Quit if note delete semaphore is set
		if ($("#list-full").data("semaphore"))
			return;

		// Clear all items editing
		clearItem();

		if ($(this).css("cursor") == "default")
			// No move down for the last item of the list
			return;

		// Move down
		var thisItem = $(this).parents(".item").first();
		thisItem.insertAfter($(thisItem).next());

		// Save
		listSave();
	});

	// Delete note
	$(".item > td:last-child").click(function() {
		// Quit if note delete semaphore is set
		if ($("#list-full").data("semaphore"))
			return;

		// Clear all items editing
		clearItem();

		var item = $(this).parent();

		// Set semaphore to prevent other UI interactions when deleting a note
		$("#list-full").data("semaphore", true);

		// Confirmation UI
		item.find(".item-mask").hide();
		item.css("background-color", "#FFCC00");
		item.find(".item-name, .item-time").hide();
		item.find(".item-del").html("<div class='btn'>" + LOCKER.MSG[20][arc.deviceLang()] + "</div><div class='btn'>" + LOCKER.MSG[21][arc.deviceLang()] + "</div>");
		item.find(".item-del").fadeIn();

		// Cancel delete
		item.find(".item-del > .btn:nth-child(2)").tap(function(e) {
			e.stopPropagation();
			e.preventDefault();

			// Clear semaphore
			$("#list-full").data("semaphore", false);

			// Reset UI
			item.find(".item-mask").show();
			item.css("background-color", "#fff");
			item.find(".item-del").html("").hide();
			item.find(".item-name, .item-time").fadeIn();
		});

		// Confirm delete
		item.find(".item-del > .btn:nth-child(1)").tap(function(e) {
			e.stopPropagation();
			e.preventDefault();

			// Clear semaphore
			$("#list-full").data("semaphore", false);

			// If the key is not 'alive' => Alert !
			if ($("#text").data("keyTime") == 0 || arc.nowMS() > $("#text").data("keyTime"))
				alert(LOCKER.MSG[29][arc.deviceLang()]);
			else
				// Reset UI and clear data
				item.fadeOut(function() {

					// Delete note on server
					arc.apiSession("data_delete", {
						id : item.attr("id")
					});

					// Remove list item and save
					item.remove();
					listSave();

					//
					if ($("#list-full .item").length == 0) {
						$("#list-full").hide();
						$("#list-empty").show();
					}
				});

		});
	});

	// Open note
	$(".item > td:nth-child(2)").tap(function() {

		// Quit if note delete semaphore is set
		if ($("#list-full").data("semaphore"))
			return;

		// Quit if editing is disabled
		if (!$(this).find("input").prop("disabled"))
			return;

		// Clear all items editing
		clearItem();

		// Hide list view
		$("#list").hide();

		// Set Text view title and last edition time date
		$("#bar-text td:nth-child(2) span").html($(this).find("input").val());
		$("#bar-text td:nth-child(2) >div:last-child").html($(this).find(".item-time").first().html());

		// Store note ID in DOM
		$("#text").data("id", $(this).parents(".item").first().attr("id"));

		// If the key is not yet set, show the key definition UI
		if (!LOCKER.data.appSOS.key) {
			$("#key-new").show();
			$("#text").slideDown(100, function() {
				$("#key-input1").focus();
			});
			return;
		}

		// If the key is not 'alive', clear former key data and show the key input UI
		if ($("#text").data("keyTime") == 0 || arc.nowMS() > $("#text").data("keyTime")) {
			$("#key-enter").show();
			$("#text").data("keyLive", false);
			$("#text").data("keyTime", 0);
			$("#text").slideDown(100, function() {
				$("#key-input").focus();
			});
			return;
		}

		// After this point, the key is alive then its TTL is refreshed and the text is loaded
		$("#text").data("keyTime", arc.nowMS() + LOCKER.TTL);
		$("#text").slideDown(100);
		textLoad($("#text").data("id"));

	});
}

//* ******************************* Clear all items editing UI ******************************* */
function clearItem() {
	$(".item-name").css("background-color", "#fff");
	$(".item input").css("background-color", "#fff").css("cursor", "pointer").prop("disabled", true);
	$(".item-mask").show();

}

/* *************************************************************************************************
 * LOCKER: listSave
 * =================================================================================================
 * Purpose: Parse the list UI and save the user data
 * Parameter(s) N/A
 * Return: N/A
 *************************************************************************************************** */

function listSave() {

	// Parse the UI list
	var l = [];
	$("#list-full .item").each(function() {
		l.push({
			"id" : $(this).attr("id"),
			"name" : $(this).find("input").val(),
			"time" : $(this).find(".item-time").attr("locker-time")
		});
	});

	// Update user profile
	LOCKER.data.appSOS.list = l;

	// Save
	arc.apiSession("user_data_set", {
		user_data : JSON.stringify(LOCKER.data)
	});
}

/* *************************************************************************************************
 * LOCKER: autoclose
 * =================================================================================================
 * Purpose: Loop to close automatically an open note according to LOCKER.AUTOCLOSE timer
 * Return: N/A
 *************************************************************************************************** */
function autoclose() {
	if (arc.nowMS() > LOCKER.closeTime) {
		// Clear autoclose deadline
		LOCKER.closeTime = arc.FOREVER;

		// Hide text edit UI and restore its default view
		$("#text").hide();
		$("#text-content").hide().html("");
		$("#text-empty").show();

		// Show list view
		list();
		$("#list").slideDown(100);

		if (arc.DEBUG)
			console.log("Locker: Note autoclosed");
	}
	if (arc.DEBUG)
		console.log("Locker: now", arc.nowS());
	// Loop every 5 seconds
	setTimeout(autoclose, 5000);
}

/* *************************************************************************************************
 * EVERYTHING STARTS HERE!
 *************************************************************************************************** */
function init() {

	// Merge default AuverCloud data with LOCKER specific application data
	arc = $.extend({}, arc, {
		// Debug mode
		DEBUG : false,
		// Set Application key. MUST for any server API call
		APP_KEY : "43a2348027cdb8d216f4fb15fd9e1e4f53a93ef40b65f",
		// List of supported languages: See localized messages below.
		APP_LANGUAGE_SUPPORTED : ["en", "fr"],
	});

	// Application tracking
	arc.api("utility_page_log");

	(function(i, s, o, g, r, a, m) {
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] ||
		function() {
			(i[r].q = i[r].q || []).push(arguments);
		}, i[r].l = 1 * new Date();
		a = s.createElement(o),
		m = s.getElementsByTagName(o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore(a, m);
	})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
	ga('create', 'UA-53810034-1', 'auto');
	ga('send', 'pageview');

	// Load localized messages
	arc.getScript("js/msg.js" + "?" + Math.round(new Date().getTime()), function() {

		// Check GET parameter(s) if any
		var param = {
			// API name
			"api" : arc.paramGet("api"),
			// Token ID
			"tid" : arc.paramGet("tid")
		};

		// Init localized messages
		localize(arc.deviceLang());

		// Init  UI events
		ui();

		// Start autoclose loop
		autoclose();

		// Init key TTL
		$("#text").data("keyLive", false);
		$("#text").data("keyTime", 0);

		// Init captcha-like challenge
		arc.api("utility_capcha_new", {
			method : "operation",
			height : 24,
			color : "444444"
		}, function(data) {
			$("#sub-capcha img").attr("src", arc.CAPCHA_PATH + data.data.token + ".png").data("token", data.data.token);
		});

		// If callback initiated by subscribe or password reset => Forward to API server
		if ((param.api == "user_subscriber_confirm" || param.api == "user_password_confirm" ) && param.tid) {

			// Exit if token already used
			if (param.tid != arc.cakeGet("tid"))
				arc.api(param.api, {
					tid : param.tid
				}, function(o) {

					// Store the burnt token in local storage in case of reload
					arc.cakeSet("tid", param.tid, arc.FOREVER);

					if (o.code != "200") {

						// Default confirmation error message
						var msg = o.msg;

						// Localized messages
						switch(o.code) {
						case "705":
							msg = LOCKER.MSG[2][arc.deviceLang()];
							break;
						case "600":
							msg = LOCKER.MSG[3][arc.deviceLang()];
							break;
						}

						// Error notification
						$("#notif-msg").html(msg);
						$("#notif").slideDown(100);
						return;
					}

					// Subscriber confirmed or New password => Close former session
					arc.userSessionDelete();

					switch(param.api) {
					case "user_subscriber_confirm":
						$("#notif-msg").html(LOCKER.MSG[1][arc.deviceLang()].replace("%%mailid%%", o.data.mailid));
						$("#login-email").val(o.data.mailid);
						break;
					case "user_password_confirm":
						$("#notif-msg").html(LOCKER.MSG[11][arc.deviceLang()]);
						break;
					}

					$("#notif").slideDown(100);

				}, false, "GET");
		}

		// Load  user session data if no error (i.e. valid session)
		if (!arc.apiSession("user_data_get", {}, function(o) {
				if (o.code != "200") {
					$("#public").show();
					return;
				}

				// Valid session => Let's go
				// Set application data
				LOCKER.data = JSON.parse(o.data.user_data);

				// Start private UI
				list();
				$("#list").slideDown(100);

			}, function(e) {

				// On error default public section
				$("#public").show();
			}))
			// If no local session parameter(s) => Public section
			$("#public").show();
	});
}

// ================================================================================================
// START EVENT: EITHER jQuery (Web app) OR deviceready (Cordova app)
// ================================================================================================
if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1)
	document.addEventListener('deviceready', init, false);
else
	$(init);
