import { generateQRToken, validateQRToken } from "../src/lib/qr-token";

async function runTests() {
    console.log("=== QR Token Security Tests ===");

    const mockPayload = {
        wid: "60d5ecb8b392d700153528a6", // mock mongoose object ids
        cid: "60d5ecb8b392d700153528a7",
        gid: "60d5ecb8b392d700153528a8",
        iat: Date.now()
    };

    // Test 1: Generate Token
    console.log("\n1. Generating Token...");
    const token = generateQRToken(mockPayload);
    console.log("Token:", token);
    console.assert(token.includes("."), "Token should contain a dot separator");

    // Test 2: Valid Verification
    console.log("\n2. Validating Original Token...");
    const verified = validateQRToken(token);
    console.log("Verified Payload:", verified);
    console.assert(verified !== null, "Verification should succeed");
    if (verified) {
        console.assert(verified.gid === mockPayload.gid, "Guest ID should match");
    }

    // Test 3: Tamper with Payload
    console.log("\n3. Testing Payload Tampering (Fake Guest ID)...");
    const tamperedPayload = { ...mockPayload, gid: "hacked_id_123" };
    const fakeBase64 = Buffer.from(JSON.stringify(tamperedPayload)).toString("base64url");
    const fakeToken = `${fakeBase64}.${token.split(".")[1]}`; // original signature

    const hackedResult = validateQRToken(fakeToken);
    console.log("Hacked Result:", hackedResult);
    console.assert(hackedResult === null, "Tampered token MUST fail validation");

    // Test 4: Tamper with Signature
    console.log("\n4. Testing Signature Tampering...");
    const badSigToken = `${token.split(".")[0]}.invalid_signature_string`;
    const badSigResult = validateQRToken(badSigToken);
    console.log("Bad Signature Result:", badSigResult);
    console.assert(badSigResult === null, "Bad signature MUST fail validation");

    console.log("\n=== All Tests Passed Successfully ===");
}

runTests().catch(console.error);
