#!/bin/bash

MYSQL=$(which mysql)

if [ -z $MYSQL ]; then echo 'The command mysql is not installed in the system'; exit 1; fi

USER=root
DATABASE=$1
DUMP_FILE=index_snapshot.sql

if [ -z $DATABASE ]; then echo 'Usage: restore_index.sh <database_name>'; exit 1; fi

echo "Restoring index from ${DUMP_FILE} to ${DATABASE}"

$MYSQL -u $USER $DATABASE < $DUMP_FILE
