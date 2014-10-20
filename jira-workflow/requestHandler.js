/*
 * Factory for incoming HTTP requests
 */
var requestBamboo   = require("./requestBamboo");
var requestGitHub   = require("./requestGitHub");


function RequestHandler() {
}

RequestHandler.prototype.handleRequest = function (request, response) {

    var request,
        response,
        responseCode,
        responseJson,
        err;

    // Standard HTTP response
    responseJson = {"success": true};
    responseCode = 200;

    // Handling request
    try {
        // Call selected request handler
        switch (request.params.type) {

            case 'bamboo':
                var handler = new requestBamboo(request.params.issueKey);
                break;

            case 'github':
                var handler = new requestGitHub(request.body.issue, request.params.owner, request.params.repo);
                break;

            default:
                throw new Error('Unknown handler type: ' + request.params.type);
        }

        // Handle the request
        responseJson.result = handler.handleAction(request.params);

    } catch (err) {
        console.error(err);

        if (typeof err.code == "integer") {
            responseCode = err.code;
        } else {
            responseCode = 500;
        }

        responseJson.success = false;
        responseJson.error = err;
    }

    // Send response
    response.status(responseCode);
    response.send(responseJson);
}

RequestHandler.prototype.handle = function (params) {
    var result = {};

    switch (params.action) {

        case 'create-branch':
        case 'build':
        case 'deploy':
            console.log('Action ' + params.action + ' called for issue ' + params.issueKey);
            break;

        default:
            throw errorMessage.invalidRequest("Unknown action called: " + params.action);
    }

    return result;
}

module.exports = RequestHandler
