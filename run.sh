#!/bin/bash

set -x

cd /opt

: ${MONGODB_HOST:=localhost}
: ${MONGODB_PORT:=27017}
: ${MONGODB_NAME:=instruments}

node ./app.js -d $DOMAIN -a $ACCESS_TOKEN -i $ACCOUNT_ID -v $VERBOSE -m "mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_NAME}"
