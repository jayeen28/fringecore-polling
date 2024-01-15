import { EventEmitter } from "node:events";

const TIMEOUT = 30000;
const emitter = new EventEmitter();
let queue = {};

const setQueueId = (key, id) => {
    queue = { ...queue, [key]: [...queue[key] || [], id] };
};

const removeQueueId = (key, id) => {
    queue = { ...queue, [key]: queue[key].filter(qid => qid !== id) };
};

const getQueueFirstId = (key) => ((queue[key] || [])[0]);

export async function blockingGet(key) {
    try {
        const queueId = generateId();
        setQueueId(key, queueId);
        return new Promise((r) => {

            const timeout = setTimeout(() => {
                removeQueueId(key, queueId);
                emitter.off(queueId, () => { });
                r(null);
            }, TIMEOUT);

            emitter.on(queueId, (data) => {
                clearTimeout(timeout);//cleared it so that it doesn't get resolved when key pushed at the closest end of the time limit.
                removeQueueId(key, queueId);
                emitter.off(queueId, () => { });
                r(data);
            });

        });
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

export async function push(key, data) {
    const id = getQueueFirstId(key);
    if (id) emitter.emit(id, data);
}


export default function generateId({ startWith = 'FCP' } = {}) {
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const timestamp = Date.now() % 100000;
    return startWith + (randomNumber + timestamp).toString().slice(-6);
}