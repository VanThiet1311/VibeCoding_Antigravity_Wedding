"use client";

/**
 * useBackgroundSync.ts
 *
 * React hook that monitors online/offline status and drains the
 * IndexedDB sync queue by posting queued scans to the server.
 *
 * Usage: call once in the reception page component.
 */

import { useEffect, useRef, useCallback } from "react";
import { getAllQueued, dequeue, incrementRetry, type SyncItem } from "./sync-queue";

const MAX_RETRIES = 3;

export type SyncResult = {
    item: SyncItem;
    status: string;
    success: boolean;
};

interface UseBackgroundSyncOptions {
    onSynced?: (result: SyncResult) => void;
}

export function useBackgroundSync({ onSynced }: UseBackgroundSyncOptions = {}) {
    const isSyncing = useRef(false);

    const drainQueue = useCallback(async () => {
        if (isSyncing.current) return;
        isSyncing.current = true;

        try {
            const items = await getAllQueued();
            for (const item of items) {
                if (item.retries >= MAX_RETRIES) {
                    // Give up on this item to prevent blocking the queue forever
                    await dequeue(item.id);
                    continue;
                }

                try {
                    const res = await fetch("/api/reception/checkin", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            token: item.token,
                            deviceId: item.deviceId,
                            scanTime: item.scanTime,
                            actualCompanions: item.actualCompanions,
                        }),
                    });

                    const data = await res.json();
                    await dequeue(item.id);
                    onSynced?.({ item, status: data.status, success: true });
                } catch {
                    await incrementRetry(item.id);
                }
            }
        } finally {
            isSyncing.current = false;
        }
    }, [onSynced]);

    useEffect(() => {
        const handleOnline = () => drainQueue();

        window.addEventListener("online", handleOnline);

        // Also try on mount in case we're already online
        if (navigator.onLine) {
            drainQueue();
        }

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, [drainQueue]);

    return { drainQueue };
}
