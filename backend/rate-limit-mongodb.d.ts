declare module '@iroomit/rate-limit-mongodb' {
    import { Store, Options } from 'express-rate-limit';
    
    export interface MongoDBStoreOptions {
        uri: string;
        collectionName?: string;
        expireTimeMs?: number;
        errorHandler?: (error: any) => void;
    }

    export class MongoDBStore implements Store {
        constructor(options: MongoDBStoreOptions);
        options: MongoDBStoreOptions;
        init(): Promise<void>;
        increment(key: string): Promise<any>;
        decrement(key: string): Promise<void>;
        resetKey(key: string): Promise<void>;
        resetAll(): Promise<void>;
        on(event: string, callback: (...args: any[]) => void): this;
    }
}
