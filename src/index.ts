import 'dotenv/config';
import express from 'express';
import { ExpressPeerServer } from 'peer';
import { logger } from './logger.js';

import { IRoutedData, registerClient, removeClient, routeData } from './dataRouter.js';

const app = express();

app.get('/', (_, res) => {
    res.sendStatus(403);
});

const server = app.listen(parseInt(process.env.PEER_PORT ?? '9000'));

const peerServer = ExpressPeerServer(server, {
    key: process.env.PEER_KEY || 'genaikey',
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

/*app.get('/model/:code/:component', async (req, res) => {
    const { code, component } = req.params;
    const pwd = req.query.pwd as string;

    try {
        const ws = await doSignaling(peer, id, `tm-${code}`);

        try {
            const content = await makeDataRequest(peer, component, pwd);

            ws.close();
            peer.close();

            res.setHeader('Access-Control-Allow-Origin', '*');

            if (content) {
                if (content.event === 'project') {
                    res.contentType('application/zip');
                    res.send(Buffer.from(content.project, 'base64'));
                } else if (content.component === 'model') {
                    res.contentType('application/json');
                    res.send(content.data);
                } else if (content.component === 'metadata') {
                    res.contentType('application/json');
                    res.send(content.data);
                } else if (content.component === 'weights') {
                    res.contentType('application/octet-stream');
                    res.send(Buffer.from(content.data));
                } else {
                    res.status(404);
                    console.error('Content was not found', content);
                    res.end();
                }
            } else {
                res.status(400);
                res.end();
            }
        } catch (e) {
            ws.close();
            console.error(e);
            console.error('Peer was not found');
            res.status(404);
            res.end();
        }
    } catch (e) {
        res.status(500);
        res.end();
    }
});*/
