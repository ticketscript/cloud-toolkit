/*
 * Constructor for errors
 */
function InvalidRequest(detail) {
	this.message = 'Invalid Request';
	this.stack = (new Error()).stack.split('\n');
	this.code = 400;
	this.detail = detail;
}

InvalidRequest.prototype = new Error;


// Export constructor function
module.exports.invalidRequest = function(detail) {
	return new InvalidRequest(detail);
};