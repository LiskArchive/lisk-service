#!/bin/bash

mysql -h"$HOSTNAME" -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" --silent -e"use $MARIADB_DATABASE" 
