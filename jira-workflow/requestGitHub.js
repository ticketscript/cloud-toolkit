var errorMessage = require('./errorMessages');
var GitHubClient = require('./githubClient');

/*
 * ConstructorRequestHandler
 */
function RequestGitHub() {

    var self = {

        client: null,
        issue:  null,

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

            // Construct GitHub API client
            this.client = new GitHubClient(requestParams.owner, requestParams.repo);

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
         * create a new branch
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
            this.client.createBranch(requestParams.branchName, reference);
        },

        /**
         * create a new pull request
         *
         * @param requestParams
         */
        createPullRequest: function (requestParams) {
            var requestParams,
                issue = this.getIssue();

            var base = issue.fields.parent.key,
                // No cross-repository pull requests for now
                head = issue.key,
                title = issue.fields.summary,
                description = issue.fields.description;

            // Create the pull request
            this.client.createPullRequest(base, head, title, description);
        },

        /**
         * complete the subtask
         *
         * @param requestParams
         */
        completeSubtask: function (requestParams) {
            var requestParams,
                base = this.getIssue().fields.parent.key,
                head = requestParams.head;

            // Check if sub task has is fully merged into base
            if (this.client.isBranchMerged(base, head)) {
                console.info('Deleting fully merged branch ' + head);
                // Delete sub task branch
                this.client.deleteBranch(head);
            } else {
                console.error(head + ' is not fully merged with ' + base);
            }
        }
    }

    return self;
};

module.exports = RequestGitHub
