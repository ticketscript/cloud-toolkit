#!/bin/sh
DATABASE="$1"
HOST="$2"
ID="$3"

do_usage() {
  echo "Usage: $0 <database name> <host> <primary key offset>"
  echo "Resets all auto_increment columns to the specified offset"
}

if [ "$DATABASE" == "" ]; then
  do_usage
  exit 1
fi

if [ "$HOST" == "" ]; then
  do_usage
  exit 1
fi
 
if [ "$ID" == "" ]; then
  do_usage
  exit 1
fi
 
while read table key ; do 
  mysql -h $HOST -e "ALTER TABLE $table AUTO_INCREMENT=$ID;" $DATABASE 1>/dev/null
done < table-list
