#!/bin/bash
#
# Run this after the Acceptance database has been restored from production.
# This restores any database migration files that were previously run
#

# Local directory
DIR=`dirname $0`

source $DIR/config

# Reset 'migration' folder to origin/master
sudo -u ticketwww sh -c "cd $DATABASE_MIGRATION_SOURCE_DIR && git stash && git fetch -q origin && git checkout -q origin/master"

# Split file names on newline
IFS=$'\n'

for sql_file_path in `ls -1 $DATABASE_MIGRATION_TARGET_DIR/*.sql`; do

	# Get SQL migration file name
    sql_file=$(basename $sql_file_path)

	if [ ! -f "$DATABASE_MIGRATION_SOURCE_DIR/$sql_file" ]; then
		# Execute new MySQL file
		mysql -h $DATABASE_HOST $DATABASE_NAME < $sql_file_path 1>/dev/null

		# Check for MySQL migration result
		if [ $? -gt 0 ]; then
			echo "ERROR - Failed to execute $sql_file!" >&2
		fi
    fi
done

# Reset Git working folder to previous branch
sudo -u ticketwww sh -c "cd $DATABASE_MIGRATION_SOURCE_DIR && git checkout -q - && git stash pop"
