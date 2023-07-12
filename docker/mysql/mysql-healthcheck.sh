#!/bin/bash

mysql -h"$HOSTNAME" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --silent -e"use $MYSQL_DATABASE"
