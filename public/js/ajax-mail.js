$(function () {

	// Get the form.
	var form = $('#contact-form');
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
				$(formMessages).text(response);

				// Clear the form.
				$('#contact-form input.info, #contact-form textarea').val('');
			})
			.fail(function (data) {
				// Make sure that the formMessages div has the 'error' class.
				$(formMessages).removeClass('success');
				$(formMessages).addClass('error');

				// Set the message text.
				if (data.responseText !== '') {
					$(formMessages).text(data.responseText);
				} else {
					$(formMessages).text('Oops! An error occured and your message could not be sent.');
				}
			});
	});

});
