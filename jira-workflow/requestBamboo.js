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

		handleAction: function(action, requestParams){

			var action,
                requestParams;

			switch (action) {

				case 'trigger':
					this.triggerProject(requestParams);
					break;
				default:
					throw errorMessage.invalidRequest('Unknown bamboo action: ' + action);
			}
		},

		triggerProject: function(requestParams) {
            var requestParams;
            
			this.client.triggerProject(requestParams.project, requestParams.stage || '', this.issueKey);
		}
	}

	return requestBamboo;
};

module.exports = RequestBamboo
