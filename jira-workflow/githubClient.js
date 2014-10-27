var https        = require('https');
var Config       = require('./config.js');

/*
 * Constructor
 */
function GitHubClient(owner, repo) {
    var self = {
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
         * @param {string} branch: the name to be created
         * @param {string} reference: branch to fork from
         */
        createBranch: function(branch, reference) {
            // Check if branch already exists first
            self.retrieveReference('heads/' + branch, function(branchReference) {

                if (branchReference.ref) {
                    logger.warn('Branch ' + branch + ' already exists');
                    return;
                }

                logger.info('Creating Branch ' + branch + ' on ' + self.owner + '/' + self.repo + ' from ' + reference);

                // Retrieve master branch SHA
                self.retrieveReference(reference, function(status, response) {
                    if (!response.object) {
                        logger.error('Reference ' + reference + ' does not exist');
                        return;
                    }

                    logger.info(reference + ' is at ' + response.object.sha);

                    // Create new branch base reference
                    branchReference = {
                        'ref': 'refs/heads/' + branch,
                        'sha': response.object.sha
                    };

                    self.call(
                        'POST', '/repos/' + self.owner + '/' + self.repo + '/git/refs',
                        branchReference,
                        function(status, response) {
                            switch (status) {
                                case 201:
                                    logger.info(response.ref + ' created in GitHub');
                                    break;
                                default:
                                    logger.warn('Status code: ' + status + ', message: ' + response);
                            }
                        }
                    );
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
                function(status, response) {
                    switch (status) {
                        case 201:
                            logger.info('Pull request created for ' + head + ' into ' + base);
                            break;
                        case 422:
                            for (var i = 0; i < response.errors.length; i++) {
                                logger.error(i + ': ' + response.errors[i].message);
                            }
                            break;
                        default:
                            logger.warn('Status code: ' + status + ', response: ' + response);
                    }
                }
            );
        },

        /**
         * delete a branch in the repository
         *
         * @param {string} branchName the name to be deleted
         */
        deleteBranchIfMerged: function (base, head) {
            self.isBranchMerged(base, head, function(isMerged) {
                if(isMerged) {
                    logger.info('Deleting fully merged branch ' + head);
                    self.call(
                        'DELETE',
                        '/repos/' + self.owner + '/' + self.repo + '/git/refs/heads/' + head, 
                        null,
                        function(status, response){
                            switch (status) {
                                case 204:
                                    logger.info('Branch ' + head + ' deleted from GitHub');
                                    break;
                                default:
                                    logger.warn('Status code: ' + status + ', response: ' + response);
                            }
                        }
                    );
                } else {
                    logger.error(head + ' is not fully merged with ' + base);
                }
            });
        },

        /**
         * Retrieve GitHub reference (branch/tag/commit)
         *
         * @param {string} reference    git reference to a branch, tag or commit
         * @param {function} callback   callback function
         */
        retrieveReference: function(reference, callback) {
            self.call('GET', '/repos/' + self.owner + '/' + self.repo + '/git/refs/' + reference, null, callback);
        },

        /**
         * make a comparison to see if one branch has been merged into another. Callback is used to
         * propagate results.
         *
         * @param {string} base  the base branch
         * @param {string} head  the branch we comparing to the base
         * @param {function} callback function
         */
        isBranchMerged: function(base, head, callback) {
            self.call(
                'GET',
                '/repos/' + self.owner + '/' + self.repo + '/compare/' + base + '...' + head,
                null,
                function(status, response) {
                    //TODO make error more generic!
                    if (status == 404){
                        logger.warn('Status: ' + status + ', message: ' + response.message);
                    } else {
                        isMerged = response['ahead_by'] === 0 && response['total_commits'] === 0;
                        callback(isMerged);
                    }
            });
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
            var body = body ? JSON.stringify(body) : '',
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
            logger.debug('Outgoing Request - GitHub');
            logger.debug('URL: ' + options.path);
            logger.debug('Method: ' + options.method);
            var req = https.request(options, function (res) {
                var response = '',
                    parsedResponse = {};

                // Collect data chunks into response
                res.on('data', function (chunk) {
                    response += chunk;
                });

                // Response handler
                res.on('end', function() {
                    logger.debug('Incoming Response - GitHub');
                    logger.debug('Status code: ' + res.statusCode);
                    logger.debug('Body: ' + response);
                    if (response.length > 0) {
                        parsedResponse = JSON.parse(response);
                    }

                    if (callback) {
                        callback(res.statusCode, parsedResponse);
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
