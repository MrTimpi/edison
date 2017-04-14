$(function () {

	// Get the form.
	var form = $('#registration-form');
	var toObject = function objectifyForm(formArray) {
		var returnArray = {};
		for (var i = 0; i < formArray.length; i++) {
			returnArray[formArray[i]['name']] = formArray[i]['value'];
		}
		return returnArray;
	}
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

});
