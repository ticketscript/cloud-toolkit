# Ticketscript automation middleware

This server supports the workflow automation at Ticketscript. It orchestrates the messages exchanged between JIRA, Bamboo and Github.

## Logging

TODO

## Development

The following steps are required in order to develop additional functionality for the Ticketscript middleware.

* Use the domain `middleware-dev.ticketscript.com` for development. A virtual host is configured on the management server as a reverse proxy to port 4445, which is the port number where the development server should be listening to.
* Create a reverse tunnel to the development machine for port 4445 with `ssh -R 4445:localhost:4445 admin@db.ticketscript.com`, now traffic for port 4445 is tunneled to the development machine
* Start the server on the development machine, make sure that the correct port is being used.

## Testing

Nodeunit is the unit testing framework used (https://github.com/caolan/nodeunit).

Nock is used in order to mock network traffic (https://github.com/pgte/nock)
