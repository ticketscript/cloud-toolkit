/*
 * Factory for incoming HTTP requests
 */
var errorMessage = require('./errorMessages');

var requestJira = {	

	/*
	 * Validate jiraObj
	 */
	validate: function(){
		if (!(typeof this.webhookEvent == "string")) {
			 throw errorMessage.invalidRequest("No webhookEvent was provided");
		}

		if (!(typeof this.issue == "object")) {
			 throw errorMessage.invalidRequest("No issue was provided");
		}

		if (!(typeof this.issue.key == "string")) {
			 throw errorMessage.invalidRequest("No issue.key was provided");
		}

		if (!(typeof obj.changelog == "object")) {
			 throw errorMessage.invalidRequest("No changelog was provided");
		}

		if (!(typeof obj.changelog.items == "object")) {
			 throw errorMessage.invalidRequest("No changelog.items was provided");
		}
	},

	handle: function(action, issueKey){

		switch (action) {
			
			case 'create-branch':
			case 'build':
			case 'deploy':
				console.log('Action ' + action + ' called for issue ' + issueKey);
				break;

			default:
				throw errorMessage.invalidRequest("Unknown action called: " + action);
		}
	}

};

module.exports = requestJira;