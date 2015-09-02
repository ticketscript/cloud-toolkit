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

    # Backup user data in target database first
    ./backup-user-data.sh $DATABASE_NAME $DATABASE_HOST $DATABASE_OFFSET 1>$DATABASE_USERDATA_SQL_FILE

    if [ "$?" -gt 0 ]; then
      echo "ERROR - Backup user data failed!" >&2
      exit 1
    fi

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

# Wait for the instance to be deleted
rds_wait_state

# Clean exit!
exit 0
