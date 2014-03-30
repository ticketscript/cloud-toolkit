#!/bin/sh
DATABASE="$1"
OFFSET="$2"

while read table key ; do 
  mysqldump -d --where="$key >= $OFFSET" $DATABASE $table
done < table-list