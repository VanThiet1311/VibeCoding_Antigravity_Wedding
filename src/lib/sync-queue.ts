/**
 * sync-queue.ts
 *
 * IndexedDB-backed queue for storing offline check-in attempts.
 * When the device goes back online, useBackgroundSync drains this queue
 * and posts each item to /api/reception/checkin.
 */

const DB_NAME = "wedding-reception-db";
const STORE_NAME = "sync-queue";
const DB_VERSION = 1;

export interface SyncItem {
    id: string; // Unique local ID (crypto.randomUUID)
    token: string;
    deviceId: string;
    scanTime: string; // ISO timestamp of when it was scanned
    actualCompanions?: number;
    retries: number;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function enqueue(item: Omit<SyncItem, "id" | "retries">): Promise<void> {
    const db = await openDB();
    const entry: SyncItem = { ...item, id: crypto.randomUUID(), retries: 0 };
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).add(entry);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function dequeue(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function incrementRetry(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const item: SyncItem = getReq.result;
            if (item) {
                item.retries += 1;
                store.put(item);
            }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getAllQueued(): Promise<SyncItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result as SyncItem[]);
        req.onerror = () => reject(req.error);
    });
}

export async function clearQueue(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
