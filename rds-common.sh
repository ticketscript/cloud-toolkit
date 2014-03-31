REGEX_STATUS="<Status>(.*)</Status>"
REGEX_INSTANCE_STATUS="<DBInstanceStatus>(.*)</DBInstanceStatus>"
REGEX_CODE="<Code>(.*)</Code>"
REGEX_PROGRESS="<PercentProgress>([0-9]+)</PercentProgress>"
REGEX_INSTANCE_PARAMGROUP="<DBParameterGroupName>(.*)</DBParameterGroupName>"



#
# Common RDS functions
#

rds_get_instance_status() {

	if [ "$INSTANCE" == "" ]; 
		echo 'ERROR - rds_get_instance_status: $INSTANCE is empty'
		exit 1
	fi

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

	if [ "$SNAPSHOT" == "" ]; 
		echo 'ERROR - rds_get_instance_status: $SNAPSHOT is empty'
		exit 1
	fi

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

	if [ "$SNAPSHOT" == "" ]; 
		echo 'ERROR - rds_get_instance_status: $SNAPSHOT is empty'
		exit 1
	fi

	# Create RDS snapshot from DBS3
	rds-create-db-snapshot -i dbs3 -s "$SNAPSHOT"
}

rds_remove_snapshot() {

	if [ "$SNAPSHOT" == "" ]; 
		echo 'ERROR - rds_get_instance_status: $SNAPSHOT is empty'
		exit 1
	fi

	rds-delete-db-snapshot --db-snapshot-identifier "$SNAPSHOT" -f
}



#
# Check and create slave snapshot
#

do_create_snapshot() {

	if [ "$SNAPSHOT" == "" ]; 
		echo 'ERROR - rds_get_instance_status: $SNAPSHOT is empty'
		exit 1
	fi

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
