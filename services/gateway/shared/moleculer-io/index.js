/* eslint-disable */
'use strict';

const IO = require('socket.io');
const _ = require('lodash');
const { match } = require('moleculer').Utils;
const { ServiceNotFoundError } = require("moleculer").Errors;
const { BadRequestError } = require('./errors');
const config = require('../../config');
const chalk = require('chalk');

const util = require('util');

const BluebirdPromise = require('bluebird');

const {
  Constants: { JSON_RPC: { INVALID_REQUEST, METHOD_NOT_FOUND, SERVER_ERROR } },
  Utils,
} = require('lisk-service-framework');

module.exports = {
  name: 'io',
  settings: {
    // port: 3000,
    server: true,
    io: {
      // options: {}, //socket.io options
      namespaces: {
        '/': {
          // authorization: false,
          // middlewares: [],
          // packetMiddlewares:[],
          events: {
            call: {
              // whitelist: [],
              // aliases: {},
              // mappingPolicy: 'all',
              // callOptions:{},
              // onBeforeCall: async function(ctx, socket, args){
              //   ctx.meta.socketid = socket.id
              // },
              // onAfterCall:async function(ctx, socket, data){
              //  socket.emit('afterCall', data)
              // }
            }
          }
        }
      }
    }
  },
  created() {
    let handlers = {};
    let namespaces = this.settings.io.namespaces;
    for (let nsp in namespaces) {
      let item = namespaces[nsp];
      this.logger.debug('Add route:', util.inspect(item));
      if (!handlers[nsp]) handlers[nsp] = {};
      let events = item.events;
      for (let event in events) {
        let handler = events[event];
        if (typeof handler === 'function') {
          //custom handler
          handlers[nsp][event] = handler;
        } else {
          handlers[nsp][event] = makeHandler(this, handler);
        }
      }
    }
    this.settings.io.handlers = handlers;
  },
  started() {
    if (!this.io) {
      this.initSocketIO();
    }
    let namespaces = this.settings.io.namespaces;
    for (let nsp in namespaces) {
      let item = namespaces[nsp];
      let namespace = this.io.of(nsp);
      if (item.authorization) {
        this.logger.debug(`Add authorization to handler:`, item);
        if (!_.isFunction(this.socketAuthorize)) {
          this.logger.warn("Define 'socketAuthorize' method in the service to enable authorization.");
          item.authorization = false;
        } else {
          // add authorize middleware
          namespace.use(makeAuthorizeMiddleware(this, item));
        }
      }
      if (item.middlewares) {
        //Server middlewares
        for (let middleware of item.middlewares) {
          namespace.use(middleware.bind(this));
        }
      }
      let handlers = this.settings.io.handlers[nsp];
      namespace.on('connection', socket => {
        socket.$service = this;
        this.logger.debug(`(nsp:'${nsp}') Client connected:`, socket.id);
        if (item.packetMiddlewares) {
          //socketmiddlewares
          for (let middleware of item.packetMiddlewares) {
            socket.use(middleware.bind(this));
          }
        }
        for (let eventName in handlers) {
          socket.on(eventName, handlers[eventName]);
        }
      });
    }
    this.logger.info('Socket.io API Gateway started.');
  },
  stopped() {
    if (this.io) {
      this.io.close();
    }
  },
  actions: {
    call: {
      visibility: "private",
      async handler(ctx) {
        let { socket, action, params, handlerItem } = ctx.params;
        if (!_.isString(action)) {
          this.logger.debug(`BadRequest:action is not string! action:`, action);
          throw new BadRequestError();
        }
        // Handle aliases
        let aliased = false;
        const original = action;
        if (handlerItem.aliases) {
          const alias = handlerItem.aliases[action];
          if (alias) {
            aliased = true;
            action = alias;
          } else if (handlerItem.mappingPolicy === 'restrict') {
            throw new ServiceNotFoundError({ action });
          }
        } else if (handlerItem.mappingPolicy === 'restrict') {
          throw new ServiceNotFoundError({ action });
        }
        //Check whitelist
        if (handlerItem.whitelist && !checkWhitelist(action, handlerItem.whitelist)) {
          this.logger.debug(`Service "${action}" not in whitelist`);
          throw new ServiceNotFoundError({ action });
        }
        // Check endpoint visibility
        const endpoint = this.broker.findNextActionEndpoint(action);
        if (endpoint instanceof Error) throw endpoint;
        if (endpoint.action.visibility != null && endpoint.action.visibility != "published") {
          // Action can't be published
          throw new ServiceNotFoundError({ action });
        }
        // get callOptions
        let opts = _.assign({
          meta: this.socketGetMeta(socket),
          callOptions: {
            timeout: 30000,
            retries: 3,
          },
        }, handlerItem.callOptions);
        this.logger.debug('Call action:', action, params, opts);
        const request = {
          action,
          method: params.method,
          params: params.params
        }
        if (handlerItem.onBeforeCall) {
          await handlerItem.onBeforeCall.call(this, ctx, socket, request, opts);
        }
        let res = await ctx.call(action, request.params, opts);
        if (handlerItem.onAfterCall) {
          res = (await handlerItem.onAfterCall.call(this, ctx, socket, request, res)) || res;
        }
        this.socketSaveMeta(socket, ctx);
        if (ctx.meta.$join) {
          await this.socketJoinRooms(socket, ctx.meta.$join);
        }
        if (ctx.meta.$leave) {
          if (_.isArray(ctx.meta.$leave)) {
            await Promise.all(ctx.meta.$leave.map(room => this.socketLeaveRoom(socket, room)));
          } else {
            await this.socketLeaveRoom(socket, ctx.meta.$leave);
          }
        }
        return res;
      }
    },
    broadcast: {
      params: {
        event: { type: 'string' },
        namespace: { type: 'string', optional: true },
        args: { type: 'array', optional: true },
        volatile: { type: 'boolean', optional: true },
        local: { type: 'boolean', optional: true },
        rooms: { type: 'array', items: 'string', optional: true }
      },
      async handler(ctx) {
        this.logger.debug('broadcast: ', ctx.params);
        let namespace = this.io;
        if (ctx.params.namespace) {
          namespace = namespace.of(ctx.params.namespace);
        }
        if (ctx.params.volate) namespace = namespace.volate;
        if (ctx.params.local) namespace = namespace.local;
        if (ctx.params.rooms) {
          for (let room of ctx.params.rooms) {
            namespace = namespace.to(room);
          }
        }
        if (ctx.params.args) {
          namespace.emit(ctx.params.event, ...ctx.params.args);
        } else {
          namespace.emit(ctx.params.event);
        }
      }
    },
    getClients: {
      params: {
        namespace: { type: 'string', optional: true },
        room: 'string'
      },
      handler(ctx) {
        return new Promise((resolve, reject) => {
          this.io.of(ctx.params.namespaces || '/').to(ctx.params.room).clients((err, clients) => {
            if (err) {
              return reject(err);
            }
            resolve(clients);
          });
        });
      }
    }
  },
  methods: {
    initSocketIO(srv, opts) {
      if ('object' == typeof srv && srv instanceof Object && !srv.listen) {
        opts = srv;
        srv = null;
      }
      opts = opts || this.settings.io.options || {};
      srv = srv || this.server || (this.settings.server ? this.settings.port : undefined);
      if (this.settings.cors && this.settings.cors.origin && !opts.origins) {
        // cors settings
        opts.origins = function (origin, callback) {
          if (!this.settings.cors.origin || this.settings.cors.origin === "*") {
            this.logger.debug(`origin ${origin} is allowed.`);
            callback(null, true);
          } else if ((this.checkOrigin || checkOrigin)(origin, this.settings.cors.origin)) {
            this.logger.debug(`origin ${origin} is allowed by checkOrigin.`);
            callback(null, true);
          } else {
            this.logger.debug(`origin ${origin} is not allowed.`);
            return callback('origin not allowed', false);
          }
        }.bind(this);
      }
      this.io = new IO(srv, opts);
    },
    socketGetMeta(socket) {
      let meta = {
        user: socket.client.user,
        $rooms: Object.keys(socket.rooms)
      };
      this.logger.debug('getMeta', meta);
      return meta;
    },
    socketSaveMeta(socket, ctx) {
      this.socketSaveUser(socket, ctx.meta.user);
    },
    socketSaveUser(socket, user) {
      socket.client.user = user;
    },
    socketOnError(err, respond) {
      const errDebug = _.pick(err, ["jsonrpc", "name", "message", "code", "type", "data", "stack"]);
      this.logger.debug('socketOnError:', errDebug);
      const errObj = _.pick(err, ["jsonrpc", "name", "message", "code", "type", "data"]);
      return respond(errObj);
    },
    socketJoinRooms(socket, rooms) {
      this.logger.debug(`socket ${socket.id} join room:`, rooms);
      return new Promise(function (resolve, reject) {
        socket.join(rooms, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    socketLeaveRoom(socket, room) {
      return new Promise(function (resolve, reject) {
        socket.leave(room, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
};

function checkWhitelist(action, whitelist) {
  return whitelist.find(mask => {
    if (_.isString(mask)) {
      return match(action, mask);
    } else if (_.isRegExp(mask)) {
      return mask.test(action);
    }
  }) != null;
}

function checkOrigin(origin, settings) {
  if (_.isString(settings)) {
    if (settings.indexOf(origin) !== -1) return true;

    if (settings.indexOf("*") !== -1) {
      // Based on: https://github.com/hapijs/hapi
      // eslint-disable-next-line
      const wildcard = new RegExp(`^${_.escapeRegExp(settings).replace(/\\\*/g, ".*").replace(/\\\?/g, ".")}$`);
      return origin.match(wildcard);
    }
  } else if (Array.isArray(settings)) {
    for (let i = 0; i < settings.length; i++) {
      if (checkOrigin(origin, settings[i])) {
        return true;
      }
    }
  }

  return false;
}

function makeAuthorizeMiddleware(svc, handlerItem) {
  return async function authorizeMiddleware(socket, next) {
    try {
      let res = await svc.socketAuthorize(socket, handlerItem);
      if (res) svc.socketSaveUser(socket, res);
      next();
    } catch (e) {
      return next(e);
    }
  };
}

function addJsonRpcEnvelope(id = null, result) {
  return {
    jsonrpc: "2.0",   // standard JSON-RPC envelope
    result,           // response content
    id,               // Number of response in chain
  }
}

function addErrorEnvelope(id = null, code, message, data) {
  return {
    jsonrpc: "2.0",   // standard JSON-RPC envelope
    error: {
      code,           // error code
      message,        // error message
      data,           // error data (optional)
    },
    id,               // Number of response in chain
  }
}

function translateHttpToRpcCode(code) {
  if (code === 404) return METHOD_NOT_FOUND[0];
  if (code === 400) return INVALID_REQUEST[0];
  if (code === 500) return SERVER_ERROR[0];
  return SERVER_ERROR[0];
}


function makeHandler(svc, handlerItem) {
  svc.logger.debug('makeHandler:', util.inspect(handlerItem));
  return async function (requests, respond) {
    const performClientRequest = async (jsonRpcInput, id = 1) => {
      if (config.jsonRpcStrictMode === 'true' && (!jsonRpcInput.jsonrpc || jsonRpcInput.jsonrpc !== '2.0')) {
        const message = `The given data is not a proper JSON-RPC 2.0 request: ${util.inspect(jsonRpcInput)}`;
        svc.logger.debug(message);
        return addErrorEnvelope(id, INVALID_REQUEST[0], `Client input error: ${message}`);
      }
      if (!jsonRpcInput.method || typeof jsonRpcInput.method !== 'string') {
        const message = `Missing method in the request ${util.inspect(jsonRpcInput)}`;
        svc.logger.debug(message);
        return addErrorEnvelope(id, INVALID_REQUEST[0], `Client input error: ${message}`);
      }
      const action = jsonRpcInput.method;
      const params = jsonRpcInput.params;
      svc.logger.info(`   => Client '${this.id}' call '${action}'`);
      if (svc.settings.logRequestParams && svc.settings.logRequestParams in svc.logger) svc.logger[svc.settings.logRequestParams]("   Params:", params);
      try {
        if (_.isFunction(params)) {
          respond = params;
          params = null;
        }
        let res = await svc.actions.call({ socket: this, action, params: jsonRpcInput, handlerItem });
        svc.logger.info(`   <= ${chalk.green.bold('Success')} ${action}`);
        return addJsonRpcEnvelope(id, res);
      } catch (err) {
        if (svc.settings.log4XXResponses || Utils.isProperObject(err) && !_.inRange(err.code, 400, 500)) {
          svc.logger.error("   Request error!", err.name, ":", err.message, "\n", err.stack, "\nData:", err.data);
        }
        if (typeof err.message === 'string') {
          if (!err.code || err.code === 500) {
            return addErrorEnvelope(id, translateHttpToRpcCode(err.code), `Server error: ${err.message}`);
          }
          return addErrorEnvelope(id, translateHttpToRpcCode(err.code), err.message);
        } else {
          return addErrorEnvelope(id, err.message.code, err.message.message);
        }
      }
    };

    const MULTI_REQUEST_CONCURRENCY = 2;

    let singleResponse = false;
    if (!Array.isArray(requests)) {
      singleResponse = true;
      requests = [requests];
    }

    try {
      const responses = await BluebirdPromise.map(requests, async (request) => {
        const id = request.id || (requests.indexOf(request)) + 1;
        const response = await performClientRequest(request, id);
        svc.logger.debug(`Requested ${request.method} with params ${JSON.stringify(request.params)}`);
        if (response.error) {
          svc.logger.warn(`${response.error.code} ${response.error.message}`);
        }
        return response;
      }, { concurrency: MULTI_REQUEST_CONCURRENCY });

      if (singleResponse) respond(responses[0]);
      else respond(responses);
    } catch (err) {
      svc.socketOnError(addErrorEnvelope(null, translateHttpToRpcCode(err.code), `Server error: ${err.message}`), respond);
    }
  };
}