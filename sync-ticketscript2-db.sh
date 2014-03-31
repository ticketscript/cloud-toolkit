#!/bin/bash
DATABASE="ticketscript2"
INSTANCE="ts2acceptance"
HOST="ts2acceptance.chw1qgpdiota.eu-west-1.rds.amazonaws.com"
OFFSET="2000000000"
USERDATA_SQL_FILE="temp.sql"

# Local directory
DIR=`dirname $0`

# Include common RDS tasks
source $DIR/rds-common.sh

# Fetch status
rds_get_instance_status

# Check for existing DB instance
if [ "$instance_status" == "available" ]; then
	
	# Backup user data in ts2acceptance database first
	./backup-user-data.sh $DATABASE $HOST $OFFSET 1>$USERDATA_SQL_FILE

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
mysql -h $HOST ticketscript2 < ./acceptance-tweaks.sql

# Offset AUTOINCREMENT columns
./set-autoincrement.sh $DATABASE $HOST $OFFSET

# Restore user data in ts2acceptance database
mysql -h $HOST $DATABASE <$USERDATA_SQL_FILE

# Clean exit!
exit 0
