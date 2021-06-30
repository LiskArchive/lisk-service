/* eslint-disable import/no-extraneous-dependencies,eqeqeq,consistent-return */

/*
* moleculer
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer)
 * MIT Licensed
 */
const _ = require('lodash');
const kleur = require('kleur');
const util = require('util');
const {
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

module.exports = {
	methods: {
		async httpHandler(req, res, next) {
			req.$startTime = process.hrtime();
			req.$service = this;
			req.$next = next;
			res.$service = this;
			res.locals = res.locals || {};

			let requestID = req.headers['x-request-id'];
			if (req.headers['x-correlation-id']) requestID = req.headers['x-correlation-id'];
			const options = { requestID };
			if (this.settings.rootCallOptions) {
				if (_.isPlainObject(this.settings.rootCallOptions)) {
					Object.assign(options, this.settings.rootCallOptions);
				} else if (_.isFunction(this.settings.rootCallOptions)) {
					this.settings.rootCallOptions.call(this, options, req, res);
				}
			}
			try {
				const result = await this.actions.rest({ req, res }, options);
				if (result == null) {
					if (this.serve) {
						this.serve(req, res, err => {
							this.logger.debug(err);
							this.send404(req, res);
						});
						return;
					}
					this.send404(req, res);
				}
			} catch (err) {
				if (this.settings.log4XXResponses || (err && !_.inRange(err.code, 400, 500))) {
					const reqParams = Object
						.fromEntries(new Map(Object.entries(req.$params).filter(([, v]) => v)));
					if (err instanceof ValidationException === false) this.logger.error(`<= ${this.coloringStatusCode(err.code)} Request error: ${err.name}: ${err.message} \n${err.stack} \nData: \nRequest params: ${util.inspect(reqParams)} \nRequest body: ${util.inspect(req.body)}`);
				}
				this.sendError(req, res, err);
			}
		},

		logResponse(req, res, data) {
			if (req.$route && !req.$route.logging) return;

			let time = '';
			if (req.$startTime) {
				const diff = process.hrtime(req.$startTime);
				const duration = (diff[0] + diff[1] / 1e9) * 1000;
				if (duration > 1000) time = kleur.red(`[+${Number(duration / 1000).toFixed(3)} s]`);
				else time = kleur.grey(`[+${Number(duration).toFixed(3)} ms]`);
			}

			if (this.settings.enable2XXResponses) {
				if (this.settings.log2XXResponses && this.settings.log2XXResponses in this.logger) {
					this.logger[this.settings.log2XXResponses](`<= ${this.coloringStatusCode(res.statusCode)} ${req.method} ${kleur.bold(req.originalUrl)} ${time}`);
				}
				if (this.settings.logResponseData && this.settings.logResponseData in this.logger) {
					this.logger[this.settings.logResponseData]('  Data:', data);
				}
			}
		},

		async callAction(route, actionName, req, res, params) {
			const ctx = req.$ctx;

			try {
				// Logging params
				if (route.logging) {
					if (this.settings.enableHTTPRequest) {
						if (this.settings.logRequest && this.settings.logRequest in this.logger) {
							this.logger[this.settings.logRequest](`   Call '${actionName}' action`);
						}
						if (this.settings.logRequestParams && this.settings.logRequestParams in this.logger) {
							this.logger[this.settings.logRequestParams]('   Params:', params);
						}
					}
				}
				// Pass the `req` & `res` vars to ctx.params.
				if (req.$alias && req.$alias.passReqResToParams) {
					params.$req = req;
					params.$res = res;
				}
				if (req.baseUrl) req.$endpoint.baseUrl = req.baseUrl;

				// Call the action
				let data = await ctx.call(req.$endpoint, params, route.callOptions);

				// Post-process the response

				// onAfterCall handling
				if (route.onAfterCall) {
					data = await route.onAfterCall.call(this, ctx, route, req, res, data);
				}

				// Send back the response
				this.sendResponse(req, res, data, req.$endpoint.action);
				if (route.logging) this.logResponse(req, res, data);

				return true;
			} catch (err) {
				/* istanbul ignore next */
				if (!err) return; // Cancelling promise chain, no error
				throw err;
			}
		},

		logRequest(req) {
			if (req.$route && !req.$route.logging) return;
			if (this.settings.enableHTTPRequest) {
				if (this.settings.logRequest && this.settings.logRequest in this.logger) this.logger[this.settings.logRequest](`=> ${req.method} ${req.url}`);
			}
		},
	},

};
