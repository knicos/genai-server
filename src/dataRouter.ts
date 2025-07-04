import { IClient } from 'peer';

interface IRouterClient {
    client: IClient;
    id: string;
}

export interface IRoutedData {
    dst: string;
    src: string;
    type: 'DATA';
    payload?: string;
}

const CLIENTS = new Map<string, IRouterClient>();

export function registerClient(id: string, client: IClient) {
    const c = CLIENTS.get(id) || { id, client };
    CLIENTS.set(id, c);
}

export function removeClient(id: string) {
    CLIENTS.delete(id);
    CLIENTS.forEach((c, i) => {
        if (c.client.getSocket().readyState > 1) {
            CLIENTS.delete(i);
        }
    });
}

export function routeData(data: IRoutedData) {
    const client = CLIENTS.get(data.dst);
    if (client) {
        client.client.send(data);
    }
}
