list=(
    known_mainnet.json
    known_betanet.json
    known_testnet.json
    networks.json
)

for item in "${list[@]}"
do
    s3cmd put "${item}" "${STATIC_LISK_S3}/${item}"
done
