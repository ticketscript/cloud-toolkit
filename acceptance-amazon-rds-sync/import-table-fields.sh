#!/bin/bash

# Local directory
DIR=$(dirname "$0")

# Include common RDS tasks
source $DIR/config

echo "Restoring backed up fields values"
for i in *.field_backup.sql
do
  echo "Importing $i"
  mysql -h $DATABASE_HOST $DATABASE_NAME < $i
done

# Remove sql files
rm -f *.field_backup.sql

echo "DONE"
exit 0
