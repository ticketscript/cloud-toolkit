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
        owner: owner,
        repo: repo,
        HOSTNAME: Config.github.hostname,
        USERNAME: Config.github.username,
        PASSWORD: Config.github.pass,

        /**
         * create a pull request
         *
         * @param {string} base          the base branch
         * @param {string} title         the title of the pull request
         * @param {string} description   the description of the pull request
         */
        createPullRequest: function (base, title, description) {

            // console.log('base is ' + base);
            self.getIssue(base, self.repo, title, description);
        },

        /**
         * complete the subtask: delete the subtask branch if it has been fully merged with the story
         *
         * @param {string} head the head branch (subtask branch)
         * @param {string} parent issue key
         */
        completeSubTask: function(head, parentIssue) {

        },

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
                    console.log('Branch ' + branchName + ' already exists');
                    return;
                }

                console.log('Creating Branch ' + branchName + ' on ' + self.owner + '/' + self.repo + ' from ' + reference);

                // Retrieve master branch SHA
                self.retrieveReference(reference, function(baseReference) {
                    if (!baseReference.object) {
                        console.error('Reference ' + reference + ' does not exist');
                        return;
                    }

                    console.log(reference + ' is at ' + baseReference.object.sha);

                    // Create new branch base reference
                    branchReference = {
                        'ref': 'refs/heads/' + branchName,
                        'sha': baseReference.object.sha
                    };

                    self.call('POST', '/repos/' + self.owner + '/' + self.repo + '/git/refs', branchReference, function() {
                        console.log(branchReference.ref + ' created');
                    });
                });
            });
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
         * delete a branch in the repository
         *
         * @param {string} branchName the name to be deleted
         */
        deleteBranch: function (branchName) {
            var branchName;

            self.call('DELETE', '/repos/' + self.owner + '/' + self.repo + '/git/refs/heads/' + branchName);
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
                        console.log('is is merged');
                        isMerged = true;
                        self.deleteBranch(self.owner, self.repo, head);
                    } else {
                        console.log('it is not merged');
                        isMerged = false;
                    }
            });

            return isMerged;
        },

        getIssue: function (issueKey, title, description) {


            var issueKey,
                base,
                title;

            var parentKey = 'fff';

            var options = {
                hostname: Config.atlassian.hostname,
                path: '/rest/api/latest/issue/'+issueKey+'.json',
                method: 'GET',
                agent: false,
                auth: 'john:onetwothree'
            };

            var stringResponse = '';
            var req = https.request(options, function (res) {

                res.on('data', function (d) {

                    stringResponse += d.toString();
                });

                req.on('error', function(err) {
                    console.log(err);
                });

                res.on('end', function (d) {

                    var parsedResponse = JSON.parse(stringResponse);
                    //console.log(parsedResponse);
                    parentKey = parsedResponse['fields']['parent']['key'];
                    console.log(parentKey);
                    self.setHeadBranch(parentKey)
                    self.asyncPullRequest(self.repo, issueKey, title, description);
                });
            });
            req.end();
        },

        getParentIssue: function (issueKey) {


            var issueKey;

            var parentKey = 'fff';

            var options = {
                hostname: Config.atlassian.hostname,
                path: '/rest/api/latest/issue/'+issueKey+'.json',
                method: 'GET',
                agent: false,
                auth: 'john:onetwothree'
            };

            console.log(options);

            var stringResponse = '';
            var req = https.request(options, function (res) {

                res.on('data', function (d) {

                    stringResponse += d.toString();
                });

                req.on('error', function(err) {
                    console.log(err);
                });

                res.on('end', function (d) {

                    var parsedResponse = JSON.parse(stringResponse);
                    //console.log(parsedResponse);
                    parentKey = parsedResponse['fields']['parent']['key'];
                    console.log(parentKey);
                    self.setHeadBranch(parentKey)
                    //self.asyncPullRequest(repo, issueKey, title, description);
                    if (self.isBranchMerged('ticketscript', 'ticketscript', parentKey, issueKey)) {

                        console.log('gonna delete the branch now . . .repo: ' + self.repo + ' issue key: ' + issueKey);
                        //self.deleteBranch('ticketscript', repo, issueKey);
                    }
                });
            });
            req.end();
        },


        setHeadBranch: function(key) {

            //console.log('here is  a parent ' + key);
            self.headBranch = key;
            //console.log('ghchb: ' + self.headBranch);
        },

        asyncPullRequest: function (base, title, description) {

            console.log('async pull request! ' + self.headBranch);
            var message = 'merge of ' + base + ' into ' + self.headBranch;

            var data = {
                title: message,
                head: base,
                base: self.headBranch,
                description: message
            };

            console.log(data);

            var dataString = JSON.stringify(data);

            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length,
                'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
            };

            var options = {
                hostname: this.HOSTNAME,
                username: this.USERNAME,
                path: '/repos/ticketscript/' + self.repo + '/pulls',
                method: 'POST',
                headers: headers,
                auth: self.USERNAME + ':' + self.PASSWORD

            };
            console.log(options);

            var req = https.request(options, function (res) {
                /**
                 * @fixme to be finished
                 */
                //console.log(res);
            });

            req.write(dataString);
            req.end();
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

                var res,
                    response = '';

                // Collect data chunks into response
                res.on('data', function (chunk) {

                    var chunk;

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        response += chunk;
                    }
                });

                // Add response handler
                // Response handler
                res.on('end', function() {

                    if (res.statusCode >= 200 && res.statusCode < 300) {

                        var parsedResponse = JSON.parse(response);

                        // Pass parsed JSON response to callback function
                        callback(parsedResponse);

                    } else if (res.statusCode == 404) {
                        callback({});
                    } else {
                        console.error('Request failed: ' + res.headers.status);
                    }
                });
            });

            // Send request body
            if (body.length) {
                req.write(body);
            }

            req.end();
        }
    }

    return self;
};

module.exports = GitHubClient
