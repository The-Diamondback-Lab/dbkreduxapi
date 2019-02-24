# DBK Redux API

This project is built using [Express](https://expressjs.com/).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To work on this project, you'll need to have Node and Git installed. If you don't already, you can download Node [here](https://nodejs.org/en/download/) and Git [here](https://git-scm.com/downloads).

### Installing

Follow the steps below to get your development enviroment set up.

1.  Pull the repo. Open the terminal and and run the following:

    ```
    git clone https://github.com/The-Diamondback-Lab/dbk-redux-api.git
    ```

2.  After cloning the repo, open the project. In the root folder, run the following command:

    ```
    npm install
    ```

    in the terminal. This will install the necessary dependencies for the project. A list of those dependencies can be found in `package.json`.

## Development

Open a new terminal tab and run `npm start`. This will run the server locally on your machine, which can be accessed at http://localhost:8080.

## Deployment

The API is deployed to Zeit's [Now](https://zeit.co/now). Once you get set up with an account, you must be added to The Diamondback Lab team. Once you do that, deployment is simple:

1. Install the Now CLI: https://github.com/zeit/now-cli

2. Once you authenticate, switch from your account to the team's account by running `now switch` and choosing the team.

3. To deploy, run `now -e REDISPWD=@redispwd`. Now will grab all necessary deployment information from the included `now.json`. It will also use the stored secret variable (`redispwd`) as an environment variable in deployment. More on that: https://zeit.co/blog/environment-variables-secrets.

4. If the deployment looks good, you can alias it to the production URL. To do this, run `now alias api.dbknews.com`. 

## Built With

- [Express](https://expressjs.com/) - Node.js web application framework