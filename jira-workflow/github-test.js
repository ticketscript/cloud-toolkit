/**
 * file for development purposes only. to test the GithubClient, uncomment code as needed.
 *
 * usage: to run, checkout cloud-toolkit, cd to jira-workflow, type 'nodejs github-test.js'
 */

var GithubClient = require('./githubClient');

var client = GithubClient();
// client.createBranch('ticketscript', 'ticketscript', 'SBX-106');

// client.createPullRequest('cloud-toolkit', 'TSP-johnarch01', 'TSP-johnarch02', 'fdsa', 'fdsa');


// client.isBranchMerged('ticketscript', 'cloud-toolkit', 'TSP-johnarch01', 'TSP-johnarch02');


// client.deleteBranch('ticketscript', 'cloud-toolkit', 'TSP-johnarch01');