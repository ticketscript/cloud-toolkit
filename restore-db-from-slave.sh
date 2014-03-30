#!/bin/bash
INSTANCE="$1"
SNAPSHOT="dbs3-latest"
REGEX_STATUS="<Status>(.*)</Status>"
REGEX_CODE="<Code>(.*)</Code>"
REGEX_PROGRESS="<PercentProgress>([0-9]+)</PercentProgress>"

rds_get_snapshot_status() {

	# Retrieve snapshot info
	snapshot_info=`rds-describe-db-snapshots --db-snapshot-identifier "$SNAPSHOT" --show-xml`

	# Get snapshot status from info
	if [[ "$snapshot_info" =~ $REGEX_STATUS ]]; then
		snapshot_status="${BASH_REMATCH[1]}"
	elif [[ $snapshot_info =~ $REGEX_CODE ]]; then
		snapshot_status="${BASH_REMATCH[1]}"
	else
		snapshot_status="invalid"
	fi

	# Report snapshot progress from info
	if [[ "$snapshot_info" =~ $REGEX_PROGRESS ]]; then
		snapshot_progress="${BASH_REMATCH[1]}"
	fi
}

rds_create_snapshot() {
	# Create RDS snapshot from DBS3
	rds-create-db-snapshot -i dbs3 -s "$SNAPSHOT"
}

rds_remove_snapshot() {
	rds-delete-db-snapshot	--db-snapshot-identifier "$SNAPSHOT" -f
}

# Check snapshot status
rds_get_snapshot_status

echo -n "Snapshot $SNAPSHOT status: $snapshot_status"
case $snapshot_status in

	availablie2 )
		# Remove Existing snapshot
		rds_remove_snapshot
		# Create new snapshot
		rds_create_snapshot
		rds_get_snapshot_status
		;;

	 DBSnapshotNotFound )
		# No snapshot found, so create one
		rds_create_snapshot
		rds_get_snapshot_status
		;;

	creating )
		;;

	available )
		# Snapshot is already underway, nothing to do but wait then
		;;

	invalid )
		echo 'ERROR - failed to get snapshot status from $snapshot_info'
		exit 1
		;;

	* )
		echo "ERROR - unknown snapshot status: $snapshot_status"
		exit 1
		;;

esac

# Wait for snapshot to complete
while [ "$snapshot_status" == "creating" ]; do
	echo -n " $snapshot_progress%"
	rds_get_snapshot_status
	sleep 25
done

echo

# Restore acceptance database from snapshot
rds-restore-db-instance-from-db-snapshot \
  --db-snapshot-identifier "$SNAPSHOT" \
  --db-instance-identifier "$INSTANCE" \
  --db-instance-class db.m1.large \
  --db-subnet-group ts2acceptance

# Migrate acceptance database params and database instance type
rds-modify-db-instance \
  --db-instance-identifier "$INSTANCE" \
  --db-parameter-group-name "ts2-default" \
  --apply-immediately true
