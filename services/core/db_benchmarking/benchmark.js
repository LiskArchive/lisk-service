const fs = require('fs');
const file = require('./fileUtils');

const { redis, knex } = require('../shared/database');

const migrationDir = './knex_migrations';
const redisEndpoint = 'redis://localhost:6379/10';

const benchmark = async (args) => {
    const batchSizeStr = args[2] || '10000';
    const batchSizes = batchSizeStr.split(',');

    const userDbSql = await knex('users', migrationDir);
    const txnDbSql = await knex('transactions', migrationDir);

    const userIndexes = ['id', 'btcAddress', 'username'];
    const txnIndexes = ['id', 'amount', 'date', 'userId', 'btcAddress'];

    const userDbRedis = await redis('user', userIndexes, redisEndpoint);
    const txnDbRedis = await redis('transaction', txnIndexes, redisEndpoint);

    for (let i = 0; i < batchSizes.length; i++) {
        const batchSize = Number(batchSizes[i]);

        const results = {};

        const allFiles = fs.readdirSync(`./testdata_${batchSize}/`);
        const userFiles = allFiles.filter(fileName => fileName.includes('users'));
        const txnFiles = allFiles.filter(fileName => fileName.includes('transactions'));

        // Compute total time taken to insert users
        let userCount = 0;
        let timetakenUserKnex = 0;
        let timetakenUserRedis = 0;
        for (let j = 0; j < userFiles.length; j++) {
            const usersOriginal = await file.readJson(`./testdata_${batchSize}/${userFiles[j]}`);
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
            const kt0 = Date.now();
            await userDbSql.writeBatch(users);
            const kt1 = Date.now();
            // console.timeEnd(`insertUserKnex_${i}`);
            timetakenUserKnex += (kt1 - kt0);

            // console.time(`insertUserRedis_${i}`);
            const rt0 = Date.now();
            await userDbRedis.writeBatch(users);
            const rt1 = Date.now();
            // console.timeEnd(`insertUserRedis_${i}`);
            timetakenUserRedis += (rt1 - rt0);
        }
        results.user_batchSize = batchSize;
        results.total_userCount = userCount;
        results.total_timetaken_user_knex = timetakenUserKnex;
        results.total_timetaken_user_redis = timetakenUserRedis;
        results.avg_timetaken_user_knex = timetakenUserKnex / userCount;
        results.avg_timetaken_user_redis = timetakenUserRedis / userCount;
        results.avg_timetaken_user_knex_batch = timetakenUserKnex / userFiles.length;
        results.avg_timetaken_user_redis_batch = timetakenUserRedis / userFiles.length;

        // Compute total time taken to insert transactions
        let txnCount = 0;
        let timetakenTxnKnex = 0;
        let timetakenTxnRedis = 0;
        for (let k = 0; k < txnFiles.length; k++) {
            const txns = await file.readJson(`./testdata_${batchSize}/${txnFiles[k]}`);
            txnCount += txns.length;

            // console.time(`insertTxnKnex_${i}`);
            const kt0 = Date.now();
            await txnDbSql.writeBatch(txns);
            const kt1 = Date.now();
            // console.timeEnd(`insertTxnKnex_${i}`);
            timetakenTxnKnex += (kt1 - kt0);

            // console.time(`insertTxnRedis_${i}`);
            const rt0 = Date.now();
            await txnDbRedis.writeBatch(txns);
            const rt1 = Date.now();
            // console.timeEnd(`insertTxnRedis_${i}`);
            timetakenTxnRedis += (rt1 - rt0);
        }
        results.txn_batchSize = Math.floor(txnCount / txnFiles.length);
        results.total_txnCount = txnCount;
        results.total_timetaken_txn_knex = timetakenTxnKnex;
        results.total_timetaken_txn_redis = timetakenTxnRedis;
        results.avg_timetaken_txn_knex = timetakenTxnKnex / userCount;
        results.avg_timetaken_txn_redis = timetakenTxnRedis / userCount;
        results.avg_timetaken_txn_knex_batch = timetakenTxnKnex / txnFiles.length;
        results.avg_timetaken_txn_redis_batch = timetakenTxnRedis / txnFiles.length;

        await new Promise((resolve, reject) => {
            const resultsDir = 'results';
            if (!fs.existsSync(`${resultsDir}`)) fs.mkdirSync(`${resultsDir}`);
            fs.writeFile(`./${resultsDir}/result_${batchSize}.json`, JSON.stringify(results, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                console.log(`Test results saved to: './${resultsDir}/result_${batchSize}.json'`);
                resolve();
            });
        });
    }

    process.exit(0);
};

benchmark(process.argv);
