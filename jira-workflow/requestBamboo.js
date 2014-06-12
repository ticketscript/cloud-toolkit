var errorMessage = require('./errorMessages');
var BambooClient = require('./bambooClient');

/*
 * ConstructorRequestHandler
 */
function RequestBamboo(issueKey) {

	var issueKey,
			requestBamboo = {

		issueKey: issueKey,
		client: BambooClient(),

		handleAction: function(action, params){

			var action,
                params;

			switch (action) {

				case 'trigger':
					this.triggerProject(params);
					break;

				default:
					throw errorMessage.invalidRequest('Unknown bamboo action: ' + action);
			}
		},

		triggerProject: function(params) {
            var params;
			this.client.triggerProject(params.project, params.stage, this.issueKey);
		}
	}

	return requestBamboo;
};

module.exports = RequestBamboo