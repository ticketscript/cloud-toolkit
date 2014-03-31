#!/bin/bash
INSTANCE="$1"

REGEX_INSTANCE_STATUS="<DBInstanceStatus>(.*)</DBInstanceStatus>"
REGEX_CODE="<Code>(.*)</Code>"



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
}



#
# Create database instance
#

# Check instance status
rds_get_instance_status

echo -n "Instance $INSTANCE status: $instance_status"

case "$instance_status" in

	"available")

		rds-delete-db-instance -f --skip-final-snapshot --db-instance-identifier ts2acceptance
		;;

	*)
		echo
		echo "ERROR - Unknown instance status: $instance_status" >&2
		exit 1

esac

# Wait for instance to complete
while [[ "$instance_status" == "deleting" ]]; do
	echo -n "."
	rds_get_instance_status
	sleep 25
done

echo

# Clean exit!
exit 0
