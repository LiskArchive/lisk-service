.PHONY: clean coldstart mrproper up build logs
all: build up

compose := docker-compose

up:
	$(compose) up -d

down:
	$(compose) down --volumes --remove-orphans

start:
	$(compose) start

stop:
	$(compose) stop

restart: 
	$(compose) restart

backup-db:
	$(compose) exec -T mysql-primary mysqldump --set-gtid-purged=OFF --no-create-db lisk -u root -ppassword > mysql_indexer_index.sql

restore-db:
	$(compose) exec -T mysql-primary mysql lisk -u root -ppassword < mysql_indexer_index.sql

flush-db:
	echo "DROP DATABASE lisk; CREATE DATABASE lisk;" | $(compose) exec -T mysql-primary mysql -u root -ppassword

stop-%:
	$(compose) stop $*

start-%:
	$(compose) start $*

ready:
	$(compose) exec -T tests curl --silent --fail 'http://gateway:9901/api/ready' >/dev/null

test: test-functional

test-functional:
	$(compose) exec -T tests yarn run test:functional

test-integration:
	$(compose) exec -T tests yarn run test:integration:APIv3

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

build: build-local build-images

build-images: build-app-registry build-connector build-indexer build-coordinator build-statistics build-fees build-market build-export build-gateway

build-all: build build-template build-tests

build-app-registry:
	cd ./services/blockchain-app-registry && docker buildx build --tag=lisk/service_blockchain_app_registry ./

build-connector:
	cd ./services/blockchain-connector && docker buildx build --tag=lisk/service_blockchain_connector ./	

build-indexer:
	cd ./services/blockchain-indexer && docker buildx build --tag=lisk/service_blockchain_indexer ./

build-coordinator:
	cd ./services/blockchain-coordinator && docker buildx build --tag=lisk/service_blockchain_coordinator ./

build-statistics:
	cd ./services/transaction-statistics && docker buildx build --tag=lisk/service_transaction_statistics ./

build-fees:
	cd ./services/fee-estimator && docker buildx build --tag=lisk/service_fee_estimator ./

build-market:
	cd ./services/market && docker buildx build --tag=lisk/service_market ./

build-export:
	cd ./services/export && docker buildx build --tag=lisk/service_export ./

build-gateway:
	cd ./services/gateway && docker buildx build --tag=lisk/service_gateway ./

build-template:
	cd ./services/template && docker buildx build --tag=lisk/service_template ./

build-tests:
	cd ./tests && docker buildx build --tag=lisk/service_tests ./

build-local:
	yarn install --frozen-lockfile
	cd ./framework && yarn install --frozen-lockfile
	cd ./services/blockchain-app-registry && yarn install --frozen-lockfile
	cd ./services/blockchain-connector && yarn install --frozen-lockfile
	cd ./services/blockchain-coordinator && yarn install --frozen-lockfile
	cd ./services/blockchain-indexer && yarn install --frozen-lockfile
	cd ./services/transaction-statistics && yarn install --frozen-lockfile
	cd ./services/fee-estimator && yarn install --frozen-lockfile
	cd ./services/market && yarn install --frozen-lockfile
	cd ./services/gateway && yarn install --frozen-lockfile
	cd ./services/export && yarn install --frozen-lockfile
	cd ./services/template && yarn install --frozen-lockfile
	cd ./tests && yarn install --frozen-lockfile

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
	lisk/service_export \
	lisk/service_template \
	lisk/service_tests; :

audit:
	yarn audit; :
	cd ./framework && yarn audit; :
	cd ./services/blockchain-app-registry && yarn audit; :
	cd ./services/blockchain-connector && yarn audit; :
	cd ./services/blockchain-coordinator && yarn audit; :
	cd ./services/blockchain-indexer && yarn audit; :
	cd ./services/transaction-statistics && yarn audit; :
	cd ./services/fee-estimator && yarn audit; :
	cd ./services/market && yarn audit; :
	cd ./services/gateway && yarn audit; :
	cd ./services/export && yarn audit; :

audit-fix:
	yarn audit fix; :
	cd ./framework && yarn audit fix; :
	cd ./services/blockchain-app-registry && yarn audit fix; :
	cd ./services/blockchain-connector && yarn audit fix; :
	cd ./services/blockchain-coordinator && yarn audit fix; :
	cd ./services/blockchain-indexer && yarn audit fix; :
	cd ./services/transaction-statistics && yarn audit fix; :
	cd ./services/fee-estimator && yarn audit fix; :
	cd ./services/market && yarn audit fix; :
	cd ./services/gateway && yarn audit fix; :
	cd ./services/export && yarn audit fix; :

tag-%:
	yarn version --no-git-tag-version --new-version $*
	cd services/gateway && yarn version --no-git-tag-version --new-version $*
	cd services/blockchain-app-registry && yarn version --no-git-tag-version --new-version $*
	cd services/blockchain-connector && yarn version --no-git-tag-version --new-version $*
	cd services/blockchain-coordinator && yarn version --no-git-tag-version --new-version $*
	cd services/blockchain-indexer && yarn version --no-git-tag-version --new-version $*
	cd services/transaction-statistics && yarn version --no-git-tag-version --new-version $*
	cd services/fee-estimator && yarn version --no-git-tag-version --new-version $*
	cd services/market && yarn version --no-git-tag-version --new-version $*
	cd services/export && yarn version --no-git-tag-version --new-version $*
	cd services/template && yarn version --no-git-tag-version --new-version $*
	git add ./services/gateway/package.json
	git add ./services/blockchain-app-registry/package.json
	git add ./services/blockchain-connector/package.json
	git add ./services/blockchain-coordinator/package.json
	git add ./services/blockchain-indexer/package.json
	git add ./services/transaction-statistics/package.json
	git add ./services/fee-estimator/package.json
	git add ./services/market/package.json
	git add ./services/export/package.json
	git add ./services/template/package.json
	git add ./package.json
	git commit -S -m ":arrow_up: Version bump to $*"
	git tag v$*

mrproper: down clean
