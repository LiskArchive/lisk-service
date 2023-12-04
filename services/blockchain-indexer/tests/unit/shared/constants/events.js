/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

const mockEventTopics = [
	{
		eventID: '392eadd8f1703efd2b9d5fae72e272da1806fc3fb667c67e0ef71035f941710f',
		timestamp: 1693876060,
		index: 0,
	},
	{
		eventID: '180fccd1d16dd9806454e2a5f48da020aa5590df0100c72659e713ab502ca4b0',
		timestamp: 1693876060,
		index: 1,
	},
	{
		eventID: '51291dcc8010176f33f2a250d00869d5c423ad053204a204ebcb4a1b5dd19bc4',
		timestamp: 1693876050,
		index: 0,
	},
	{
		eventID: '75ae7452e1d304b846e1531c73f696d169b38926a603df4092cd4c2c924fbe75',
		timestamp: 1693876050,
		index: 1,
	},
	{
		eventID: 'af100a3fcfc221b0c62edb60bc88a78633e17f5bda449dc43216c2dedda3f20c',
		timestamp: 1693876040,
		index: 0,
	},
	{
		eventID: '5f31caae2e0a606a86b1425d49ab1d6543d06fe42b39b97397e9739d8ed87785',
		timestamp: 1693876040,
		index: 1,
	},
	{
		eventID: '6d15e5798dbc1e7b43fdd9d9c66d95f181dc4349ed8821e8209aa73c28939406',
		timestamp: 1693876030,
		index: 0,
	},
	{
		eventID: '0d39438acc199f647af69ecfb675775f31bf8b1dcbd3cf5f0d6fdecfb68a7910',
		timestamp: 1693876030,
		index: 1,
	},
	{
		eventID: '48131594ec7324a815f43d0e5e6122104a0c0573e97760abb53c5930ac1f481b',
		timestamp: 1693876020,
		index: 0,
	},
	{
		eventID: '8c50ade215fd89a9e351a338cd8389bec6d64babb03dbc8611d5bdd433cec181',
		timestamp: 1693876020,
		index: 1,
	},
];

const mockEventsForEventTopics = [
	{
		eventStr:
			'{"data":{"address":"lskfonwc5wpgy5873ckejqujwp3uwvtagejrjftpp","tokenID":"0400000000000000","amount":"94953271","result":0},"index":0,"module":"token","name":"mint","topics":["03","lskfonwc5wpgy5873ckejqujwp3uwvtagejrjftpp","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125247,"id":"392eadd8f1703efd2b9d5fae72e272da1806fc3fb667c67e0ef71035f941710f"}',
		height: 125247,
		index: 0,
	},
	{
		eventStr:
			'{"data":{"amount":"94953271","reduction":0},"index":1,"module":"dynamicReward","name":"rewardMinted","topics":["03","lskfonwc5wpgy5873ckejqujwp3uwvtagejrjftpp","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125247,"id":"180fccd1d16dd9806454e2a5f48da020aa5590df0100c72659e713ab502ca4b0"}',
		height: 125247,
		index: 1,
	},
	{
		eventStr:
			'{"data":{"address":"lskd2ohufqtv7fqtnv75ca2w23krz2692mxvj8q3c","tokenID":"0400000000000000","amount":"94953271","result":0},"index":0,"module":"token","name":"mint","topics":["03","lskd2ohufqtv7fqtnv75ca2w23krz2692mxvj8q3c","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125246,"id":"51291dcc8010176f33f2a250d00869d5c423ad053204a204ebcb4a1b5dd19bc4"}',
		height: 125246,
		index: 0,
	},
	{
		eventStr:
			'{"data":{"amount":"94953271","reduction":0},"index":1,"module":"dynamicReward","name":"rewardMinted","topics":["03","lskd2ohufqtv7fqtnv75ca2w23krz2692mxvj8q3c","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125246,"id":"75ae7452e1d304b846e1531c73f696d169b38926a603df4092cd4c2c924fbe75"}',
		height: 125246,
		index: 1,
	},
	{
		eventStr:
			'{"data":{"address":"lskfok9nevnkj8pzh8nr6rtmrtn4zmrp9g66ygbqg","tokenID":"0400000000000000","amount":"94953271","result":0},"index":0,"module":"token","name":"mint","topics":["03","lskfok9nevnkj8pzh8nr6rtmrtn4zmrp9g66ygbqg","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125245,"id":"af100a3fcfc221b0c62edb60bc88a78633e17f5bda449dc43216c2dedda3f20c"}',
		height: 125245,
		index: 0,
	},
	{
		eventStr:
			'{"data":{"amount":"94953271","reduction":0},"index":1,"module":"dynamicReward","name":"rewardMinted","topics":["03","lskfok9nevnkj8pzh8nr6rtmrtn4zmrp9g66ygbqg","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125245,"id":"5f31caae2e0a606a86b1425d49ab1d6543d06fe42b39b97397e9739d8ed87785"}',
		height: 125245,
		index: 1,
	},
	{
		eventStr:
			'{"data":{"address":"lskbnqdbfhxefdr5q6ovtcynrbhzvhf6d9qhsyntg","tokenID":"0400000000000000","amount":"94953271","result":0},"index":0,"module":"token","name":"mint","topics":["03","lskbnqdbfhxefdr5q6ovtcynrbhzvhf6d9qhsyntg","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125244,"id":"6d15e5798dbc1e7b43fdd9d9c66d95f181dc4349ed8821e8209aa73c28939406"}',
		height: 125244,
		index: 0,
	},
	{
		eventStr:
			'{"data":{"amount":"94953271","reduction":0},"index":1,"module":"dynamicReward","name":"rewardMinted","topics":["03","lskbnqdbfhxefdr5q6ovtcynrbhzvhf6d9qhsyntg","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125244,"id":"0d39438acc199f647af69ecfb675775f31bf8b1dcbd3cf5f0d6fdecfb68a7910"}',
		height: 125244,
		index: 1,
	},
	{
		eventStr:
			'{"data":{"address":"lskw68y3kyus7ota9mykr726aby44mw574m8dkngu","tokenID":"0400000000000000","amount":"94953271","result":0},"index":0,"module":"token","name":"mint","topics":["03","lskw68y3kyus7ota9mykr726aby44mw574m8dkngu","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125243,"id":"48131594ec7324a815f43d0e5e6122104a0c0573e97760abb53c5930ac1f481b"}',
		height: 125243,
		index: 0,
	},
	{
		eventStr:
			'{"data":{"amount":"94953271","reduction":0},"index":1,"module":"dynamicReward","name":"rewardMinted","topics":["03","lskw68y3kyus7ota9mykr726aby44mw574m8dkngu","c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b"],"height":125243,"id":"8c50ade215fd89a9e351a338cd8389bec6d64babb03dbc8611d5bdd433cec181"}',
		height: 125243,
		index: 1,
	},
];

const mockGetEventsResult = {
	data: [
		{
			data: {
				address: 'lskfonwc5wpgy5873ckejqujwp3uwvtagejrjftpp',
				tokenID: '0400000000000000',
				amount: '94953271',
				result: 0,
			},
			index: 0,
			module: 'token',
			name: 'mint',
			topics: [
				'03',
				'lskfonwc5wpgy5873ckejqujwp3uwvtagejrjftpp',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125247,
			id: '392eadd8f1703efd2b9d5fae72e272da1806fc3fb667c67e0ef71035f941710f',
			block: {
				height: 125247,
			},
		},
		{
			data: {
				amount: '94953271',
				reduction: 0,
			},
			index: 1,
			module: 'dynamicReward',
			name: 'rewardMinted',
			topics: [
				'03',
				'lskfonwc5wpgy5873ckejqujwp3uwvtagejrjftpp',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125247,
			id: '180fccd1d16dd9806454e2a5f48da020aa5590df0100c72659e713ab502ca4b0',
			block: {
				height: 125247,
			},
		},
		{
			data: {
				address: 'lskd2ohufqtv7fqtnv75ca2w23krz2692mxvj8q3c',
				tokenID: '0400000000000000',
				amount: '94953271',
				result: 0,
			},
			index: 0,
			module: 'token',
			name: 'mint',
			topics: [
				'03',
				'lskd2ohufqtv7fqtnv75ca2w23krz2692mxvj8q3c',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125246,
			id: '51291dcc8010176f33f2a250d00869d5c423ad053204a204ebcb4a1b5dd19bc4',
			block: {
				height: 125246,
			},
		},
		{
			data: {
				amount: '94953271',
				reduction: 0,
			},
			index: 1,
			module: 'dynamicReward',
			name: 'rewardMinted',
			topics: [
				'03',
				'lskd2ohufqtv7fqtnv75ca2w23krz2692mxvj8q3c',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125246,
			id: '75ae7452e1d304b846e1531c73f696d169b38926a603df4092cd4c2c924fbe75',
			block: {
				height: 125246,
			},
		},
		{
			data: {
				address: 'lskfok9nevnkj8pzh8nr6rtmrtn4zmrp9g66ygbqg',
				tokenID: '0400000000000000',
				amount: '94953271',
				result: 0,
			},
			index: 0,
			module: 'token',
			name: 'mint',
			topics: [
				'03',
				'lskfok9nevnkj8pzh8nr6rtmrtn4zmrp9g66ygbqg',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125245,
			id: 'af100a3fcfc221b0c62edb60bc88a78633e17f5bda449dc43216c2dedda3f20c',
			block: {
				height: 125245,
			},
		},
		{
			data: {
				amount: '94953271',
				reduction: 0,
			},
			index: 1,
			module: 'dynamicReward',
			name: 'rewardMinted',
			topics: [
				'03',
				'lskfok9nevnkj8pzh8nr6rtmrtn4zmrp9g66ygbqg',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125245,
			id: '5f31caae2e0a606a86b1425d49ab1d6543d06fe42b39b97397e9739d8ed87785',
			block: {
				height: 125245,
			},
		},
		{
			data: {
				address: 'lskbnqdbfhxefdr5q6ovtcynrbhzvhf6d9qhsyntg',
				tokenID: '0400000000000000',
				amount: '94953271',
				result: 0,
			},
			index: 0,
			module: 'token',
			name: 'mint',
			topics: [
				'03',
				'lskbnqdbfhxefdr5q6ovtcynrbhzvhf6d9qhsyntg',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125244,
			id: '6d15e5798dbc1e7b43fdd9d9c66d95f181dc4349ed8821e8209aa73c28939406',
			block: {
				height: 125244,
			},
		},
		{
			data: {
				amount: '94953271',
				reduction: 0,
			},
			index: 1,
			module: 'dynamicReward',
			name: 'rewardMinted',
			topics: [
				'03',
				'lskbnqdbfhxefdr5q6ovtcynrbhzvhf6d9qhsyntg',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125244,
			id: '0d39438acc199f647af69ecfb675775f31bf8b1dcbd3cf5f0d6fdecfb68a7910',
			block: {
				height: 125244,
			},
		},
		{
			data: {
				address: 'lskw68y3kyus7ota9mykr726aby44mw574m8dkngu',
				tokenID: '0400000000000000',
				amount: '94953271',
				result: 0,
			},
			index: 0,
			module: 'token',
			name: 'mint',
			topics: [
				'03',
				'lskw68y3kyus7ota9mykr726aby44mw574m8dkngu',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125243,
			id: '48131594ec7324a815f43d0e5e6122104a0c0573e97760abb53c5930ac1f481b',
			block: {
				height: 125243,
			},
		},
		{
			data: {
				amount: '94953271',
				reduction: 0,
			},
			index: 1,
			module: 'dynamicReward',
			name: 'rewardMinted',
			topics: [
				'03',
				'lskw68y3kyus7ota9mykr726aby44mw574m8dkngu',
				'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			],
			height: 125243,
			id: '8c50ade215fd89a9e351a338cd8389bec6d64babb03dbc8611d5bdd433cec181',
			block: {
				height: 125243,
			},
		},
	],
	meta: {
		count: 10,
		offset: 0,
		total: 10,
	},
};

const mockEventTopicsQueryParams = {
	whereIn: {
		property: 'topic',
		values: [
			'03',
			'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			'lskw68y3kyus7ota9mykr726aby44mw574m8dkngu',
			'04c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			'05c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
		],
	},
	groupBy: 'eventID',
	havingRaw: 'COUNT(DISTINCT topic) = 3',
};

module.exports = {
	mockEventTopics,
	mockEventsForEventTopics,
	mockGetEventsResult,
	mockEventTopicsQueryParams,
};
