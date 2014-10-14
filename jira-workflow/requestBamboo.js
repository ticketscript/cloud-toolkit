var errorMessage = require('./errorMessages');
var BambooClient = require('./bambooClient');

/*
 * ConstructorRequestHandler
 */
function RequestBamboo(issueKey) {

	var requestBamboo = {

		issueKey: issueKey,
		client: BambooClient(),

		handleAction: function(requestParams){

			var action,
                requestParams;

			switch (requestParams.action) {

				case 'trigger':

		            var project = requestParams['project'];
		            var stage 	= requestParams['stage'] || '';

					this.client.triggerProject(project, stage, this.issueKey);
					break;

				default:
					throw errorMessage.invalidRequest('Unknown bamboo action: ' + action);
			}
		},
	}

	return requestBamboo;
};

module.exports = RequestBamboo
