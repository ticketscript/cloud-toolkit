var errorMessage = require('./errorMessages');

/*
 * Constructor
 */
function BambooClient() {

	var bambooClient = {

		baseUrl: 'https://localhost/builds/rest/api/latest',
		triggerProject: function(plan, stage, branch){

			var plan,
					stage,
					branch,
					url;

			console.log('Triggered Bamboo project ' + params.project + ' - ' + params.stage 
								+ ' for branch ' + this.issueKey);

			url = this.sendRequest('GET', '/plan/' + plan);
		}
	}

	return bambooClient;
};

module.exports = BambooClient