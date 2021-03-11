#!/bin/bash

MYSQLDUMP=$(which mysqldump)

if [ -z $MYSQLDUMP ]; then echo 'ERROR: The command mysqldump is not installed in the system'; exit 1; fi

DATABASE=$1
DUMP_FILE=index_snapshot.sql

if [ -z $DATABASE ]; then echo 'Usage: dump_index.sh <database_name>'; exit 1; fi

echo "Dumping index ${DATABASE} to ${DUMP_FILE}"

$MYSQLDUMP --no-create-db $DATABASE > $DUMP_FILE
