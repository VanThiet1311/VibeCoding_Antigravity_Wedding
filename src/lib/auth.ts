import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "fallback_secret_for_development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // 1 week
        .sign(key);
}

export async function decrypt(input: string | undefined): Promise<Record<string, unknown> | null> {
    if (!input) return null;
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch {
        return null;
    }
}
