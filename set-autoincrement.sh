#!/bin/sh
DATABASE="$1"
ID="$2"

do_usage() {
  echo "Usage: $0 <database name> <primary key offset>"
  echo "Resets all auto_increment columns to the specified offset"
}

if [ "$DATABASE" == "" ]; then
  do_usage
  exit 1
fi

if [ "$ID" == "" ]; then
  do_usage
  exit 1
fi
 
while read table key ; do 
  mysql -e "ALTER TABLE $table AUTO_INCREMENT=$ID;" $DATABASE
done < table-list
