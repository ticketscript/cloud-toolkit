#!/bin/bash

# Local directory
DIR=$(dirname "$0")
TABLE_NAME="$1"
PRIMARY_KEY="$2"
FIELD_NAME="$3"
WHERE="$4"

# Include common RDS tasks
source $DIR/config

if [ "$TABLE_NAME" == '' ]; then
  echo
  echo "ERROR - table name is missing" >&2
  exit 1
fi

if [ "$PRIMARY_KEY" == '' ]; then
  echo
  echo "ERROR - primary key is missing" >&2
  exit 1
fi

if [ "$FIELD_NAME" == '' ]; then
  echo
  echo "ERROR - field name is missing" >&2
  exit 1
fi

backup_filename=$TABLE_NAME"_"$PRIMARY_KEY"_"$FIELD_NAME".field_backup.sql"
query="SELECT CONCAT('UPDATE $TABLE_NAME SET $FIELD_NAME = ', QUOTE($FIELD_NAME), ' WHERE $PRIMARY_KEY = ', $PRIMARY_KEY, ';') FROM $TABLE_NAME $WHERE"

echo $backup_filename
echo "Backing up the field $FIELD_NAME from $TABLE_NAME to $backup_filename"
mysql -h $DATABASE_HOST -e "$query" $DATABASE_NAME > $backup_filename

# Remove first line of the file which includes piese of query
ex -c ':1d' -c ':wq' $backup_filename
# Fix wrong escaping. Replace \\ with \
sed -i 's/\\\\/\\/g' $backup_filename

echo "DONE"
exit 0
