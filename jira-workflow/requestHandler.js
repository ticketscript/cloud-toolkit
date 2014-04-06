/*
 * Factory for incoming HTTP requests
 */
var requestJira = require("./requestJira");
var requestBamboo = require("./requestBamboo");
// var errorMessage = require('./errorMessages');

function RequestHandler() {
}

RequestHandler.prototype.handleRequest = function(request, response){
	
	var request,
			response,
			responseCode,
			responseJson,
			err;

	// Standard HTTP response
	responseJson = {"success": true};
	responseCode = 200;

	// Handling request
	try {

		// Call selected request handler
		console.log(typeof request.body);

		switch (request.params.type) {

			case 'bamboo':
				var handler = new requestBamboo(request.params.issueKey);

				// Get request object
				responseJson.result = handler.handleAction(request.params.action, request.params);
				break;

			default:
				throw new Error('Unknown handler type: ' + request.params.type);
		}

	} catch (err) {
		if (typeof err.code == "integer") {
			responseCode = err.code;
		} else {
			responseCode = 500;
		}

		responseJson.success = false;
		responseJson.error = err;
	}

	console.log(responseJson);

	// Send response
	response.status(responseCode);
	response.send(responseJson);
}

RequestHandler.prototype.handle = function(params) {
	var result = {};

	switch (params.action) {

		case 'create-branch':
		case 'build':
		case 'deploy':
			console.log('Action ' + params.action + ' called for issue ' + params.issueKey);
			break;

		default:
			throw errorMessage.invalidRequest("Unknown action called: " + params.action);
	}

	return result;
}


module.exports = RequestHandler