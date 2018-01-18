FROM node:4-slim

WORKDIR /opt
ADD app .
RUN npm install .

COPY run.sh /opt/run.sh
RUN chmod 755 /opt/run.sh

ENTRYPOINT /opt/run.sh

