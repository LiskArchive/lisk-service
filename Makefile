.PHONY: clean coldstart mrproper up build
all: build up

compose := docker-compose \
	-f docker-compose.yml \
	-f lisk_service/docker-compose.core.yml \
	-f lisk_service/docker-compose.gateway.yml \
	-f lisk_service/docker-compose.gateway-ports.yml \
	-f docker-compose.mainnet.yml

up:
	cd ./docker && $(compose) up --detach

down:
	cd ./docker && $(compose) down --volumes --remove-orphans

cli-%:
	cd ./docker && $(compose) exec $* /bin/sh

logs:
	cd ./docker && $(compose) logs

logs-%:
	cd ./docker && $(compose) logs $*

print-config:
	cd ./docker && $(compose) config

build: build-core build-gateway

build-all: build-core build-gateway build-template build-tests

build-core:
	cd ./services/core && docker build --tag=lisk/service_core ./

build-gateway:
	cd ./services/gateway && docker build --tag=lisk/service_gateway ./

build-template:
	cd ./services/template && docker build --tag=lisk/service_template ./

build-tests:
	cd ./tests && docker build --tag=lisk/service_tests ./

build-local:
	npm ci
	cd ./framework && npm ci
	cd ./services/core && npm ci
	cd ./services/gateway && npm ci
	cd ./services/template && npm ci
	cd ./tests && npm ci

clean:
	rm -rf node_modules
	cd ./framework && rm -rf node_modules
	cd ./services/core && rm -rf node_modules
	cd ./services/gateway && rm -rf node_modules
	cd ./services/template && rm -rf node_modules
	cd ./tests && rm -rf node_modules
	docker rmi lisk/service_gateway lisk/service_core lisk/service_template lisk/service_tests

tag-%:
	npm version --no-git-tag-version $*
	cd services/gateway && npm version --no-git-tag-version $*
	cd services/core && npm version --no-git-tag-version $*
	cd services/template && npm version --no-git-tag-version $*
	git add ./services/gateway/package*.json
	git add ./services/core/package*.json
	git add ./services/template/package*.json
	git add ./package*.json
	git commit -m "Version bump to $*"
	git tag v$*

mrproper: down clean
