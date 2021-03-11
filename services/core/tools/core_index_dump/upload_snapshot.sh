#!/bin/bash

JQ_CMD=$(which jq)
S3_CMD=$(which s3cmd)
GZIP_CMD=$(which gzip)

if [ -z $JQ_CMD ]; then echo 'ERROR: The command jq is not installed in the system'; exit 1; fi
if [ -z $S3_CMD ]; then echo 'ERROR: The command s3cmd is not installed in the system'; exit 1; fi
if [ -z $GZIP_CMD ]; then echo 'ERROR: The command gzip is not installed in the system'; exit 1; fi

NETWORK=$1
VERSION=$($JQ_CMD -r .version ./../../package.json)

if [ -z $NETWORK ]; then echo 'ERROR: Network is not defined (mainnet/testnet/betanet)'; exit 1; fi

DUMP_FILE_PREFIX=index_snapshot

FILENAME="${DUMP_FILE_PREFIX}-${VERSION}-${NETWORK}"

$GZIP_CMD -c "${DUMP_FILE_PREFIX}.sql" > "${FILENAME}.sql.gz"
$S3_CMD put "${FILENAME}.sql.gz" "${STATIC_LISK_S3}/${FILENAME}.sql.gz"

echo "Uploaded snapshot to cloud storage ${STATIC_LISK_S3}"
