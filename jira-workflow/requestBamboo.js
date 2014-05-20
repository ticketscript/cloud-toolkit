var errorMessage = require('./errorMessages');
var BambooClient = require('./bambooClient');

/*
 * Constructor
 */
function RequestBamboo(issueKey) {

	var issueKey,
			requestBamboo = {

		issueKey: issueKey,
		client: BambooClient();

		handleAction: function(action, params){

			var action,
					params;

			switch (action) {

				case 'trigger':
					this.triggerProject(params[0], params[1]);
					break;

				default:
					throw errorMessage.invalidRequest('Unknown bamboo action: ' + action);
			}
		},

		triggerProject: function(params)) {
			var params;
			// Trigger Bamboo project
			this.client.trigger(params.project, params.stage, this.issueKey);
		}
	}

	return requestBamboo;
};

module.exports = RequestBamboo