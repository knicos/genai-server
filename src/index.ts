import 'dotenv/config';
import express from 'express';
import { ExpressPeerServer } from 'peer';
import { logger } from './logger.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';

const argv = yargs(hideBin(process.argv))
    .option('port', {
        alias: 'p',
        type: 'number',
        description: 'Port for the PeerServer to listen on',
        default: 9000,
    })
    .option('key', {
        alias: 'k',
        type: 'string',
        description: 'Key for the PeerServer',
        default: 'genaikey',
    })
    .options('files', {
        alias: 'f',
        type: 'string',
        description: 'Path to the files directory',
        default: '',
    })
    .help()
    .alias('help', 'h')
    .parseSync();

import { IRoutedData, registerClient, removeClient, routeData } from './dataRouter.js';

const app = express();

if (argv.files !== '') {
    app.use(express.static(argv.files));
}

const server = app.listen(argv.port);

const peerServer = ExpressPeerServer(server, {
    key: argv.key,
});

app.use(peerServer);

peerServer.on('message', (client, message) => {
    if (message.type === 'HEARTBEAT') {
        /* Send a HEARTBEAT back so that the client also knows the connection is alive */
        client.send({ type: 'HEARTBEAT' });
    } else if ((message.type as unknown) === 'DATA' || (message.type as unknown) === 'KEY') {
        /* Allow websocket routing as a backup (e2e encrypted) */
        routeData(message as unknown as IRoutedData);
    }
});

peerServer.on('connection', (client) => {
    registerClient(client.getId(), client);
});

peerServer.on('disconnect', (client) => {
    removeClient(client.getId());
});

peerServer.on('error', (err) => {
    logger.error('PeerServer Error:', err);
});

app.get('/checkP2P/:code', async (_, res) => {
    res.status(404);
    res.end();
});

app.get('/motd', async (_, res) => {
    res.contentType('application/json');
    res.send({ motd: '' });
});

app.get('/rtcconfig', async (_, res) => {
    const timestamp = Math.floor(Date.now() / 1000) + 12 * 3600;
    const config = {
        expiresOn: new Date(timestamp * 1000),
        iceServers: [],
    };
    res.send(config);
    res.end();
});

app.get('/*path', (_, res) => {
    res.sendFile(path.resolve(argv.files, 'index.html'));
});
