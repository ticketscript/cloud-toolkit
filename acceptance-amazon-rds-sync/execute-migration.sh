#!/bin/bash
#
# Run this after the Acceptance database has been restored from production.
# This restores any database migration files that were previously run
#

# Local directory
DIR=`dirname $0`

source $DIR/config

# Reset 'migration' folder to origin/master
cd $DATABASE_MIGRATION_SOURCE_DIR ; git stash clear && git stash save ; git fetch -q origin && git checkout -q master

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
cd $DATABASE_MIGRATION_SOURCE_DIR && git checkout -q - && git stash pop

# run migration scripts with scripts/migrate if available
# the two vars should be set up in the config file
echo
if [ -n "$MIGRATE_ENV" -a -n "$MIGRATE_BIN" -a -f "$MIGRATE_BIN" ]; then
    echo "Executing new-style migration scripts"
    $MIGRATE_BIN $MIGRATE_ENV --auto-install --continue-on-error latest
else
    echo "WARNING: \$MIGRATE_ENV is not set, or could not run \$MIGRATE_BIN"
    echo "Skipping new-style migration scripts execution"
fi
