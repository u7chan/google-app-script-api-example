#!/bin/bash

set -e

readonly BUILD_DIR=dist

source .env

rm -rf $BUILD_DIR
mkdir $BUILD_DIR

cp .clasp.json.template $BUILD_DIR/.clasp.json
cp appsscript.json $BUILD_DIR/appsscript.json
cp src/index.ts $BUILD_DIR/index.ts

sed -i "" -e "s/<YOUR_SCRIPT_ID>/$YOUR_SCRIPT_ID/" $BUILD_DIR/.clasp.json
