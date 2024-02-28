#!/usr/bin/env bash

# clean up previous builds
docker rm wikispeech-server
docker rmi --force wikispeech-server

docker rm wikispeech-server-test
docker rmi --force wikispeech-server-test

# build docker
docker build --tag wikispeech-server-test --file .pipeline/blubber.yaml --target test .
docker build --tag wikispeech-server --file .pipeline/blubber.yaml --target production .
