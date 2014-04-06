/*
 * Factory for incoming HTTP requests
 */
var requestJira = require("./requestJira");

var requestFactory = {
	
	requestType: "",
	requestBody: "",

	create: function(request){
		// The HTTP request object
		var request, err;

		// Check HTTP request method
		if (request.method != 'POST') {
			err = { "message": "Unsupported method: " + request.method };
			throw err;
		}

		// Is JIRA end point ?
		if (request.url.match(/\/jira\/(.*)$/)) {
			this.requestType = 'jira';
		} else {
			// No end point for this request
			err = {"message": "Unknown endpoint: " + request.url};
			throw err;
		}

		// Read request body
		request.on('data', this.read);
		request.on('end', this.parse);
	},

	read: function(data){
		console.log(data);
		this.requestBody += data;
	},

	parse: function(){

		var jira = JSON.parse(this.requestBody);
		// console.log(jira);
	}

};

module.exports = requestFactory;