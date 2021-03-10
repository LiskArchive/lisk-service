#!/bin/bash

MYSQLDUMP=$(which mysqldump)

if [ -z $MYSQLDUMP ]; then echo 'The command mysqldump is not installed in the system'; exit 1; fi

DATABASE=$1
DUMP_FILE=index_snapshot.sql

echo "Dumping index ${DATABASE} to ${DUMP_FILE}"

$MYSQLDUMP --no-create-db $DATABASE > $DUMP_FILE
