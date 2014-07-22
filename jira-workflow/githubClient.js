var Config = require('./config')
var https = require('https');
//var errorMessage = require('./errorMessages');

/*
 * Constructor
 */
function GitHubClient() {

    var githubClient = {

        /**
         * hostname && auth credentials, from an git-ignored config object
         */
        HOSTNAME: Config.github.hostname,
        USERNAME: Config.github.username,
        PASSWORD: Config.github.pass,

        /**
         * craete a pull request
         *
         * @param {string} planName the name of the build plan
         * @param {string} stage the stage of the build process
         * @param {string} branch the name of the jira story branch
         */
        createPullRequest: function (repo, head, base, title, description) {

            var data = {
                title: title,
                head: head,
                base: base,
                description: description
            };

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

            var req = https.request(options, function (res, resp, body) {
                /**
                 * @fixme to be finished
                 */
                console.log(res);
            });

            req.write(dataString);
            req.end();
        }
    }

    return githubClient;
};

module.exports = GitHubClient