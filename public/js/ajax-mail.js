$(function () {

	// Get the form.
	var form = $('#registration-form');

	// Get the messages div.
	var formMessages = $('.form-messege');

	// Set up an event listener for the contact form.
	$(form).submit(function (e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		var formObject = toObject($(form).serializeArray());
		// Submit the form using AJAX.
		$.ajax("/api/attendee", {
			type: 'POST',
			data: JSON.stringify(formObject),
			contentType: 'application/json'
		})
			.done(function (response) {
				// Make sure that the formMessages div has the 'success' class.
				$(formMessages).removeClass('error');
				$(formMessages).addClass('success');

				// Set the message text.
				$(formMessages).html(response);

				// Clear the form.
				$('#registration-form input.info, #registration-form textarea').val('');
			})
			.fail(function (data) {
				// Make sure that the formMessages div has the 'error' class.
				$(formMessages).removeClass('success');
				$(formMessages).addClass('error');

				// Set the message text.
				if (data.responseText !== '') {
					$(formMessages).html(data.responseText);
				} else {
					$(formMessages).html('Oops! An error occured and your message could not be sent.');
				}
			});
	});

	// ---------------------
	// SLACK
	// ---------------------

	// Get the form.
	var slackForm = $('#slack-form');

	// Get the messages div.
	var slackMessages = $('.slack-messege');
	// Set up an event listener for the contact form.
	$(slackForm).submit(function (e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		var formObject = toObject($(slackForm).serializeArray());
		// Submit the form using AJAX.
		$.ajax("/api/slack/invite", {
			type: 'POST',
			data: JSON.stringify(formObject),
			contentType: 'application/json'
		})
			.done(function (response) {
				// Make sure that the formMessages div has the 'success' class.
				$(slackMessages).removeClass('error');
				$(slackMessages).addClass('success');

				// Set the message text.
				$(slackMessages).html(response);

				// Clear the form.
				$('#slack-form input.info, #slack-form textarea').val('');
			})
			.fail(function (data) {
				// Make sure that the formMessages div has the 'error' class.
				$(slackMessages).removeClass('success');
				$(slackMessages).addClass('error');

				// Set the message text.
				if (data.responseText !== '') {
					$(slackMessages).html(data.responseText);
				} else {
					$(slackMessages).html('Oops! An error occured and your message could not be sent.');
				}
			});
	});

	// TO Object
	var toObject = function objectifyForm(formArray) {
		var returnArray = {};
		for (var i = 0; i < formArray.length; i++) {
			returnArray[formArray[i]['name']] = formArray[i]['value'];
		}
		return returnArray;
	}

	// --------------
	// participant count
	// --------------
	var participantTracker = $('#participant-count');

	function updateParticipants() {
		$.ajax({ url: "/api/attendee/count", cache: false })
			.done(function (data) {
				participantTracker.html('<i  class="zmdi zmdi-accounts"></i>' + data.count + " registered so far, join us!")
			});
	}

	setInterval(function () {
		updateParticipants()
	}, 15000)
	updateParticipants()
});
