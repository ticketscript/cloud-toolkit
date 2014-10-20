var errorMessage = require('./errorMessages');
var GitHubClient = require('./githubClient');

/*
 * ConstructorRequestHandler
 */
function RequestGitHub(issue, owner, repo) {
    // Check if issue exists
    if (typeof issue != 'object') {
        throw errorMessage.invalidRequest('Issue details are missing in POST request body');
    }

    var requestGitHub = {
        /**
         * handle the action
         *
         * @param action
         * @param requestParams
         */
        issue: issue,
        client: GitHubClient(owner, repo),
        handleAction: function (requestParams) {
            switch (requestParams.action) {
                case 'create_branch':
                    this.createBranch(requestParams);
                    break;

                case 'create_pull_request':
                    this.createPullRequest(requestParams);
                    break;

                case 'delete_branch':
                    this.deleteBranch(requestParams);
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
                    reference = 'heads/' + this.issue.fields.parent.key;
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
            var base = this.issue.fields.parent.key,
                // No cross-repository pull requests for now
                head = this.issue.key,
                title = this.issue.fields.summary,
                description = this.issue.fields.description;

            // Create the pull request
            this.client.createPullRequest(base, head, title, description);
        },

        /**
         * Delete a branch, if fully merged.
         *
         * @param requestParams
         */
        deleteBranch: function (requestParams) {
            var base,
                head = this.issue.key;

            if (this.issue.fields.parent) {
                // Request coming from a technical task
                base = this.issue.fields.parent.key;
            } else {
                base = 'heads/master';
            }

            this.client.deleteBranchIfMerged(base, head);
        }
    }

    return requestGitHub;
};

module.exports = RequestGitHub
