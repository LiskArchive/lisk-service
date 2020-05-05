const http = require('./http');

const delay = (t, val) => new Promise((resolve) => {
	setTimeout(() => { resolve(val) }, t) });

/*
Request API

http.request(
	url,
	{
		... everything inherited from Axios
		cacheTTL: 30,
		retries: 20,
		retryDelay: 20,
	});

The response can contain a proper HTTP response
{
	status: 200,
	statusText: 'OK',
	...
}

But also errors such as:
{
	status: 'ECONNREFUSED',
	message: 'connect ECONNREFUSED 127.0.0.1:3000'
}
*/

const cacheTTL = 5 * 1000;

(async () => {
	// const url = 'https://mainnet-service-staging.lisk.io/api/v11/transactions/statistics/month';
	// const url = 'http://localhost:3001/200';
	// const url = 'http://localhost:3001/400';
	// const url = 'http://localhost:3001/500';
	// const url = 'http://localhost:3001/500';
	const url = 'http://localhost:3001/';

	const data = [];

	try {
		const resp = await http.request(
			url,
			{
				cacheTTL: cacheTTL,
				retries: 20,
				retryDelay: 20,
			});

		console.log(resp);
		data.push(resp.data);

		// await delay((cacheTTL));
		// // await delay(30);

		// const resp2 = await http.request(
		// 	url,
		// 	{
		// 		cacheTTL: cacheTTL,
		// 		retries: 20,
		// 		retryDelay: 20,
		// 	});

		// console.log(resp2);
		// data.push(resp2.data);

		// console.log(data);
	} catch (e) {
		console.log(`Error: ${e.message}`);
	}
})();
