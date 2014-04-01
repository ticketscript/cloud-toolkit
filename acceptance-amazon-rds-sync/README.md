#
# Ticketscript Acceptence environment builder
# License:
# Autor: Jay <geoffrey.dekleijn@ticketscript.com>
#

## Description ##



## Requirements ##

These scrips require several tools and configuratoin to function

### MySQL client access ###


The SQL backup-restore script needs the MySQL client library to function, and of course access to the database host.

(todo: provide required privileges / GRANT statement for setup)

### Amazon Relation database service (RDS) ###

For RDS access, the Amazon RDS Command line toolkit is required:
http://aws.amazon.com/developertools/Amazon-RDS/2928

Install, setup and make sure that you have access to the instances that we're managing here


At ticketscript, the following IAM policies are used:

Source DB instance snapshot policy

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


Target DB instance policy

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