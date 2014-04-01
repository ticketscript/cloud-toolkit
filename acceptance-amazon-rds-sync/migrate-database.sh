#!/bin/bash
DATABASE="ticketscript2"
HOST="ts2acceptance.chw1qgpdiota.eu-west-1.rds.amazonaws.com"
SOURCE_DIR="$1"
TARGET_DIR="$HOME/sql-migration"

# Local directory
DIR=`dirname $0`

do_usage() {
	echo "Usage: $0 <sql migration folder>"
	echo "Scans SQL migration folder for *.sql files and executes files on $DATABASE,"
	echo "while keeping track of previously executed files"
	exit 1
}

# Check source folder
if [ ! -d "$SOURCE_DIR"]; then
	do_usage()
fi

# Check for previously executed SQL files
if [ `ls $TARGET_DIR/*.sql &> /dev/null` == "" ]; then
	echo "Please create $TARGET_DIR first, and put all previously executed SQL migration files there" >&2
	exit 1
fi

for sql_file in `ls -1 $SOURCE_DIR/*.sql`; do

	if [ ! -f "$TARGET_DIR/$sql_file"]; then
		# Execute new MySQL file
		mysql -h $HOST $DATABASE < $TARGET_DIR/$sql_file 1>/dev/null

		if [ $? -gt 0 ]; then
			echo "ERROR - Failed to execute $sql_file!" >&2
			exit 1
		fi
	else

		# Compare SQL file
		DIFF=`diff $SOURCE_DIR/$sql_file $TARGET_DIR/$sql_file`

		if [ "$DIFF" != "" ]; then
			echo "WARNING - Changed detected in previously executed SQL file: $sql_file"
		fi
	fi

done

# Clean exit
exit 0
