#!/bin/bash

# Local directory
DIR=$(dirname "$0")

# Include configuration and RDS common functions
source $DIR/config
source $DIR/rds-common

echo
echo "Creating new instance from $SNAPSHOT snapshot"

# Create snapshot
do_create_snapshot

# Clean exit!
exit 0
