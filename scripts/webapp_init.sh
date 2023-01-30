#!/bin/bash
set -eou pipefail


FILE=webappconfig_test.json
if [ ! -f "$FILE" ]; then
    cp .clasp.json_test .clasp.json
    echo "$FILE does not exist, creating it."
    command_output=$(npx clasp deploy -d "Initial Deployment")
    id=$(echo $command_output | grep -oEi '[A-Za-z0-9_-]+ @[0-9]+' | grep -oEi '^[A-Za-z0-9_-]*')
    version=$(echo $command_output | grep -oEi '@[0-9]+' | grep -oEi '[0-9]+')
    echo "{\"deployment_id\": \"$id\", \"version\": \"$version\"}" > $FILE   
fi

FILE=webappconfig_prod.json
if [ ! -f "$FILE" ]; then
    cp .clasp.json_prod .clasp.json
    echo "$FILE does not exist, creating it."
    command_output=$(npx clasp deploy -d "Initial Deployment")
    id=$(echo $command_output | grep -oEi '[A-Za-z0-9_-]+ @[0-9]+' | grep -oEi '^[A-Za-z0-9_-]*')
    version=$(echo $command_output | grep -oEi '@[0-9]+' | grep -oEi '[0-9]+')
    echo "{\"deployment_id\": \"$id\", \"version\": \"$version\"}" > $FILE   
fi
