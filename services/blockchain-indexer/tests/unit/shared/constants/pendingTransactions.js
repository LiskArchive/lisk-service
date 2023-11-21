const mockSenderAddress = 'lskvq67zzev53sa6ozt39ft3dsmwxxztb7h29275k';
const mockRecipientAddress = 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo';

const mockSenderAccountDetails = {
	name: 'genesis',
	publicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
};

const mockPendingTransactions = [
	{
		module: 'token',
		command: 'transfer',
		fee: '100000000',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		signatures: [
			'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
		],
		params: {
			tokenID: '0000000000000000',
			amount: '100000000000',
			recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			data: '',
		},
		id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
		size: 167,
		minFee: '166000',
	},
	{
		module: 'token',
		command: 'transferCrossChain',
		fee: '100000000',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		signatures: [
			'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
		],
		params: {
			tokenID: '0000000000000000',
			amount: '100000000000',
			recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			receivingChainID: '02000000',
			data: '',
			messageFee: '10000000',
			messageFeeTokenID: '0200000000000000',
		},
		id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506d',
		size: 167,
		minFee: '166000',
	},
];

module.exports = {
	mockPendingTransactions,
	mockSenderAddress,
	mockRecipientAddress,
	mockSenderAccountDetails,
};
