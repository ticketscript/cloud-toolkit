var errorMessage = require('./errorMessages');
var GitHubClient = require('./githubClient');

/*
 * ConstructorRequestHandler
 */
function RequestGitHub() {

    var self = {

        client: GitHubClient(),

        /**
         * handle the action
         *
         * @param action
         * @param requestParams
         */
        handleAction: function (action, requestParams) {

            switch (action) {
                case 'create_branch':
                    this.createBranch(requestParams);
                    break;
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
        createBranch: function (requestParams) {
            // Fork from branch or master (default) ?
            var reference = 'heads/' + (requestParams.forkFrom ? requestParams.forkFrom : 'master');

            this.client.createBranch(requestParams.owner, requestParams.repo, requestParams.branchName, reference);
        },

        /**
         * create a new pull request
         *
         * @param requestParams
         */
        createPullRequest: function (requestParams) {
            this.client.createPullRequest(requestParams.repo, requestParams.head, 'title', 'description');
        },

        /**
         * complete the subtask
         *
         * @param requestParams
         */
        completeSubtask: function (requestParams) {

            this.client.completeSubTask(requestParams.repo, requestParams.head);
        }
    }

    return self;
};

module.exports = RequestGitHub
