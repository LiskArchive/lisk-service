.PHONY: clean coldstart mrproper up build logs
all: build up

compose := docker-compose

up:
	$(compose) up -d

down:
	$(compose) down --volumes --remove-orphans

restart: 
	$(compose) restart

backup-db:
	$(compose) exec -T mysql mysqldump --no-create-db lisk -u root -ppassword > mysql_core_index.sql

restore-db:
	$(compose) exec -T mysql mysql lisk -u root -ppassword < mysql_core_index.sql

flush-db:
	 echo "DROP DATABASE lisk; CREATE DATABASE lisk;" | $(compose) exec -T mysql mysql -u root -ppassword

stop-%:
	$(compose) stop $*

start-%:
	$(compose) start $*

ready:
	$(compose) exec -T tests curl --silent --fail 'http://gateway:9901/api/ready' >/dev/null

test: test-functional

test-functional:
	$(compose) exec -T tests npm run test:functional

test-integration:
	$(compose) exec -T tests npm run test:integration:APIv2:SDKv5

cli: cli-gateway

cli-%:
	$(compose) exec $* /bin/sh

mysql-%:
	$(compose) exec mysql_$* mysql -u root -ppassword lisk

redis-%:
	$(compose) exec redis_$* redis-cli

logs:
	$(compose) logs

logs-live:
	$(compose) logs --follow

logs-%:
	$(compose) logs $*

logs-live-%:
	$(compose) logs $* --follow

print-config:
	$(compose) config

build: build-app-registry build-connector build-indexer build-coordinator build-statistics build-fees build-market build-newsfeed build-export build-gateway

build-all: build build-template build-tests

build-app-registry:
	cd ./services/blockchain-app-registry && docker build --tag=lisk/service_blockchain_app_registry ./

build-connector:
	cd ./services/blockchain-connector && docker build --tag=lisk/service_blockchain_connector ./	

build-indexer:
	cd ./services/blockchain-indexer && docker build --tag=lisk/service_blockchain_indexer ./

build-coordinator:
	cd ./services/blockchain-coordinator && docker build --tag=lisk/service_blockchain_coordinator ./

build-statistics:
	cd ./services/transaction-statistics && docker build --tag=lisk/service_transaction_statistics ./

build-fees:
	cd ./services/fee-estimator && docker build --tag=lisk/service_fee_estimator ./

build-market:
	cd ./services/market && docker build --tag=lisk/service_market ./
	
build-newsfeed:
	cd ./services/newsfeed && docker build --tag=lisk/service_newsfeed ./

build-export:
	cd ./services/export && docker build --tag=lisk/service_export ./

build-gateway:
	cd ./services/gateway && docker build --tag=lisk/service_gateway ./

build-template:
	cd ./services/template && docker build --tag=lisk/service_template ./

build-tests:
	cd ./tests && docker build --tag=lisk/service_tests ./

build-local:
	npm ci
	cd ./framework && npm ci
	cd ./services/blockchain-app-registry && npm i --registry https://npm.lisk.com
	cd ./services/blockchain-connector && npm i --registry https://npm.lisk.com
	cd ./services/blockchain-coordinator && npm i --registry https://npm.lisk.com
	cd ./services/blockchain-indexer && npm i --registry https://npm.lisk.com
	cd ./services/transaction-statistics && npm i --registry https://npm.lisk.com
	cd ./services/fee-estimator && npm i --registry https://npm.lisk.com
	cd ./services/market && npm i --registry https://npm.lisk.com
	cd ./services/newsfeed && npm i --registry https://npm.lisk.com
	cd ./services/gateway && npm i --registry https://npm.lisk.com
	cd ./services/export && npm i --registry https://npm.lisk.com
	cd ./services/template && npm i --registry https://npm.lisk.com
	cd ./tests && npm i --registry https://npm.lisk.com

clean: clean-local clean-images

clean-local:
	rm -rf node_modules
	cd ./framework && rm -rf node_modules
	cd ./services/blockchain-app-registry && rm -rf node_modules
	cd ./services/blockchain-connector && rm -rf node_modules
	cd ./services/blockchain-coordinator && rm -rf node_modules
	cd ./services/blockchain-indexer && rm -rf node_modules
	cd ./services/transaction-statistics && rm -rf node_modules
	cd ./services/fee-estimator && rm -rf node_modules
	cd ./services/market && rm -rf node_modules
	cd ./services/newsfeed && rm -rf node_modules
	cd ./services/gateway && rm -rf node_modules
	cd ./services/export && rm -rf node_modules
	cd ./services/template && rm -rf node_modules
	cd ./tests && rm -rf node_modules

clean-images:
	docker rmi lisk/service_gateway \
	lisk/service_blockchain_app_registry \
	lisk/service_blockchain_connector \
	lisk/service_blockchain_indexer \
	lisk/service_blockchain_coordinator \
	lisk/service_transaction_statistics \
	lisk/service_fee_estimator \
	lisk/service_market \
	lisk/service_newsfeed \
	lisk/service_export \
	lisk/service_template \
	lisk/service_tests; :

audit:
	npm audit; :
	cd ./framework && npm audit; :
	cd ./services/blockchain-app-registry && npm audit; :
	cd ./services/blockchain-connector && npm audit; :
	cd ./services/blockchain-coordinator && npm audit; :
	cd ./services/blockchain-indexer && npm audit; :
	cd ./services/transaction-statistics && npm audit; :
	cd ./services/fee-estimator && npm audit; :
	cd ./services/market && npm audit; :
	cd ./services/newsfeed && npm audit; :
	cd ./services/gateway && npm audit; :
	cd ./services/export && npm audit; :

audit-fix:
	npm audit fix; :
	cd ./framework && npm audit fix; :
	cd ./services/blockchain-app-registry && npm audit fix; :
	cd ./services/blockchain-connector && npm audit fix; :
	cd ./services/blockchain-coordinator && npm audit fix; :
	cd ./services/blockchain-indexer && npm audit fix; :
	cd ./services/transaction-statistics && npm audit fix; :
	cd ./services/fee-estimator && npm audit fix; :
	cd ./services/market && npm audit fix; :
	cd ./services/newsfeed && npm audit fix; :
	cd ./services/gateway && npm audit fix; :
	cd ./services/export && npm audit fix; :

tag-%:
	npm version --no-git-tag-version --allow-same-version $*
	cd services/gateway && npm version --no-git-tag-version --allow-same-version $*
	cd services/blockchain-app-registry && npm version --no-git-tag-version --allow-same-version $*
	cd services/blockchain-connector && npm version --no-git-tag-version --allow-same-version $*
	cd services/blockchain-coordinator && npm version --no-git-tag-version --allow-same-version $*
	cd services/blockchain-indexer && npm version --no-git-tag-version --allow-same-version $*
	cd services/transaction-statistics && npm version --no-git-tag-version --allow-same-version $*
	cd services/fee-estimator && npm version --no-git-tag-version --allow-same-version $*
	cd services/market && npm version --no-git-tag-version --allow-same-version $*
	cd services/newsfeed && npm version --no-git-tag-version --allow-same-version $*
	cd services/export && npm version --no-git-tag-version --allow-same-version $*
	cd services/template && npm version --no-git-tag-version --allow-same-version $*
	git add ./services/gateway/package*.json
	git add ./services/blockchain-app-registry/package*.json
	git add ./services/blockchain-connector/package*.json
	git add ./services/blockchain-coordinator/package*.json
	git add ./services/blockchain-indexer/package*.json
	git add ./services/transaction-statistics/package*.json
	git add ./services/fee-estimator/package*.json
	git add ./services/market/package*.json
	git add ./services/newsfeed/package*.json
	git add ./services/export/package*.json
	git add ./services/template/package*.json
	git add ./package*.json
	git commit -m ":arrow_up: Version bump to $*"
	git tag v$*

mrproper: down clean
