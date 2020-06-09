#!/usr/bin/env bash

# clean up previous builds
docker rm wikispeech-mockup
docker rmi --force wikispeech-mockup

docker rm wikispeech-mockup-test
docker rmi --force wikispeech-mockup-test

# build docker
blubber .pipeline/blubber.yaml test | docker build --tag wikispeech-mockup-test --file - .
blubber .pipeline/blubber.yaml production | docker build --tag wikispeech-mockup --file - .
