# Kanvas project

## Info

Kanvas is the first collaborative and decentralized canvas, based on the first feeless smart-contract blockchain, Koinos. You can find more info, such as docs and details about the concept or how to buy the token, on the official website : https://kanvas-app.com. The source is licensed under the MIT licence.

While the idea as in my head for a long time, this project was originally started as a [Koinos Hackerearth](https://koinos.hackerearth.com/fr/) submission.

This project has been developed using **node v16.15.0**. Make sure to get this node version to ensure full compatibility. You can use Windows Powershell or Linux (tested on Ubuntu 20.04).

## Project setup

### Server (nodejs + express + socketio)

#### Get node

Kanvas was tested on node v16.15.0. Here are some instructions if you don't have it, via Node Version Manager.

```cmd
curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh -o install_nvm.sh # Get the install script
bash install_nvm.sh # Run the install script
export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
source ~/.bash_profile # Update the changes
nvm install v16.15.0 # Install this version
node -v #Verify it worked, you should get 16.15.0
```

## Installing Kanvas locally

```cmd
git clone https://github.com/EtheredRaven/kanvas.git
cd kanvas
cd server
npm run install_and_serve
```

The server is now running on http://localhost (and not https because there is not certificate, check it is http !)

For the next times you launch the server, you can only use `npm run serve` in the server folder.

## Play the game

You can now play the game. You will need some $KAN and $KOIN to test the pixel placement. Check [our docs](https://kanvas-app.com/docs/playing/howtobuykoin.html) on our official website to check the process.

## Compiles and hot-reloads for development

This part is for developers only. You will need these commands if you modify some files.

### Client (vuejs + phaserjs)

Go back to the project root folder.

```
cd client
npm install
npm docs:build
npm run build
```

### Server (nodejs + express + socketio)

Go back to the project root folder.

```
cd server
npm run serve
```
