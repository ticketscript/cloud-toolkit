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
	else if [[ $snapshot_info =~ "<Code>(a-zA-Z]+</Code>" ]];
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

rds_create_snapshot() {
	# Create RDS snapshot from DBS3
	rds-create-db-snapshot -i dbs3 -s "$SNAPSHOT"
}

# Check snapshot status
case rds_get_snapshot_status() in

	DBSnapshotNotFound )
		# No snapshot found, so create one
		rds_create_snapshot()
		;;
	creating )
		# Snapshot is already underway, nothing to do but wait then
		;;

esac

# Wait for snapshot to complete
while [ rds_get_snapshot_status() == 'creating' ]; do
	sleep 10
done

# Restore acceptance database from snapshot
rds-restore-db-instance-from-db-snapshot "$INSTANCE" -s "$SNAPSHOT"

# Migrate acceptance database params and database instance type
rds-modify-db-instance --db-instance-identifier "$INSTANCE" --db-instance-class db.m1.large --db-parameter-group-name ts2-default --apply-immediately true
