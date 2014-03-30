#!/bin/sh


# Stop slave rpelication and lock all tables
mysql -e 'STOP SLAVE;'
mysql -e 'FLUSH TABLES WITH READ LOCK;'

# @todo backup user data in ts2acceptance database first
# ./backup-user-data.sh

if [ -d /var/lib/mysql/ts2acceptance ]; then
  sudo rm -rvf /var/lib/mysql/ts2acceptance.old 2>/dev/null
  sudo mkdir /var/lib/mysql/ts2acceptance.old 2>/dev/null
  sudo mv -v /var/lib/mysql/ts2acceptance/* /var/lib/mysql/ts2acceptance.old/
else
  mysql -e 'CREATE DATABASE ts2acceptance;'
fi

# Copy
sudo su -c 'cp -av /var/lib/mysql/ticketscript2/* /var/lib/mysql/ts2acceptance/'

if [ $? -gt 0 ]; then
  sudo mv -v /var/lib/mysql/ts2acceptance.old /var/lib/mysql/ts2acceptance
fi

# Unlock tables and re-start slave replication
mysql -e 'UNLOCK TABLES;'
mysql -e 'FLUSH TABLES;'
mysql -e 'START SLAVE;'

# Offset AUTOINCREMENT columns
# mysql ts2acceptance < of

# @todo restore user data in ts2acceptance database
# ./restore-user-data.sh

