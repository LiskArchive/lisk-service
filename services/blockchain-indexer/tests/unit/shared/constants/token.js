const mockTokenTopBalancesParams = {
	tokenID: 'token123',
	search: 'search123',
	limit: 10,
	offset: 0,
};
const mockTokenTopBalancesTokenInfos = [
	{
		address: 'address123',
		publicKey: 'publicKey123',
		name: 'name123',
		balance: '100',
	},
	{
		address: 'address456',
		publicKey: 'publicKey456',
		name: 'name456',
		balance: '200',
	},
];
const mockTokenTopBalancesDbSearchResult = {
	'account_balances.tokenID': 'token123',
	limit: 10,
	offset: 0,
	leftOuterJoin: {
		targetTable: 'accounts',
		leftColumn: 'account_balances.address',
		rightColumn: 'accounts.address',
	},
	orSearch: [
		{
			property: 'accounts.name',
			pattern: 'search123',
		},
		{
			property: 'accounts.address',
			pattern: 'search123',
		},
		{
			property: 'accounts.publicKey',
			pattern: 'search123',
		},
	],
};

module.exports = {
	mockTokenTopBalancesParams,
	mockTokenTopBalancesTokenInfos,
	mockTokenTopBalancesDbSearchResult,
};
