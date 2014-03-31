#!/bin/sh
HOST="ts2acceptance.chw1qgpdiota.eu-west-1.rds.amazonaws.com"

mysql -h $HOST ticketscript2 < /home/admin/bin/admin_stats.sql
