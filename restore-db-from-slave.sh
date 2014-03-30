#!/bin/sh
INSTANCE="$1"
SNAPSHOT="dbs3-latest"

rds_get_snapshot_status() {
	snapshot_status="creating"

	# Retrieve snapshot info
	snapshot_info=`rds-describe-db-snapshots --db-snapshot-identifier "$SNAPSHOT" --show-xml`

	# Get snapshot status from info
	if [[ $snapshot_info =~ "<Status>([a-z]+)</Status>" ]]; then
		snapshot_status="${BASH_REMATCH[1]}"
	else
		echo 'ERROR - failed to get snapshot status from '
		echo $snapshot_info
		exit 1
	fi

	# Report snapshot progress from info
	if [ "$snapshot_info" =~ "<PercentageProgress>(\d+)</PercentageProgress>" ]; then
		snapshot_progress="${BASH_REMATCH[1]}"

		echo "Snapshot progress: $snapshot_progress %"
	fi

	return $snapshot_status
}

# Create RDS snapshot from DBS3
rds-create-db-snapshot -i dbs3 -s "$SNAPSHOT"

# Restore acceptance database from snapshot
rds-restore-db-instance-from-snapshot "$INSTANCE" -s "$SNAPSHOT"

while [ rds_get_snapshot_status() == 'creating' ]; do
	sleep 10
done

# Migrate acceptance database params and database instance type
rds-modify-db-instance --db-instance-identifier "$INSTANCE" --db-instance-class db.m1.large --db-parameter-group-name ts2-default --apply-immediately true
