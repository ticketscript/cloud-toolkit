#!/bin/bash

# Local directory
DIR=$(dirname "$0")

# Include common RDS tasks
source $DIR/config

COUNT_FILES=`find -name '*.field_backup.sql' -exec dirname {} \; | sort | uniq -c`
if [ !$COUNT_FILES ]; then
  echo 'No files to be imported'
  exit 0
fi

FAILS=0

echo "Restoring backed up fields values"
for i in *.field_backup.sql
do
  echo "Importing $i"
  mysql -h $DATABASE_HOST $DATABASE_NAME < $i
  if [ $? -gt 0 ]; then
    DATE=`date +%Y%m%d%H%M%S`
    echo "Import failed"
    mv $i "${i/field_backup/failed.$DATE}"
    FAILS=$((FAILS + 1))
  else
    rm -f $i
  fi
done

if [ $FAILS -gt 0 ]; then
  echo "Some imports failed. Check the *.failed.yyyymmddhhiiss.sql files for query errors"
  exit 1
fi

echo "DONE"
exit 0
