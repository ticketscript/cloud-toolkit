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
	
		# Backup user data in ts2acceptance database first
		./backup-user-data.sh $DATABASE_NAME $DATABASE_HOST $DATABASE_OFFSET 1>$DATABASE_USERDATA_SQL_FILE

		if [ "$?" -gt 0 ]; then 
			echo "ERROR - Backup user data failed!" >&2
			exit 1
		fi

		# Destroy acceptance database
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

# Restore acceptance database from snapshot
./restore-db-from-slave.sh $INSTANCE

if [ "$?" -gt 0 ]; then 
	echo "ERROR - Restoring database instance from slave failed!" >&2
	exit 1
fi

# Apply MySQL tweaks
mysql -h $DATABASE_HOST $DATABASE_NAME < $DIR/post-migration-tweaks.sql 1>/dev/null

# Offset AUTOINCREMENT columns
./set-autoincrement.sh $DATABASE_NAME $DATABASE_HOST $DATABASE_OFFSET

# Reset database migration files
./reset-database-migration.sh $DATABASE_MIGRATION_SOURCE_DIR

# Sync diff migration files
./sync-migration.sh $DATABASE_MIGRATION_TARGET_DIR $DATABASE_MIGRATION_TARGET_DIR_DIFF $DATABASE_MIGRATION_SOURCE_DIR

# Re-run previously executed database migration files
./migrate-database.sh $DATABASE_MIGRATION_SOURCE_DIR

# Restore user data in ts2acceptance database
mysql -h $DATABASE_HOST $DATABASE_NAME <$DATABASE_USERDATA_SQL_FILE 1>/dev/null

# Clean exit!
exit 0
