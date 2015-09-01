#!/bin/bash

# Local directory
DIR=$(dirname "$0")

# Account id to be exported
ACCOUNT_ID=$1

# Include DB configuration
source $DIR/config

EXPORT_DUMP_CONFIG="export_account_dump"
EXPORT_FILE="exports/$ACCOUNT_ID.sql"
touch $EXPORT_FILE

while read line; do
  if [[ $line =~ "ACCOUNT_ID" ]]
    then
    dump_line="${line/<ACCOUNT_ID>/$ACCOUNT_ID}"
    mysqldump --single-transaction -h $DATABASE_HOST $DATABASE_NAME $dump_line --no-create-info >> $EXPORT_FILE
  fi
done <$EXPORT_DUMP_CONFIG

exit 0;
