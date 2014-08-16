#!/bin/bash

# Local directory
DIR=$(dirname "$0")

# Include common RDS tasks
source $DIR/config
source $DIR/rds-common

# Fetch status
rds_get_instance_status

# Check DB instance status
case "$instance_status" in

	"DBInstanceNotFound")
		# Database instance does not exist
		;;

	"available")
	
		# Backup user data in target database first
		./backup-user-data.sh $DATABASE_NAME $DATABASE_HOST $DATABASE_OFFSET 1>$DATABASE_USERDATA_SQL_FILE

		if [ "$?" -gt 0 ]; then 
			echo "ERROR - Backup user data failed!" >&2
			exit 1
		fi

		# Destroy target database
		./destroy-db-instance.sh  $INSTANCE

		if [ "$?" -gt 0 ]; then
			echo "ERROR - Failed to destroy database instance $INSTANCE" >&2
			exit 1
		fi
		;;

	"deleting")

		# Wait for instance to complete
		while [[ "$instance_status" == "deleting" ]]; do
			echo -n "."
			rds_get_instance_status
			sleep 25
		done
		;;

	"creating")
		# DB Instance is already being createdd
		;;

	"modifying")
		# DB Instance is already being modified
		;;

	*)
		echo
		echo "ERROR - Unknown instance status: $instance_status" >&2
		exit 1

esac

# Restore target database from snapshot
./restore-db-from-slave.sh $INSTANCE

if [ "$?" -gt 0 ]; then 
	echo "ERROR - Restoring database instance from slave failed!" >&2
	exit 1
fi

# Apply MySQL tweaks
mysql -h $DATABASE_HOST $DATABASE_NAME < $DIR/post-migration-tweaks.sql 1>/dev/null

# Offset AUTOINCREMENT columns
./set-autoincrement.sh $DATABASE_NAME $DATABASE_HOST $DATABASE_OFFSET

# Execute database migration files
./execute-migration.sh

# Restore user data in target database
mysql -h $DATABASE_HOST $DATABASE_NAME <$DATABASE_USERDATA_SQL_FILE 1>/dev/null

# Clean exit!
exit 0
