#!/bin/bash

# Local directory
DIR=`dirname $0`

# Include common RDS tasks
source $DIR/config
source $DIR/rds-common

# Fetch status
rds_get_instance_status

# Check for existing DB instance
if [ "$instance_status" == "available" ]; then
	
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
fi

# Wait for instance to complete
while [[ "$instance_status" == "deleting" ]]; do
	echo -n "."
	rds_get_instance_status
	sleep 25
done

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

# Restore user data in ts2acceptance database
mysql -h $DATABASE_HOST $DATABASE_NAME <$DATABASE_USERDATA_SQL_FILE 1>/dev/null

# Clean exit!
exit 0
