#!/bin/bash
INSTANCE="$1"

# Local directory
DIR=$(dirname "$0")

# Include common RDS tasks
source $DIR/config
source $DIR/rds-common


#
# Create database instance
#

# Check instance status
rds_get_instance_status

echo -n "Instance $INSTANCE status: $instance_status"

case "$instance_status" in

	"available")

		rds-delete-db-instance -f --skip-final-snapshot --db-instance-identifier $INSTANCE
		rds_get_instance_status
		;;

	"deleting")
		;;

	*)
		echo
		echo "ERROR - Unknown instance status: $instance_status" >&2
		exit 1

esac

# Wait for instance to complete
while [[ "$instance_status" == "deleting" ]]; do
	echo -n "."
	rds_get_instance_status
	sleep 25
done

echo

# Clean exit!
exit 0
