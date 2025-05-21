import EventEmitter from 'events';

// export type EvenList = 'a'

class MyEvents<T extends string> extends EventEmitter {
    emit(events: T, ...args: any[]): boolean {
        return super.emit(events as string, ...args);
    }
    addListener(eventName: T, listener: (...args: any[]) => void): this {
        return super.addListener(eventName,listener);
    }
}

type Allevent = 'sendMail' | 'upDtList' | 'mqtt_ack';


export let myEvent = new MyEvents<Allevent>();