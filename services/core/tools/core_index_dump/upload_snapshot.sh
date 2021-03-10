list=(
    'index_snapshot.sql'
)

for item in "${list[@]}"
do
    gzip -c $item > "${item}.gz"
    s3cmd put "${item}.gz" "${STATIC_LISK_S3}/${item}.gz"
done

echo "Uploaded snapshot to cloud storage ${STATIC_LISK_S3}"
