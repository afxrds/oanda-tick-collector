# OANDA Tick-Collector for Stream API

This project has been create as part of [Simple tick collector](https://afxrds.io/forex/tick/data/2018/01/16/simple-tick-collector.html) blog post.

Here I'm using NodeJS, Docker and MongoDB to collect ticks from OANDA's Stream API.
It's all dockerised to let you get off the ground as easy as possible. You will need:
- Docker
- Docker-compose (compatible with docker-compose API v2.1)
- OANDA demo account with Access Token and Account ID - just pop them in docker-compose.yaml under `services > tick-collector > environment > ACCOUNT_ID/ACCESS_TOKEN`


## Intro
Oanda's Stream API allows you to open TCP connection to an endpoint and continuously receive data (such as currency ticks). For health checking purpose the stream will also send 'health check' confirmation in some intervals (i.e. 10s) so that you can re-connect to the stream in case of an error. If error occurs we are going to exit NodeJS process and rely on Docker to start it again.


Remember, FX trading session starts at 10:00 PM GMT on Sunday and ends 10:00 PM GMT Friday - so try this example during week days :-)

## Running
Once you checkout/download source code into your computer set ACCOUNT_ID and ACCESS_TOKEN in docker-compose.yaml and then start it up with:
docker-compose -f docker-compose.yaml up -d
This will start container for MongoDB mapped to port 27018 _outside_ of docker (just in case you have mongodb db running on your machine!) and on default port 27017 _inside_ of docker context.
This will also build tick-collector container. That container will try to connect to MongoDB on `mongodb-host-alias:27017` which is routable inside of tick-collector context.
So, let's take a look what happens when you run it:


You can confirm containers are running with:
docker-compose ps


Then, you can check what's going on with the collector by:
