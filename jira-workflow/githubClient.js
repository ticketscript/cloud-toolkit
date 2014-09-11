var https        = require('https');
var Config       = require('./config.js');

/*
 * Constructor
 */
function GitHubClient() {

    var self = {

        headBranch: 'v',

        /**
         * hostname && auth credentials
         */
        HOSTNAME: Config.github.hostname,
        USERNAME: Config.github.username,
        PASSWORD: Config.github.pass,

        /**
         * create a pull request
         *
         * @param {string} repo          the repository
         * @param {string} base          the base branch
         * @param {string} title         the title of the pull request
         * @param {string} description   the description of the pull request
         */
        createPullRequest: function (repo, base, title, description) {

            // console.log('base is ' + base);
            self.getIssue(base, repo, title, description);
        },

        /**
         * complete the subtask: delete the subtask branch if it has been fully merged with the story
         *
         * @param {string} repo the name if the repository
         * @param {string} head the head branch (subtask branch)
         */
        completeSubTask: function(repo, head) {

            console.log(repo + ' ' + head);
            // console.log('base is ' + base);
            self.getParentIssue(head, repo);

            /*if (this.isBranchMerged('ticketscript', base, head)) {

                this.deleteBranch('ticketscript', repo, head);
            }*/
        },

        /**
         * create a branch in git based on master
         * 
         * @param {string} owner      the repo owner (organisation)
         * @param {string} repo       the name of the repository
         * @param {string} branchName the name to be deleted
         */
        createBranch: function(owner, repo, branchName) {
            var owner, repo, branchName,
                reference, master, branch;

            // Check if branch already exists first
            self.retrieveReference(owner, repo, 'heads/' + branchName, function(branch) {

                if (branch.ref) {
                    console.log('Branch ' + branchName + ' already exists');
                    return;
                }

                // Retrieve master branch SHA
                self.retrieveReference(owner, repo, 'heads/master', function(master) {

                    console.log('Master branch is at ' + master.object.sha);

                    var branchReference = {
                        'ref': 'refs/heads/' + branchName,
                        'sha': master['object']['sha']
                    };

                    console.log('Creating Branch ' + branchName + ' on ' + owner + '/' + repo);

                    self.call('POST', '/repos/' + owner + '/' + repo + '/git/refs', branchReference);
                });
            });
        },

        /**
         * Retrieve GitHub reference (branch/tag/commit)
         */
        retrieveReference: function(owner, repo, reference, callback) {
            var owner, repo, branchName, reference;
            self.call('GET', '/repos/' + owner + '/' + repo + '/git/refs/' + reference, null, callback);
        },

        /**
         * delete a branch in the repository
         *
         * @param {string} owner      the repo owner (account holder)
         * @param {string} repo       the name of the repository
         * @param {string} branchName the name to be deleted
         */
        deleteBranch: function (owner, repo, branchName) {
            var owner, repo, branchName;

            self.call('DELETE', '/repos/' + owner + '/' + repo + '/git/refs/heads/' + branchName);
        },

        /**
         * make a comparison to see if one branch has been merged into another
         *
         * @param {string} owner the repo owner (account holder)
         * @param {string} repo  the name of the repository
         * @param {string} base  the base branch
         * @param {string} head  the branch we comparing to the base
         *
         * @return {boolean}
         */
        isBranchMerged: function(owner, repo, base, head) {

            var isMerged = false;

            self.call('GET', '/repos/'+owner+'/'+repo+'/compare/'+base+'...'+head, function(parsedResponse) {
                if (parsedResponse['ahead_by'] === 0 && parsedResponse['total_commits'] === 0) {
                    console.log('is is merged');
                    isMerged = true;
                    self.deleteBranch('ticketscript', repo, head);
                } else {
                    console.log('it is not merged');
                    isMerged = false;
                }
            });

            return isMerged;
        },

        getIssue: function (issueKey, repo, title, description) {


            var issueKey,
                repo,
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
                    self.asyncPullRequest(repo, issueKey, title, description);
                });
            });
            req.end();
        },

        getParentIssue: function (issueKey, repo) {


            var issueKey,
                repo;

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

                        console.log('gonna delete the branch now . . .repo: ' + repo + ' issue key: ' + issueKey);
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

        asyncPullRequest: function (repo, base, title, description) {

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
                path: '/repos/ticketscript/' + repo + '/pulls',
                method: 'POST',
                headers: headers,
                auth: this.USERNAME + ':' + this.PASSWORD

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
                callback;

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
                if (callback) {

                    // Response handler
                    res.on('end', function() {

                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            var parsedResponse = JSON.parse(response);

                            // Pass parsed JSON response to callback function
                            callback(parsedResponse);

                        } else if (res.statusCode == 404) {
                            callback({});
                        } else {
                            console.error('Request failed', res.statusCode, res.headers);
                        }
                    });
                }
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
