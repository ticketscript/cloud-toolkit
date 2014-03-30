#!/bin/sh
DATABASE="$1"

# Create RDS snapshot from DBS3
rds-create-db-snapshot -i dbs3 -s dbs3-latest

# Restore acceptance database from snapshot
rds-restore-db-instance-from-snapshot "$DATABASE" -s dbs3-latest

# Migrate acceptance database params and database instance type
rds-modify-db-instance "$DATABASE" --db-instance-class db.m1.large --db-parameter-group-name ts2-default --apply-immediately true
