module.exports = [
	{
		path: "/v1",

		whitelist: [
			"core.*",
			"$node.*"
		],

		callOptions: {
			timeout: 3000,
			retries: 3,
			fallbackResponse: "Static fallback response"
		},

		authorization: false,
		mergeParams: true,
		
		uses: [],

		aliases: {
			"GET blocks": "core.blocks",
			"GET health": "$node.health"
		},

		mappingPolicy: "restrict",

		// Use bodyparser module
		bodyParsers: {
			json: true,
			urlencoded: { extended: true }
		},

		onAfterCall(ctx, route, req, res, data) {
			res.setHeader("X-Custom-Header", "123456");
			return data.data;
		},
	},
];
