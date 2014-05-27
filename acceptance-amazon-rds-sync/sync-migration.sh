#!/bin/bash
source $DIR/config

# Copy diff migration files to directory
diff -qr $DATABASE_MIGRATION_TARGET_DIR/ $DATABASE_MIGRATION_TARGET_DIR.old/ | sed -e 's/^Only in\(.*\): \(.*\)/\1\/\2/g' -e 's/ and \..*differ$//g' -e 's/^Files //g' | xargs -I {} cp {} $DATABASE_MIGRATION_TARGET_DIR_DIFF/
