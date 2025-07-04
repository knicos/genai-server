# GenAI Local Server

A lightweight server for local use of GenAI tools. It allows the tools to operate on an isolated local network and relies on websockets to share the data instead of WebRTC.

## Usage

It requires Node.JS version 22 or newer.

```
npm install
npm run build
npm start
```

Configure your local copy of our tools to connect to this server machine. By default the port is 9000.
