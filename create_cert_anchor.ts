import { AnchorProvider, Program, Wallet, setProvider } from "@coral-xyz/anchor";
import BN from "bn.js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import crypto from "crypto";

// Configuration
const IDL_PATH = "backend/blockchain/solana/anchor/target/idl/certchain.json";
const WALLET_PATH = process.env.HOME + "/.config/solana/id.json";
const RPC_URL = "https://api.devnet.solana.com";

// Helpers
function stringToU16Array(str: string, len: number): number[] {
    // Logic matches Python HotaStringUTF16: ord(c) + 1
    const res = new Array(len).fill(0);
    for (let i = 0; i < str.length && i < len; i++) {
        res[i] = str.charCodeAt(i) + 1;
    }
    return res;
}

function sha256(data: string): number[] {
    const hash = crypto.createHash('sha256').update(data).digest();
    return Array.from(hash);
}

function toU8Array(data: number[], len: number): number[] {
    const res = new Array(len).fill(0);
    data.forEach((b, i) => { if (i < len) res[i] = b; });
    return res;
}

async function main() {
    console.log("=== Creating Sample Certificate via Anchor Client ===");

    // Setup Provider
    const connection = new Connection(RPC_URL, "confirmed");
    const walletKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
    );
    const wallet = new Wallet(walletKeypair);
    const provider = new AnchorProvider(connection, wallet, {});
    setProvider(provider);

    // Load Program
    if (!fs.existsSync(IDL_PATH)) {
        console.error("IDL file not found at", IDL_PATH);
        process.exit(1);
    }
    const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
    const program = new Program(idl, provider);

    console.log("Program ID:", program.programId.toString());
    console.log("Wallet:", wallet.publicKey.toString());

    // Input Data
    const seed_8 = new BN(Date.now()); // Random seed
    const fullname = stringToU16Array("Test User Anchor", 32);
    const serial_id = stringToU16Array("ANCHOR-CERT-001", 64);
    const more_info = stringToU16Array("Created via Anchor Client script", 256);

    const security_code_raw = "SECURE123";
    const security_code = sha256(security_code_raw); // 32 bytes

    const original_data = sha256("Some data");
    const original_image = sha256("Some image");

    const birthday = [1, 1, 0, 2000]; // day, month, year (u16 split?) 
    // Rust: birthday: [u8; 4]. Python: day(u8), month(u8), year(u16).
    // Struct layout in Rust: [u8, u8, u8, u8].
    // Check layout again. Python HotaDate: day(u8), month(u8), year(u16) -> total 4 bytes.
    // Rust defines: birthday: [u8; 4].
    // So we pass an array of 4 numbers.
    // byte 0: day, byte 1: month, byte 2: year_low, byte 3: year_high.
    const bYear = 2000;
    const birthdayBytes = [1, 1, bYear & 0xFF, (bYear >> 8) & 0xFF];

    const dYear = 2026;
    const deliveryDateBytes = [12, 1, dYear & 0xFF, (dYear >> 8) & 0xFF];

    // Derive Address
    const [certPda] = PublicKey.findProgramAddressSync(
        [
            wallet.publicKey.toBuffer(),
            Buffer.from("certificate"),
            seed_8.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
    );
    console.log("Cert PDA:", certPda.toString());

    try {
        const tx = await program.methods
            .initCertificate(
                seed_8,
                fullname,
                birthdayBytes,
                deliveryDateBytes,
                serial_id,
                security_code,
                more_info,
                original_data,
                original_image
            )
            .accounts({
                payer: wallet.publicKey,
                sender: wallet.publicKey,
                owner: wallet.publicKey, // Assign to self
                cert: certPda,
            })
            .rpc();

        console.log("Success! Transaction Signature:", tx);
        console.log("Certificate Created Address:", certPda.toString());
    } catch (err) {
        console.error("Error creating certificate:", err);
    }
}

main();
