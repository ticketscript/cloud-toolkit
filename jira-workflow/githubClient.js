var Config = require('./config')
var https = require('https');
//var errorMessage = require('./errorMessages');

/*
 * Constructor
 */
function GitHubClient() {

    var githubClient = {

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
            githubClient.getIssue(base, repo, title, description);
        },

        /**
         * complete the subtask: delete the subtask branch if it has been fully merged with the story
         *
         * @param {string} repo the name if the repository
         * @param {string} base the base branch (story branch)
         * @param {string} head the head branch (subtask branch)
         */
        completeSubTask: function(repo, base, head) {

            if (this.isBranchMerged('ticketscript', base, head)) {

                this.deleteBranch('ticketscript', repo, head);
            }
        },

        /**
         * delete a branch in the repository
         *
         * @param {string} owner      the repo owner (account holder)
         * @param {string} repo       the name of the repository
         * @param {string} branchName the name to be deleted
         */
        deleteBranch: function (owner, repo, branchName) {

            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': 0,
                'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
            };

            var options = {
                hostname: this.HOSTNAME,
                path: '/repos/'+owner+'/'+repo+'/git/refs/heads/'+branchName,
                method: 'DELETE',
                headers: headers,
                auth: this.USERNAME + ':' + this.PASSWORD

            };

            var req = https.request(options, function (res) {

                var stringResponse = '';
                res.on('data', function (d) {
                    stringResponse += d.toString();
                });

                res.on('end', function (d) {
                });

            });
            req.end();
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

            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': 0,
                'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
            };

            var options = {
                hostname: this.HOSTNAME,
                path: '/repos/'+owner+'/'+repo+'/compare/'+base+'...'+head,
                method: 'GET',
                headers: headers,
                auth: this.USERNAME + ':' + this.PASSWORD

            };

            var req = https.request(options, function (res) {

                var stringResponse = '';
                res.on('data', function (d) {
                    stringResponse += d.toString();
                });

                res.on('end', function (d) {

                    var parsedResponse = JSON.parse(stringResponse);
                    if (parsedResponse['ahead_by'] === 0 && parsedResponse['total_commits'] === 0) {

                        isMerged = true;
                    } else {
                        isMerged = false;
                    }
                });

            });
            req.end();

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
                    githubClient.setHeadBranch(parentKey)
                    githubClient.asyncPullRequest(repo, issueKey, title, description);
                });
            });
            req.end();
        },

        setHeadBranch: function(key) {

            //console.log('here is  a parent ' + key);
            githubClient.headBranch = key;
            //console.log('ghchb: ' + githubClient.headBranch);
        },

        asyncPullRequest: function (repo, base, title, description) {

            console.log('async pull request! ' + githubClient.headBranch);
            var message = 'merge of ' + base + ' into ' + githubClient.headBranch;

            var data = {
                title: message,
                head: base,
                base: githubClient.headBranch,
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
        }
    }

    return githubClient;
};

module.exports = GitHubClient