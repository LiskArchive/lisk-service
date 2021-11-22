.PHONY: clean up down
all: up

compose := docker-compose -f docker-compose.yml

up:
	$(compose) up --detach

down:
	$(compose) down --volumes --remove-orphans

logs:
	$(compose) logs

clean: down

cli:
	$(compose) exec mysql mysql -u root -ppassword lisk
