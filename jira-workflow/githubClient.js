var https        = require('https');
var Config       = require('./config.js');

/*
 * Constructor
 */
function GitHubClient(owner, repo) {

    var owner, repo;
    var self = {

        headBranch: 'v',

        /**
         * hostname && auth credentials
         */
        HOSTNAME: Config.github.hostname,
        USERNAME: Config.github.username,
        PASSWORD: Config.github.pass,

        owner: owner,
        repo: repo,

        /**
         * create a branch in git based on master
         *
         * @param {string} branchName the name to be created
         * @param {string} branchStart branch to fork from (default master)
         */
        createBranch: function(branchName, reference) {

            var branchName, reference,
                branchReference, branchStart, baseReference;

            // Check if branch already exists first
            self.retrieveReference('heads/' + branchName, function(branchReference) {

                if (branchReference.ref) {
                    logger.warn('Branch ' + branchName + ' already exists');
                    return;
                }

                logger.info('Creating Branch ' + branchName + ' on ' + self.owner + '/' + self.repo + ' from ' + reference);

                // Retrieve master branch SHA
                self.retrieveReference(reference, function(baseReference) {
                    if (!baseReference.object) {
                        logger.error('Reference ' + reference + ' does not exist');
                        return;
                    }

                    logger.info(reference + ' is at ' + baseReference.object.sha);

                    // Create new branch base reference
                    branchReference = {
                        'ref': 'refs/heads/' + branchName,
                        'sha': baseReference.object.sha
                    };

                    self.call('POST', '/repos/' + self.owner + '/' + self.repo + '/git/refs', branchReference, function() {
                        logger.info(branchReference.ref + ' created');
                    });
                });
            });
        },

        /**
         * Create a new pull request
         * @param {string} base branch
         * @param {string} head branch
         * @param {string} title for the pull request
         * @param {string} description of the pull request
         */
        createPullRequest: function (base, head, title, description) {
            var base, head, title, description;

            var data = {
                title: title,
                body: description,
                head: head,
                base: base,
            };

            // Send create pull request API call
            self.call(
                'POST',
                '/repos/' + self.owner + '/' + self.repo + '/pulls',
                data,
                function(response) {
                    logger.info('Pull request created for ' + head + ' into ' + base);
                }
            );
        },

        /**
         * delete a branch in the repository
         *
         * @param {string} branchName the name to be deleted
         */
        deleteBranch: function (branchName) {
            var branchName;

            self.call('DELETE', '/repos/' + self.owner + '/' + self.repo + '/git/refs/heads/' + branchName);
        },

        /**
         * Retrieve GitHub reference (branch/tag/commit)
         *
         * @param {string} reference    git reference to a branch, tag or commit
         * @param {function} callback   callback function
         */
        retrieveReference: function(reference, callback) {
            var branchName, reference;
            self.call('GET', '/repos/' + self.owner + '/' + self.repo + '/git/refs/' + reference, null, callback);
        },

        /**
         * make a comparison to see if one branch has been merged into another
         *
         * @param {string} base  the base branch
         * @param {string} head  the branch we comparing to the base
         *
         * @return {boolean}
         */
        isBranchMerged: function(base, head) {

            var isMerged = false;

            self.call(
                'GET',
                '/repos/' + self.owner + '/' + self.repo + '/compare/' + base + '...' + head,
                null,
                function(parsedResponse) {
                    if (parsedResponse['ahead_by'] === 0 && parsedResponse['total_commits'] === 0) {
                        isMerged = true;
                        self.deleteBranch(self.owner, self.repo, head);
                    } else {
                        isMerged = false;
                    }
            });

            return isMerged;
        },

        /**
         * API call to GitHub
         *
         * @param {string} method the https method
         * @param {string} url the path for the API call
         * @param {string} HTTP request body
         * @param {function} callback function when request completes
         */
        call: function(method, path, body, callback) {
            var method,
                path,
                body = body ? JSON.stringify(body) : '',
                callback = callback || function() { };

            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': body.length,
                'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
            };

            var options = {
                hostname: self.HOSTNAME,
                path: path,
                method: method,
                headers: headers,
                auth: self.USERNAME + ':' + self.PASSWORD
            };

            // Start HTTPS request
            var req = https.request(options, function (res) {
                logger.debug('Outgoing Request - GitHub');
                logger.debug('URL: ' + options.path);
                logger.debug('Method: ' + options.method);
                var res,
                    response = '';

                // Collect data chunks into response
                res.on('data', function (chunk) {
                    response += chunk;
                });

                // Add response handler
                // Response handler
                res.on('end', function() {
                    logger.debug('Incoming Response - GitHub');
                    logger.debug('Status code: ' + res.statusCode);
                    logger.debug('Body: ' + response);
                    var parsedResponse = JSON.parse(response);
                    if (res.statusCode >= 200 && res.statusCode < 300) {

                        // Pass parsed JSON response to callback function
                        callback(parsedResponse);

                    } else {
                        if (res.statusCode == 404) {
                            callback({});
                        }
                        logger.warn('Status code: ' + res.statusCode + ', message: ' + parsedResponse['message']);
                    }
                });
            });

            // Send request body
            if (body.length) {
                req.write(body);
            }

            // Add error handler
            req.on('error', function (err) {
                var err;

                logger.error('' + err);
            });

            req.end();
        }
    }

    return self;
};

module.exports = GitHubClient
