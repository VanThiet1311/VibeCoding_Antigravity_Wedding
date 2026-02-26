/**
 * offline-qr.ts
 *
 * Client-side QR token validation using the Web Crypto API (no Node.js crypto).
 * Mirrors the server-side validateQRToken logic in lib/qr-token.ts but runs
 * entirely in the browser, enabling offline-first reception mode.
 *
 * The QR format is: base64url(JSON payload).HMAC-SHA256-base64url(payload)
 */

export interface QRPayload {
    wid: string; // weddingId
    cid: string; // ceremonyId
    gid: string; // guestId
    iat: number; // issuedAt timestamp
}

async function importSecret(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );
}

function base64urlToUint8Array(base64url: string): Uint8Array {
    // Replace URL-safe chars and add padding
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Validates a QR token in the browser using Web Crypto.
 * Returns the parsed payload or null if invalid/tampered.
 *
 * @param token - The QR token string (from camera scan)
 * @param hmacSecret - The shared HMAC secret (same JWT_SECRET as server)
 */
export async function validateQRTokenClient(
    token: string,
    hmacSecret: string
): Promise<QRPayload | null> {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, providedSignature] = parts;

    try {
        const key = await importSecret(hmacSecret);
        const enc = new TextEncoder();
        const data = enc.encode(base64Payload);
        const sigBytes = base64urlToUint8Array(providedSignature);

        const isValid = await crypto.subtle.verify("HMAC", key, sigBytes.buffer as ArrayBuffer, data);
        if (!isValid) return null;

        const payloadBytes = base64urlToUint8Array(base64Payload);
        const payloadString = new TextDecoder().decode(payloadBytes);
        return JSON.parse(payloadString) as QRPayload;
    } catch {
        return null;
    }
}
