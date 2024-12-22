interface UserStore {
    [key: string]: string;
}

interface Store {
    [userId: string]: UserStore;
}

export class StoreError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StoreError';
    }
}

export class InMemoryStore {
    private store: Store = {};
    private maxKeyLength = 1024; // Maximum key length in bytes
    private maxValueLength = 512 * 1024; // Maximum value length (512KB)

    private validateKey(key: string): void {
        if (!key) {
            throw new StoreError('Key cannot be empty');
        }
        
        const keyBytes = Buffer.from(key).length;
        if (keyBytes > this.maxKeyLength) {
            throw new StoreError(`Key length exceeds maximum of ${this.maxKeyLength} bytes`);
        }
    }

    private validateValue(value: string): void {
        if (!value) {
            throw new StoreError('Value cannot be empty');
        }

        const valueBytes = Buffer.from(value).length;
        if (valueBytes > this.maxValueLength) {
            throw new StoreError(`Value length exceeds maximum of ${this.maxValueLength} bytes`);
        }
    }

    private ensureUserStore(userId: string): void {
        if (!this.store[userId]) {
            this.store[userId] = {};
        }
    }

    set(userId: string, key: string, value: string): void {
        if (!userId) {
            throw new StoreError('User ID is required');
        }

        this.validateKey(key);
        this.validateValue(value);
        this.ensureUserStore(userId);

        try {
            this.store[userId][key] = value;
        } catch (error) {
            throw new StoreError('Failed to set value');
        }
    }

    get(userId: string, key: string): string | null {
        if (!userId) {
            throw new StoreError('User ID is required');
        }

        this.validateKey(key);

        try {
            return this.store[userId]?.[key] || null;
        } catch (error) {
            throw new StoreError('Failed to get value');
        }
    }

    del(userId: string, key: string): void {
        if (!userId) {
            throw new StoreError('User ID is required');
        }

        this.validateKey(key);

        try {
            if (this.store[userId]) {
                delete this.store[userId][key];
            }
        } catch (error) {
            throw new StoreError('Failed to delete value');
        }
    }

    // Get all keys for a user
    keys(userId: string): string[] {
        if (!userId) {
            throw new StoreError('User ID is required');
        }

        try {
            return Object.keys(this.store[userId] || {});
        } catch (error) {
            throw new StoreError('Failed to get keys');
        }
    }

    // Clear all data for a user
    clear(userId: string): void {
        if (!userId) {
            throw new StoreError('User ID is required');
        }

        try {
            delete this.store[userId];
        } catch (error) {
            throw new StoreError('Failed to clear user data');
        }
    }

    // Clear all data (useful for testing)
    clearAll(): void {
        try {
            this.store = {};
        } catch (error) {
            throw new StoreError('Failed to clear all data');
        }
    }
}
