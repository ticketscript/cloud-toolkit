#!/bin/sh
DATABASE="ticketscript2"
INSTANCE="ts2acceptance"
OFFSET="2000000000"
USERDATA_SQL_FILE="temp.sql"

# Backup user data in ts2acceptance database first
./backup-user-data.sh $DATABASE $OFFSET 1>$USERDATA_SQL_FILE

if [ "$?" -gt 0 ]; then 
	echo "ERROR - Backup user data failed!" >&2
	exit 1
fi

# Restore acceptance database from snapshot
./restore-db-from-slave.sh $INSTANCE

if [ "$?" -gt 0 ]; then 
	echo "ERROR - Restoring database instance from slave failed!" >&2
	exit 1
fi

# Offset AUTOINCREMENT columns
./set-autoincrement.sh $DATABASE $OFFSET

# Restore user data in ts2acceptance database
mysql $DATABASE <$USERDATA_SQL_FILE
