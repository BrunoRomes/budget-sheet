#!/bin/bash
set -eou pipefail

while getopts ":n:" opt; do
  case $opt in
    n) name="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    exit 1
    ;;
  esac

  case $OPTARG in
    -*) echo "Option $opt needs a valid argument"
    exit 1
    ;;
  esac
done


echo "Preparing to create project"
rm -rf ../dist
mkdir ../dist
rm -rf ../.clasp.json
rm -rf ../.clasp.json_prod
rm -rf ../.clasp.json_test
cd ../dist

echo "Creating $name"
npx clasp create --type sheets --title "$name"
mv .clasp.json ../.clasp.json_prod

echo "Creating template/test project Template_Budget"
npx clasp create --type sheets --title "Template_Budget"
mv .clasp.json ../.clasp.json_test

cd ../
rm -rf ./dist

echo "Creating sample userconfig.json, please customize it"
cp userconfig.json.template userconfig.json
