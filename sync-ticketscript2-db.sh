#!/bin/sh
DATABASE="ts2acceptance"
OFFSET="2000000000"
USERDATA_SQL_FILE="temp.sql"

# Backup user data in ts2acceptance database first
./backup-user-data.sh $DATABASE $OFFSET 1> $USERDATA_SQL_FILE

# Restore acceptance database from snapshot
./restore-db-from-slave.sh $DATABASE

# Offset AUTOINCREMENT columns
./set-autoincrement.sh $DATABASE $OFFSET

# Restore user data in ts2acceptance database
mysql $DATABASE < $USERDATA_SQL_FILE
