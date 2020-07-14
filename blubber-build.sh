#!/usr/bin/env bash

# clean up previous builds
docker rm wikispeech-server
docker rmi --force wikispeech-server

docker rm wikispeech-server-test
docker rmi --force wikispeech-server-test

# build docker
blubber .pipeline/blubber.yaml test | docker build --tag wikispeech-server-test --file - .
blubber .pipeline/blubber.yaml production | docker build --tag wikispeech-server --file - .
