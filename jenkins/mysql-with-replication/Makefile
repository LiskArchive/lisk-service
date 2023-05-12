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

cli-primary:
	$(compose) exec mysql-primary mysql -u root -ppassword lisk

cli-replica:
	$(compose) exec mysql-replica mysql -u root -ppassword lisk
