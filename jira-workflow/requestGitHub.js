var errorMessage = require('./errorMessages');
var client = require('./githubClient');

/*
 * ConstructorRequestHandler
 */
function RequestGitHub() {

    var requestGitHub = {

        client: GitHubClient(),

        /**
         * handle the action
         *
         * @param action
         * @param requestParams
         */
        handleAction: function (action, requestParams) {

            switch (action) {
                case 'create_pull_request':
                    this.createPullRequest(requestParams);
                    break;
                case 'complete_subtask':
                    this.completeSubtask(requestParams);
                    break;

                default:
                    throw errorMessage.invalidRequest('Unknown github action: ' + action);
            }
        },

        /**
         * create a new pull request
         *
         * @param requestParams
         */
        createPullRequest: function (requestParams) {
            this.client.createPullRequest(requestParams.repo, requestParams.base, 'title', 'description');
        },

        /**
         * complete the subtask
         *
         * @param requestParams
         */
        completeSubtask: function (requestParams) {

            this.client.completeSubtask(requestParams.repo, requestParams.base, requestParams.head);
        }
    }

    return requestGitHub;
};

module.exports = RequestGitHub