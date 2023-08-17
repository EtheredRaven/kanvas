# Kanvas project

## Info

Kanvas is the first collaborative and decentralized canvas, based on the first feeless smart-contract blockchain, Koinos. You can find more info, such as docs and details about the concept or how to buy the token, on the official website : https://kanvas-app.com. The source is licensed under the MIT licence.

While the idea as in my head for a long time, this project was originally started as a [Koinos Hackerearth](https://koinos.hackerearth.com/fr/) submission.

This project has been developed using **node v16.15.0**. Make sure to get this node version to ensure full compatibility. You can use Windows Powershell or Linux (tested on Ubuntu).

## Project setup

### Client (vuejs)

```
cd client
npm install
npm docs:build
cd db
touch data.db
```

### Server (nodejs + express)

```
cd server
npm install
mkdir logs
```

## Compiles and hot-reloads for development

### Client

```
cd client
npm run build
```

### Server

```
cd server
npm run serve
```
