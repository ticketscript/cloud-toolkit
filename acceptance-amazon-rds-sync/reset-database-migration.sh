#!/bin/bash
#
# SQL migration folder 'reset' script
# Run this after the Acceptance database has been restored from production.
# This restores any database migration files that were previously run
#

# Local directory
DIR=`dirname $0`

source $DIR/config

# Reset 'migration' folder to origin/master
cd $DATABASE_MIGRATION_SOURCE_DIR && git stash && git fetch -q origin && git checkout -q master

# Backup previous sql-processed folder
if [ -d $DATABASE_MIGRATION_TARGET_DIR ]; then
	rm -rf $DATABASE_MIGRATION_TARGET_DIR.old 2>/dev/null
	mv $DATABASE_MIGRATION_TARGET_DIR $DATABASE_MIGRATION_TARGET_DIR.old
fi

# Create new database migration target dir
mkdir $DATABASE_MIGRATION_TARGET_DIR

# Copy already processed SQL files from origin/master to sql-procesesd/
cp $DATABASE_MIGRATION_SOURCE_DIR/*.sql $DATABASE_MIGRATION_TARGET_DIR/

# Reset Git working folder to previous branch
cd $DATABASE_MIGRATION_SOURCE_DIR && git checkout -q - && git stash show 2>/dev/null && git stash pop
