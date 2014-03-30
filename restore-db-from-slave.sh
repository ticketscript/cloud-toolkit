#!/bin/bash
INSTANCE="$1"
INSTANCE_PARAM_GROUP="ts2-default"
INSTANCE_SUBNET_GROUP="ts2acceptance"
INSTANCE_CLASS="db.m1.large"
INSTANCE_VPC_SECURITY_GROUPS="sg-e6fc1283"
INSTANCE_AVAILABILITY_ZONE="eu-west-1a"

SNAPSHOT="dbs3-latest"

REGEX_STATUS="<Status>(.*)</Status>"
REGEX_INSTANCE_STATUS="<DBInstanceStatus>(.*)</DBInstanceStatus>"
REGEX_CODE="<Code>(.*)</Code>"
REGEX_PROGRESS="<PercentProgress>([0-9]+)</PercentProgress>"
REGEX_INSTANCE_PARAMGROUP="<DBParameterGroupName>(.*)</DBParameterGroupName>"



#
# Common RDS functions
#

rds_get_instance_status() {

	# Retrieve instance info
	instance_info=`rds-describe-db-instances --db-instance-identifier "$INSTANCE" --show-xml`

	# Get instance status from info
	if [[ "$instance_info" =~ $REGEX_INSTANCE_STATUS ]]; then
		instance_status="${BASH_REMATCH[1]}"
	elif [[ "$instance_info" =~ $REGEX_CODE ]]; then
		instance_status="${BASH_REMATCH[1]}"
	else
		instance_status="invalid"
	fi

	# Get instance parameter group
	if [[ "$instance_info" =~ $REGEX_INSTANCE_PARAMGROUP ]]; then
		instance_paramgroup="${BASH_REMATCH[1]}"
	fi
}

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

#
# Check and create slave snapshot
#

do_create_latest_snapshot() {
	# Check snapshot status
	rds_get_snapshot_status

	echo -n "Snapshot $SNAPSHOT status: $snapshot_status"
	case $snapshot_status in

		"available" )
			# Remove Existing snapshot
			rds_remove_snapshot
			# Create new snapshot
			rds_create_snapshot
			rds_get_snapshot_status
			;;

		"DBSnapshotNotFound" )
			# No snapshot found, so create one
			rds_create_snapshot
			rds_get_snapshot_status
			;;

		"creating" )
			;;

		"invalid" )
			echo
			echo 'ERROR - failed to get snapshot status from $snapshot_info' >&2
			exit 1
			;;

		* )
			echo
			echo "ERROR - unknown snapshot status: $snapshot_status" >&2
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
}



#
# Create database instance
#

# Check instance status
rds_get_instance_status

echo -n "Instance $INSTANCE status: $instance_status"

case "$instance_status" in

	"DBInstanceNotFound")

		echo
		echo "Creating new instance from dbs3 snapshot"

		# Create snapshot
		do_create_latest_snapshot

		# Restore acceptance database from snapshot
		rds-restore-db-instance-from-db-snapshot \
		  --db-snapshot-identifier "$SNAPSHOT" \
		  --db-instance-identifier "$INSTANCE" \
		  --db-instance-class "$INSTANCE_CLASS" \
		  --db-subnet-group-name "$INSTANCE_SUBNET_GROUP" \
		  --availability-zone "$INSTANCE_AVAILABILITY_ZONE"

		rds_get_instance_status

		echo -n "Instance $INSTANCE status: $instance_status"
		;;

	"available")
		echo
		echo "WARNING - Instance $INSTANCE is already available" >&2
		;;

	"creating")
		# DB Instance is already being createdd
		;;

	"modifying")
		# DB Instance is already being modified
		;;

	*)
		echo
		echo "ERROR - Unknown instance status: $instance_status" >&2
		exit 1

esac

# Wait for instance to complete
INSTANCE_WAIT_STATE="creating|modifying"
while [[ "$instance_status" =~ $INSTANCE_WAIT_STATE ]]; do
	echo -n "."
	rds_get_instance_status
	sleep 25
done

echo

# Verify and modify DB instance parameter group
if [ "$instance_paramgroup" != "$INSTANCE_PARAM_GROUP" ]; then

	echo -n "Modifying DB instance $INSTANCE"

	# Migrate acceptance database params and database instance type
	rds-modify-db-instance \
	  --db-instance-identifier "$INSTANCE" \
	  --db-parameter-group-name "$INSTANCE_PARAM_GROUP" \
	  --vpc-security-group-ids "$INSTANCE_VPC_SECURITY_GROUPS" \
	  --apply-immediately true

	echo " done!"
fi

# Clean exit!
exit 0
