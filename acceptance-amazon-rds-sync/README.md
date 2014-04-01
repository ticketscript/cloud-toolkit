# Amazon RDS sync tool
```
Descrition: Ticketscript Acceptence environment builder
License:    
Author:     Jay <geoffrey.dekleijn@ticketscript.nl>
```

## Description ##

Synchronization toolkit for Amazon RDS Database instances. The synchronization will be from the an RDS SNAPSHOT  to a new
RDS database INSTANCE. Typically, these scripts are used to 'clone' a database from the production environment to an acceptance
environment on a nightly basis.

These scripts will take care of the following:

1. Taking a snapshot from the SNAPSHOT instance
2. Backing up any user-generated data on the target INSTANCE
3. Destroy the INSTANCE
4. Create a new target INSTANCE from the SNAPSHOT
5. Restore any user-generated data to the target INSTANCE

The ability of separating user-generate data from imported data is achieved by bumping all primary keys half way through the
key space. By default, all primary keys are bumped to 1,000,000,000 (1/4 of 32 bit key space). Though this is a crude mechanism,
it will allow for easy backup and restore. 

### Configuration
Copy the 'config.template' file to 'config' and setup the INSTANCE variable. The INSTANCE refers
to the Amazon RDS instance that will be created. Any DATABASE variabels refer to the database on the RDS instance
that will be synchronized. The SNAPSHOT and SNAPSHOT_INSTANCE variables refer to the RDS source instance. 

Copy 'post-migration-tweaks.sql.template' to 'post-migration-tweaks.sql', and add any post migration SQL statements that
may be required.

### Scripts
[sync-rds-db-instance.sh](sync-rds-db-instance.sh)

Runs the full backup-snapshot-destroy-create-restore process for the target INSTANCE


[restore-db-from-slave.sh](restore-db-from-slave.sh) <INSTANCE>

Creates the target INSTANCE from the specified SNAPSHOT 

## Requirements ##

These scrips require several tools and configuration to function.


### MySQL client access ###

The SQL backup-restore script needs the MySQL client library to function, and of course access to the database host.
Please make sure the 'mysql' and 'mysqldump' commands can connect to the target database, without any additional 
parameters. If username and password are required, please setup a local ~/.my.cnf file:

```
[mysql]
username=
password=
``` 

(todo: provide required privileges / GRANT statement for setup)


### Amazon Relation database service (RDS) ###

For RDS access, the Amazon RDS Command line toolkit is required:
http://aws.amazon.com/developertools/Amazon-RDS/2928

Install, setup and make sure that you have access to the instances that we're managing here.
All rds-* commands should be available at the executable path specified $PATH


### Amazon IAM user setup ###

At ticketscript, the following IAM policies are used:

Source DB instance snapshot policy

```json
{
  "Statement": [
    {
      "Sid": "Stmt1395843870018",
      "Action": [
        "rds:CreateDBSnapshot",
        "rds:CopyDBSnapshot",
        "rds:DeleteDBSnapshot",
        "rds:RestoreDBInstanceFromDBSnapshot"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:rds:eu-west-1:342784554647:snapshot:dbs3-latest"
    },
    {
      "Sid": "Stmt1395843870019",
      "Action": [
        "rds:CreateDBSnapshot"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:rds:eu-west-1:342784554647:db:dbs3"
    }
  ]
}
```

Target DB instance policy

```json
{
  "Statement": [
    {
      "Sid": "Stmt1395843870020",
      "Action": [
        "rds:RestoreDBInstanceFromDBSnapshot"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:rds:eu-west-1:342784554647:db:*",
        "arn:aws:rds:eu-west-1:342784554647:subgrp:*"
      ]
    },
    {
      "Sid": "Stmt1395843870021",
      "Action": [
        "rds:ModifyDBInstance"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:rds:eu-west-1:342784554647:db:ts2acceptance",
        "arn:aws:rds:eu-west-1:342784554647:pg:*",
        "arn:aws:rds:eu-west-1:342784554647:secgrp:*"
      ]
    },
    {
      "Sid": "Stmt1395843870022",
      "Action": [
        "rds:DeleteDBInstance",
        "rds:RebootDBInstance"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:rds:eu-west-1:342784554647:db:ts2acceptance"
      ]
    }
  ]
}
```
