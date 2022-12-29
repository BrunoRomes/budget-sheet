## Description

This project aims at generating and maintaining a Google Spreadsheet for budget control.

### Prerequisites

1. Nodejs

### Getting Started

1. Clone the repository
1. Install the npm dependencies: `npm install`
1. Access https://script.google.com/home > Settings > Turn on Google Apps Script API
1. Login to Google clasp. This will authorize the script to interact with your account: `npx clasp login`
1. Init the project by running: `npm run init "<NAME OF THE SPREADSHEET>"`

   This script will create 2 empty spreadsheets in the root of your google drive account: one will have the name you specified, the other will be called `Template_Budget`. `Template_Budget` is meant to be used to develop and test new features before deploying them to the real spreadsheet.

   It will also create a `userconfig.json` file on the project's root folder.

1. Customize the created `userconfig.json`
1. Run `npm run deploy` to upload the scripts
1. Go to your sheet and click `Finance > Setup Triggers` to bootstrap the sheets (it might take a couple of seconds to show up in the menu). It will ask you for authorization and guide you through it and you might have to click `Finance > Setup Triggers` again after this initial authorization.
   Likely this operation will timeout and you will receive an error (see #12). A quick workaround is to open the sheet again. This will trigger the script to continue the setup. But you might want to delete the last sheet created before the timeout so the script can pick it up again and properly finish its setup this time around. You can do that by going to the script (`Extension > App Script`) and checking the logs right before the timeout error.
1. Manually create the folders you listed in your `userconfig.json` and move your sheet there. To leave everything in your Google Drive root folder, leave it empty arrays

### Usage

1. Export the CSV files from you bank/brokers and upload to the csv folder you set up above
1. Everytime the sheet is open the scripts will automatically check for new migrations and parse the CSV files. It auto detects which bank it is based on each CSVs structure (which might break in the future if different banks has the exact same structure)

### Deploying

There are 2 commands to deploy changes to your spreadsheet:

1. `npm run deploy-template` : deploys the project to the `Template_Budget` spreadsheet
1. `npm run deploy` : deploys the project to the "real" spreadsheet

After the first deployment, open the spreadsheet, then `Finances` > `Setup Triggers` and refresh the page.
