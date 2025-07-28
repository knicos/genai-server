# GenAI Local Server

A lightweight server for local use of GenAI tools. It allows the tools to operate on an isolated local network and relies on websockets to share the data instead of WebRTC.

## Usage

It requires Node.JS version 22 or newer.

```
npm install
npm run build
npm start -- --files ../genai-somekone/dist
```

Configure your local copy of our tools to connect to this server machine. By default the port is 9000. Alternatively provide the `--files` command line argument, as shown above, which will host the Somekone tool at the same address (http://localhost:9000) and does not require editing env variables when building the tool.

In the Somekone (or TM) repository, run the following to generate the `dist` directory.

```
npm install
npm build
```
