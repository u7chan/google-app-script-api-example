# google-app-script-api-example

## Install

1. Download clasp

   ```sh
   % npm install -g @google/clasp
   ```

## Setup

1. Install modules

   ```sh
   % yarn install
   ```

1. Login

   ```sh
   % clasp login
   ```

1. Confirm your script id

   ```sh
   % clasp list
   ```

1. Copy the `.env`

   ```sh
   % cp .env.example .env
   ```

1. Set `YOUR_SCRIPT_ID` in `.env`

   ```sh
   YOUR_SCRIPT_ID= ...
   ```

## Deploy

1. Force writes all local files to `script.google.com`

   ```sh
   % yarn deploy
   ```
