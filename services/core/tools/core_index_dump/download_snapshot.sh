#!/bin/bash

NETWORK=$1
VERSION=$(jq -r .version ./../../package.json)

if [ -z $NETWORK ]; then echo 'Usage: download_snapshot.sh <mainnet/testnet/betanet>'; exit 1; fi

echo "Looking for a snapshot for the version ${VERSION}-${NETWORK}"

WGET_CMD=$(which wget)
GZIP_CMD=$(which gzip)

if [ -z $WGET_CMD ]; then echo 'ERROR: The command wget is not installed in the system'; exit 1; fi
if [ -z $GZIP_CMD ]; then echo 'ERROR: The command gzip is not installed in the system'; exit 1; fi

STATIC_URL=https://static-data.lisk.io
DUMP_FILE_PREFIX=index_snapshot
FILENAME_PREFIX="${DUMP_FILE_PREFIX}-${VERSION}-${NETWORK}"

$WGET_CMD -O "${FILENAME_PREFIX}.sql.gz" "${STATIC_URL}/${FILENAME_PREFIX}.sql.gz"

if [ $? -ne 0 ]; then echo 'ERROR: Error while downloading snapshot'; exit 1; fi

$GZIP_CMD -dc "${FILENAME_PREFIX}.sql.gz" > "${DUMP_FILE_PREFIX}.sql"

echo "Downloaded snapshot from ${STATIC_URL}"
