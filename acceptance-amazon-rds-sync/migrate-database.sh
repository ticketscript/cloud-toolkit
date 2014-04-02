#!/bin/bash

# Local directory
DIR=$(dirname "$0")

source $DIR/config


do_usage() {
	echo "Usage: $0 <sql migration folder>"
	echo "Scans SQL migration folder for *.sql files and executes files on $DATABASE_NAME,"
	echo "while keeping track of previously executed files"
	exit 1
}

# Check source folder
if [ ! -d "$DATABASE_MIGRATION_SOURCE_DIR" ]; then
	do_usage
fi

# Check for previously executed SQL files
if [ "`ls $DATABASE_MIGRATION_TARGET_DIR/*.sql 2> /dev/null`" == "" ]; then
	echo "Please create $DATABASE_MIGRATION_TARGET_DIR first, and put all previously executed SQL migration files there" >&2
	exit 1
fi

for sql_file in `ls -1 $DATABASE_MIGRATION_SOURCE_DIR/*.sql`; do

	if [ ! -f "$DATABASE_MIGRATION_TARGET_DIR/$sql_file" ]; then
		# Execute new MySQL file
		mysql -h $DATABASE_HOST $DATABASE_NAME < $DATABASE_MIGRATION_SOURCE_DIR/$sql_file 1>/dev/null

		if [ $? -gt 0 ]; then
			echo "ERROR - Failed to execute $sql_file!" >&2
			exit 1
		fi

		# Copy migration file to 'executed' SQL migration file directory
		cp $DATABASE_MIGRATION_SOURCE_DIR/$sql_file $DATABASE_MIGRATION_TARGET_DIR/
		
	else

		# Compare SQL file
		diff_output=`diff $DATABASE_MIGRATION_SOURCE_DIR/$sql_file $DATABASE_MIGRATION_TARGET_DIR/$sql_file`

		if [ "$diff_output" != "" ]; then
			echo "WARNING - Changed detected in previously executed SQL file: $sql_file"
		fi
	fi

done

# Clean exit
exit 0
