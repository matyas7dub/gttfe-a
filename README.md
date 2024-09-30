# ![](./public/GtLogo.svg) Admin Frontend

  1. [Setup](#setup)
      1. [Docker](#using-docker-dev)
      2. [npm](#manual-setup-dev)
      3. [Environment variables](#environment-variables)
  2. [CRA](#create-react-app)

# Setup

## Using Docker (dev)

  1. Set [environment variables](#environment-variables) including Docker compose variables
  2. Run
      ```bash
      docker compose pull && docker compose up -d
      ```
  3. Set up [gttbe-2 database](https://github.com/viotalJiplk/gttbe-2#docker-install)
  4. Open [localhost:5002](http://localhost:5002) or configured port

## Manual setup (dev)

  1. Set [environment variables](#environment-variables)
  2. Set up [gttbe-2](https://github.com/viotalJiplk/gttbe-2) and its database
  3. Run 
      ```bash
      npm i && npm start
      ```

## Environment variables

You can set these variables in .env  
Defaults are in .env-template  

- `REACT_APP_PROD={yes/no}` changes localhost to prod domain
- `REACT_APP_AUTH_REDIRECT={URL}` where discord should redirect after authentication
- `REACT_APP_BACKEND_URL={URL/empty}` location of gttbe-2

# Create React App

This project is using [Create React App](https://github.com/facebook/create-react-app).

## CRA scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn more about CRA

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
