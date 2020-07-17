.PHONY: clean coldstart mrproper up build
all: build up

compose := docker-compose \
	-f docker-compose.yml \
	-f lisk_service/docker-compose.core.yml \
	-f lisk_service/docker-compose.gateway.yml \
	-f lisk_service/docker-compose.gateway-ports.yml \
	-f docker-compose.testnet.yml

up:
	cd ./docker && $(compose) up --detach

down:
	cd ./docker && $(compose) down --volumes --remove-orphans

build: build-core build-gateway

build-core:
	cd ./services/core && docker build --tag=lisk/service_core ./

build-gateway:
	cd ./services/gateway && docker build --tag=lisk/service_gateway ./

build-template:
	cd ./services/template && docker build --tag=lisk/service_template ./

clean:
	docker rmi lisk/service_gateway lisk/service_core lisk/service_template


mrproper: down clean
