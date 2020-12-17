const fs = require('fs');
const faker = require('faker/locale/en');
const file = require('./fileUtils');

const createEntity = faker.helpers.contextualCard;
const createTransaction = faker.helpers.createTransaction;

const createEntities = (n) => {
	const users = [];
	const transactions = [];
	let entity = {};
	let transaction = {};

	for (let i = 0; i < n; i++) {
		entity = createEntity();
		entity.id = faker.random.uuid();
		entity.btcAddress = faker.finance.bitcoinAddress();
		users.push(entity);

		for (let j = 0; j < Math.floor(Math.random() * 100); j++) {
			transaction = createTransaction();
			transaction.id = faker.random.uuid();
			transaction.userId = entity.id;
			transaction.btcAddress = entity.btcAddress;
			transactions.push(transaction);
		}
	}
	return { users, transactions };
};

const generate = async () => {
	const offset = [0, 1 * 10 ** 6];
	const batchSize = 10000;
	const n = Math.ceil(offset[1] / batchSize);

	if (!fs.existsSync(`testdata_${batchSize}`)) fs.mkdirSync(`testdata_${batchSize}`);
	for (let i = offset[0]; i < n; i++) {
		const { users, transactions } = createEntities(batchSize);
		await file.writeJson(`./testdata_${batchSize}/users_${i}.json`, users);
		await file.writeJson(`./testdata_${batchSize}/transactions_${i}.json`, transactions);
	}
};

generate();
