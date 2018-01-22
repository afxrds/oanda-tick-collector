# OANDA Tick-Collector for Stream API

This project has been create as part of [Simple tick collector](https://afxrds.io/forex/tick/data/2018/01/16/simple-tick-collector.html) blog post. This project has been broadly based on [nodejs-api-streaming](https://github.com/oanda/nodejs-api-streaming)

Here I'm using NodeJS, Docker and MongoDB to collect ticks from OANDA's Stream API.
It's all dockerised to let you get off the ground as easy as possible. You will need:
- Docker
- Docker-compose (compatible with docker-compose API v2.1)
- OANDA demo account with Access Token and Account ID - just pop them in docker-compose.yaml under `services > tick-collector > environment > ACCOUNT_ID/ACCESS_TOKEN`


Intro
-----
Oanda's Stream API allows you to open TCP connection to an endpoint and continuously receive data (such as currency ticks). For health checking purpose the stream will also send 'health check' confirmation in some intervals (i.e. 10s) so that you can re-connect to the stream in case of an error. If error occurs we are going to exit NodeJS process and rely on Docker to start it again.


Remember, FX trading session starts at 10:00 PM GMT on Sunday and ends 10:00 PM GMT Friday - so try this example during week days :-)

Running
-------
Once you checkout/download source code into your computer set ACCOUNT_ID and ACCESS_TOKEN in docker-compose.yaml and then start it up with:
docker-compose -f docker-compose.yaml up -d
This will start container for MongoDB mapped to port 27018 _outside_ of docker (just in case you have mongodb db running on your machine!) and on default port 27017 _inside_ of docker context.
This will also build tick-collector container. That container will try to connect to MongoDB on `mongodb-host-alias:27017` which is routable inside of tick-collector context.
So, let's take a look what happens when you run it:
```bash
~/oanda-tick-collector$ docker-compose -f docker-compose.yaml up -d
Pulling mongodb (mongo:3.4-jessie)...
3.4-jessie: Pulling from library/mongo
c4bb02b17bb4: Pull complete
3f58e3bb3be4: Pull complete
(...)
76aeb242d479: Pull complete
bdc8171e92f4: Pull complete
Digest: sha256:38829565a5781afeecb287a6a2da6535396712718a63a4e2dcc7f006a0611cd7
Status: Downloaded newer image for mongo:3.4-jessie
Building tick-collector
Step 1/7 : FROM node:4-slim
4-slim: Pulling from library/node
f49cf87b52c1: Pull complete
(...)
Digest: sha256:91197cab2b14bb200f41f15c60a7cc797ea57cf25d6f04fce9bb38a86c373aca
Status: Downloaded newer image for node:4-slim
 ---> f7b2d40c7ef3
Step 2/7 : WORKDIR /opt
Removing intermediate container 72583fb7f8f1
 ---> 3f537a25173f
Step 3/7 : ADD app .
 ---> 9acb653d35ca
Step 4/7 : RUN npm install .
 ---> Running in 754bc720eed9
mongodb@2.2.19 node_modules/mongodb
├── es6-promise@3.2.1
├── readable-stream@2.1.5 (buffer-shims@1.0.0, string_decoder@0.10.31, inherits@2.0.3, process-nextick-args@1.0.7, util-deprecate@1.0.2, core-util-is@1.0.2, isarray@1.0.0)
└── mongodb-core@2.1.4 (bson@1.0.4, require_optional@1.0.1)
Removing intermediate container 754bc720eed9
 ---> 63a7f69f306d
Step 5/7 : COPY run.sh /opt/run.sh
 ---> 1f15a300c957
Step 6/7 : RUN chmod 755 /opt/run.sh
 ---> Running in 2639f39387b4
Removing intermediate container 2639f39387b4
 ---> 6be1a31f3f5a
Step 7/7 : ENTRYPOINT /opt/run.sh
 ---> Running in 16066bc10706
Removing intermediate container 16066bc10706
 ---> 464805044ee8
Successfully built 464805044ee8
Successfully tagged oandatickcollector_tick-collector:latest
WARNING: Image for service tick-collector was built because it did not already exist. To rebuild this image you must use `docker-composCreating oandatickcollector_mongodb_1        ... done
Creating oandatickcollector_mongodb_1        ...
Creating oandatickcollector_tick-collector_1 ... done
```

You can confirm containers are running with:
```bash
~oanda-tick-collector$ docker-compose ps
               Name                             Command             State            Ports
----------------------------------------------------------------------------------------------------
oandatickcollector_mongodb_1          docker-entrypoint.sh mongod   Up      0.0.0.0:27018->27017/tcp
oandatickcollector_tick-collector_1   /bin/sh -c /opt/run.sh        Up
```


Then, you can check what's going on with the collector by (use same name as above, i.e. `oandatickcollector_tick-collector_1`):
```bash
oanda-tick-collector$ docker logs --tail 100 -f oandatickcollector_tick-collector_1
{"tick":{"instrument":"EUR_USD","time":"2018-01-22T20:25:29.922781Z","bid":1.22575,"ask":1.22588}}
{"tick":{"instrument":"GBP_USD","time":"2018-01-22T20:25:29.747215Z","bid":1.39835,"ask":1.39854}}

{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:31.062432Z","bid":1.34559,"ask":1.34588}}
{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:31.064733Z","bid":1.34561,"ask":1.34591}}

{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:31.164968Z","bid":1.34565,"ask":1.34594}}
{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:31.365857Z","bid":1.3456,"ask":1.34592}}
{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:31.557625Z","bid":1.34561,"ask":1.3459}}

{"heartbeat":{"time":"2018-01-22T20:25:31.704895Z"}}

{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:31.776278Z","bid":1.34561,"ask":1.34589}}

{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:32.673593Z","bid":1.34561,"ask":1.3459}}

{"heartbeat":{"time":"2018-01-22T20:25:34.267554Z"}}

{"heartbeat":{"time":"2018-01-22T20:25:36.494538Z"}}

{"heartbeat":{"time":"2018-01-22T20:25:39.267614Z"}}

{"tick":{"instrument":"GBP_CHF","time":"2018-01-22T20:25:41.215247Z","bid":1.34561,"ask":1.34589}}

{"heartbeat":{"time":"2018-01-22T20:25:42.030811Z"}}

{"heartbeat":{"time":"2018-01-22T20:25:44.267665Z"}}
```

Above log will continue to appear as more ticks are being collected (that's the `-f` option of `docker logs`). You can make this less verbose by changing value of `VERBOSE` in `docker-compose.yaml` to `1`.

If you have mongo client locally, then you can connect to you dockerised mongo instance  by running `mongo mongodb://localhost:27018/instruments`. Pay attention that we are using port `27018` just like we mapped in `docker-compose.yaml` file.
```bash
~oanda-tick-collector$ mongo mongodb://localhost:27018/instruments
MongoDB shell version v3.4.10
connecting to: mongodb://localhost:27018/instruments
MongoDB server version: 3.4.10
Server has startup warnings:
2018-01-22T20:22:17.138+0000 I STORAGE  [initandlisten]
2018-01-22T20:22:17.138+0000 I STORAGE  [initandlisten] ** WARNING: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine
2018-01-22T20:22:17.138+0000 I STORAGE  [initandlisten] **          See http://dochub.mongodb.org/core/prodnotes-filesystem
2018-01-22T20:22:17.161+0000 I CONTROL  [initandlisten]
2018-01-22T20:22:17.161+0000 I CONTROL  [initandlisten] ** WARNING: Access control is not enabled for the database.
2018-01-22T20:22:17.161+0000 I CONTROL  [initandlisten] **          Read and write access to data and configuration is unrestricted.
2018-01-22T20:22:17.161+0000 I CONTROL  [initandlisten]
>
```

Once it's connected you can run:
```bash
> db.ticks.find()
{ "_id" : ObjectId("5a6647fa8e53c100080d4886"), "tick" : { "instrument" : "EUR_USD", "time" : ISODate("2018-01-22T20:22:13.911Z"), "bid" : 1.22571, "ask" : 1.22585 } }
{ "_id" : ObjectId("5a6647fa8e53c100080d4887"), "tick" : { "instrument" : "EUR_GBP", "time" : ISODate("2018-01-22T20:22:13.698Z"), "bid" : 0.87634, "ask" : 0.8765 } }
{ "_id" : ObjectId("5a6647fa8e53c100080d4888"), "tick" : { "instrument" : "EUR_CHF", "time" : ISODate("2018-01-22T20:22:15.586Z"), "bid" : 1.17953, "ask" : 1.17969 } }
{ "_id" : ObjectId("5a6647fa8e53c100080d4889"), "tick" : { "instrument" : "GBP_USD", "time" : ISODate("2018-01-22T20:22:04.494Z"), "bid" : 1.39853, "ask" : 1.39872 } }
{ "_id" : ObjectId("5a6647fa8e53c100080d488a"), "tick" : { "instrument" : "GBP_CHF", "time" : ISODate("2018-01-22T20:22:14.846Z"), "bid" : 1.3458, "ask" : 1.34606 } }
```

Useful scripts
--------------
Inside of `app` you will find two useful Mongo queries:
- indexes.js - this will let you index ticks in a sensible manner.
- sampleQueries.js - queries useful for serarching within time interval (`$gte` and `$lt`), etc.
