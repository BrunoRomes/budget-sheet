## Description 

This project aims at generating and maintaining a Google Spreadsheet for budget control.

### Prerequisites
1. Nodejs

### Getting Started
1. Clone the repository
1. Install the npm dependencies: `npm install`
1. Access https://script.google.com/home > Settings > Turn on Google Apps Script API
1. Login to Google clasp. This will authorize the script to interact with your account: `npx clasp login`
1. Init the project by running:
    ```
    cd scripts
    ./init.sh -n "<NAME OF THE SPREADSHEET>"
    ```
    This script will create 2 spreadsheets in the root of your google drive account: one will have the name you specified, the other will be called `Template_Budget`. `Template_Budget` is meant to be used to develop and test new features before deploying them to the real spreadsheet.

### Deploying
There are 2 commands to deploy changes to your spreadsheet:
1. `npm run deploy-template` : deploys the project to the `Template_Budget` spreadsheet
1. `npm run deploy` : deploys the project to the "real" spreadsheet
