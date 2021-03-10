#!/bin/bash

WGET_CMD=$(which wget)
GZIP_CMD=$(which gzip)

if [ -z $WGET_CMD ]; then echo 'The command wget is not installed in the system'; exit 1; fi
if [ -z $GZIP_CMD ]; then echo 'The command gzip is not installed in the system'; exit 1; fi

$WGET_CMD -O index_snapshot.sql.gz https://static-data.lisk.io/index_snapshot.sql.gz

if [ $? -ne 0 ]; then echo 'Error while downloading snapshot'; exit 1; fi

$GZIP_CMD -dk index_snapshot.sql.gz
