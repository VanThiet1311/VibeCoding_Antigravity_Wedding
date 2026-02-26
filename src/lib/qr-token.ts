import crypto from "crypto";

// We use the same JWT_SECRET from environment bounds as the HMAC secret
const SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export interface QRPayload {
    weddingId: string;
    ceremonyId: string;
    guestId: string;
    invitationId: string;
    issuedAt: number;
}

/**
 * Generate a compact signed QR Token
 * Format: base64(payload).signature
 */
export function generateQRToken(payload: QRPayload): string {
    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64url");

    // Create HMAC SHA256 signature
    const signature = crypto
        .createHmac("sha256", SECRET)
        .update(base64Payload)
        .digest("base64url");

    return `${base64Payload}.${signature}`;
}

/**
 * Validate a QR Token locally (Offline capability)
 * Returns the parsed payload if valid, or null if tampered/invalid.
 */
export function validateQRToken(token: string): QRPayload | null {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, providedSignature] = parts;

    // Reconstruct the expected signature
    const expectedSignature = crypto
        .createHmac("sha256", SECRET)
        .update(base64Payload)
        .digest("base64url");

    // Protect against timing attacks while comparing
    try {
        const expectedBuffer = Buffer.from(expectedSignature);
        const providedBuffer = Buffer.from(providedSignature);

        if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
            return null; // Signature mismatch
        }

        const payloadString = Buffer.from(base64Payload, "base64url").toString("utf-8");
        return JSON.parse(payloadString) as QRPayload;
    } catch {
        return null;
    }
}
