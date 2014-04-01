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

{
  "Statement": [
    {
      "Sid": "Stmt1395843870020",
      "Action": [
        "rds:RestoreDBInstanceFromDBSnapshot"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:rds:eu-west-1:342784554647:db:*"
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
    }
  ]
}