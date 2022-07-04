FROM php:5.6-apache
FROM node:16.15-alpine3.14
FROM python:3

RUN mkdir -p /home/ova3-main
WORKDIR /home/ova3-main

RUN set -xe \
    && apt-get update -y \
    && apt-get install -y python3-pip
RUN pip3 install --upgrade pip

ADD requirements.txt .
RUN pip install -r requirements.txt

ADD app app
ADD routes.py .

ENV FLASK_APP app

EXPOSE 3000
ENTRYPOINT python routes.py