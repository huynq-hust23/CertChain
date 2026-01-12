const { Connection, PublicKey } = require('@solana/web3.js');

async function main() {
    const connection = new Connection("https://api.devnet.solana.com");
    const pubkey = new PublicKey("FVCwHejbmSdSF2yHH5dJx3DdNb2YhDdhaoSVgYHKuawV");

    console.log("Fetching account info for:", pubkey.toString());
    const info = await connection.getAccountInfo(pubkey);

    if (info) {
        console.log("Account exists. Data length:", info.data.length);
    } else {
        console.log("Account does not exist (null).");
    }
}

main();
