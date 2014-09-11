var errorMessage = require('./errorMessages');
var GitHubClient = require('./githubClient');

/*
 * ConstructorRequestHandler
 */
function RequestGitHub() {

    var self = {

        client: GitHubClient(),
        issue: null,

        getIssue: function() {
            // Check if issue exists
            if (typeof self.issue != 'object') {
                throw errorMessage.invalidRequest('Issue details are missing in POST request body');
            }

            return self.issue;
        },

        setIssue: function (issue) {
            var issue;

            self.issue = issue;
        },

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
            var requestParams, reference;

            switch (requestParams.forkFrom) {

                case undefined:
                    // Fork from master (default)
                    reference = 'heads/master';
                    break;

                case 'parent':
                    // Fork from issues parent branch
                    reference = 'heads/' + this.getIssue().fields.parent.key;
                    break;

                default:
                    reference = 'heads/' + requestParams.forkFrom;

            }

            // Create branch
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
