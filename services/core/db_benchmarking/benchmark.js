const fs = require('fs');
const file = require('./fileUtils');

const { redisdb, knex } = require('./database');

const benchmark = async (args) => {
    const batchSizeStr = args[2] || '10000';
    const batchSizes = batchSizeStr.split(',');

    const userDbSql = await knex('users');
    const txnDbSql = await knex('transactions');

    const userIndexes = ['id', 'btcAddress', 'username'];
    const txnIndexes = ['id', 'amount', 'date', 'userId', 'btcAddress'];

    const userDbRedis = await redisdb('user', userIndexes);
    const txnDbRedis = await redisdb('transaction', txnIndexes);

    for (let i = 0; i < batchSizes.length; i++) {
        const batchSize = Number(batchSizes[i]);

        const results = {};

        const allFiles = fs.readdirSync(`./testdata_${batchSize}/`);
        const userFiles = allFiles.filter(fileName => fileName.includes('users'));
        const txnFiles = allFiles.filter(fileName => fileName.includes('transactions'));

        // Compute total time taken to insert users
        let userCount = 0;
        let timetaken_user_knex = 0;
        let timetaken_user_redis = 0;
        // for (let i = 0; i < 50; i++) {
        for (let i = 0; i < userFiles.length; i++) {
            const usersOriginal = await file.readJson(`./testdata_${batchSize}/${userFiles[i]}`);
            const users = usersOriginal.map(user => {
                user.address_street = user.address.street;
                user.address_suite = user.address.suite;
                user.address_city = user.address.city;
                user.address_zipcode = user.address.zipcode;
                user.address_geo_lat = user.address.geo.lat;
                user.address_geo_lng = user.address.geo.lng;
                user.company_name = user.company.name;
                user.company_catchPhrase = user.company.catchPhrase;
                user.company_bs = user.company.bs;

                delete user.userId;
                delete user.address;
                delete user.company;

                return user;
            });
            userCount += users.length;

            // console.time(`insertUserKnex_${i}`);
            const kt0 = Date.now();;
            await userDbSql.writeBatch(users);
            const kt1 = Date.now();
            // console.timeEnd(`insertUserKnex_${i}`);
            timetaken_user_knex += (kt1 - kt0);

            // console.time(`insertUserRedis_${i}`);
            const rt0 = Date.now();
            await userDbRedis.writeBatch(users);
            const rt1 = Date.now();
            // console.timeEnd(`insertUserRedis_${i}`);
            timetaken_user_redis += (rt1 - rt0);
        }
        results['user_batchSize'] = batchSize;
        results['total_userCount'] = userCount;
        results['total_timetaken_user_knex'] = timetaken_user_knex;
        results['total_timetaken_user_redis'] = timetaken_user_redis;
        results['avg_timetaken_user_knex'] = timetaken_user_knex / userCount;
        results['avg_timetaken_user_redis'] = timetaken_user_redis / userCount;
        results['avg_timetaken_user_knex_batch'] = timetaken_user_knex / userFiles.length;
        results['avg_timetaken_user_redis_batch'] = timetaken_user_redis / userFiles.length;

        // Compute total time taken to insert transactions
        let txnCount = 0;
        let timetaken_txn_knex = 0;
        let timetaken_txn_redis = 0;
        // for (let i = 0; i < 50; i++) {
        for (let i = 0; i < txnFiles.length; i++) {
            const txns = await file.readJson(`./testdata_${batchSize}/${txnFiles[i]}`);
            txnCount += txns.length;

            // console.time(`insertTxnKnex_${i}`);
            const kt0 = Date.now();
            await txnDbSql.writeBatch(txns);
            const kt1 = Date.now();
            // console.timeEnd(`insertTxnKnex_${i}`);
            timetaken_txn_knex += (kt1 - kt0);

            // console.time(`insertTxnRedis_${i}`);
            const rt0 = Date.now();
            await txnDbRedis.writeBatch(txns);
            const rt1 = Date.now();
            // console.timeEnd(`insertTxnRedis_${i}`);
            timetaken_txn_redis += (rt1 - rt0);
        }
        results['txn_batchSize'] = Math.floor(txnCount / txnFiles.length);
        results['total_txnCount'] = txnCount;
        results['total_timetaken_txn_knex'] = timetaken_txn_knex;
        results['total_timetaken_txn_redis'] = timetaken_txn_redis;
        results['avg_timetaken_txn_knex'] = timetaken_txn_knex / userCount;
        results['avg_timetaken_txn_redis'] = timetaken_txn_redis / userCount;
        results['avg_timetaken_txn_knex_batch'] = timetaken_txn_knex / txnFiles.length;
        results['avg_timetaken_txn_redis_batch'] = timetaken_txn_redis / txnFiles.length;

        await new Promise((resolve, reject) => {
            const resultsDir = 'results';
            if (!fs.existsSync(`${resultsDir}`)) fs.mkdirSync(`${resultsDir}`);
            fs.writeFile(`./${resultsDir}/result_${batchSize}.json`, JSON.stringify(results, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                };
                console.log(`Test results saved to: './${resultsDir}/result_${batchSize}.json'`);
                resolve();
            });
        });
    }

    process.exit(0);
};

benchmark(process.argv);
