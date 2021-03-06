#!/bin/bash
INSTANCE="$1"

# Local directory
DIR=$(dirname "$0")

# Include configuration and RDS common functions
source $DIR/config
source $DIR/rds-common

#
# Create database instance
#

# Check instance status
rds_get_instance_status

echo -n "Instance $INSTANCE status: $instance_status"

case "$instance_status" in

	"DBInstanceNotFound")
		rds_get_latest_snapshot

		echo "Creating instance $INSTANCE from snapshot $latest_snapshot"

		# Restore target database from snapshot
		rds-restore-db-instance-from-db-snapshot \
		  --db-snapshot-identifier "$latest_snapshot" \
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

# Wait for instance to become available
rds_wait_state

# Verify and modify DB instance parameter group
if [ "$instance_paramgroup" != "$INSTANCE_PARAM_GROUP" ]; then

	echo -n "Modifying DB instance $INSTANCE"

	# Migrate target database params and database instance type
	rds-modify-db-instance \
	  --db-instance-identifier "$INSTANCE" \
	  --db-parameter-group-name "$INSTANCE_PARAM_GROUP" \
	  --vpc-security-group-ids "$INSTANCE_VPC_SECURITY_GROUPS" \
	  --backup-retention-period 0 \
	  --apply-immediately

	# Wait for modifications to complete
	rds_wait_state
fi

# Reboot instance to apply modifications
echo -n "Rebooting DB instance $INSTANCE"

rds-reboot-db-instance $INSTANCE

# Wait for instance to become available again
rds_wait_state

# Clean exit!
exit 0
