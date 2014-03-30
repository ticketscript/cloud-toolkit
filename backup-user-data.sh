#!/bin/sh
DATABASE="$1"
HOST="$2"
OFFSET="$3"

while read table key ; do 
  mysqldump -h $HOST -d --where="$key >= $OFFSET" $DATABASE $table
done < table-list
