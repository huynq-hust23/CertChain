# CertChain - Decentralized Certificate Management System

CertChain is a blockchain-based application for issuing, verifying, and managing digital certificates. Built on the **Solana Blockchain**, it ensures that certificates are immutable, tamper-proof, and easily verifiable.

## 🚀 Features

*   **Create Certificate**: Issue new certificates with detailed metadata (Name, Birthday, Delivery Date, Serial ID, etc.).
*   **Blockchain Storage**: Critical data is hashed and stored on the Solana Devnet for immutability.
*   **Database Indexing**: PostgreSQL is used to index certificates for fast querying by Owner.
*   **Verify Certificate**: Anyone can verify the authenticity of a certificate using its Public Key.
*   **Revoke Certificate**: Owners can revoke a certificate if needed. Revoked certificates are marked on-chain and in the database.
*   **Phantom Wallet Integration**: Seamless login and signing of transactions using Phantom Wallet.
*   **Cross-Platform Automation**: Automated scripts for easy setup and running on both Windows and Linux.

## 🛠️ Technology Stack

*   **Frontend**: [Next.js](https://nextjs.org/) (React, TypeScript, Tailwind CSS, Shadcn UI)
*   **Backend**: Python ([FastAPI](https://fastapi.tiangolo.com/))
*   **Blockchain**: [Solana](https://solana.com/) (Devnet)
*   **Smart Contract**: [Anchor Framework](https://www.anchor-lang.com/) (Rust)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (via Docker)
*   **Tools**: Docker, Prisma ORM.

## 📋 Prerequisites

Ensure you have the following installed:

1.  **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Required for the database.
2.  **[Node.js](https://nodejs.org/)** (v18+): For the frontend.
3.  **[Python](https://www.python.org/)** (v3.10+): For the backend.
4.  **[Phantom Wallet Extension](https://phantom.app/)**: For browser interaction.

## 🎒 Wallet Setup (Devnet)

To use the application on Devnet, you need a Solana Wallet (Phantom recommended).

### 1. Using Solana Playground (Quickest)
1.  Visit [Solana Playground](https://beta.solpg.io/).
2.  Click **"Not connected"** (bottom left) -> Select **"Devnet"**.
    ![Connect Devnet](tutorial/01.png)
3.  Click the simplified profile icon (top right) -> **Create**.
    ![Create Account](tutorial/02.png)

### 2. Using Phantom Wallet (Recommended)
1.  Install Phantom Extension.
2.  Create a new wallet.
3.  **Important**: You must connect to **Solana Playground** at least once or use the Faucet to fund your devnet wallet.
    ![Phantom Setup](tutorial/03.png)

## ⚙️ Installation & Setup

We provide automated scripts to make installation a breeze.

### 🪟 Windows

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/huynq-hust23/CertChain.git
    cd CertChain
    ```
2.  **Run the Installer**:
    Double-click `install.bat` or run in CMD:
    ```cmd
    install.bat
    ```
    *This will install Node dependencies, setup a Python virtual environment, and install Python requirements.*

### 🐧 Linux (Ubuntu/Debian)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/huynq-hust23/CertChain.git
    cd CertChain
    ```
2.  **Run the Installer**:
    ```bash
    chmod +x install_linux.sh
    ./install_linux.sh
    ```

## 🚀 How to Run

Make sure **Docker Desktop** is running first (the script will try to start it for you).

### 🪟 Windows

Double-click `run.bat`.
*   This will start the PostgreSQL Database (Docker).
*   Start the Python Backend (in a new window).
*   Start the Next.js Frontend.

### 🐧 Linux

Run:
```bash
chmod +x run_linux.sh
./run_linux.sh
```

App will be available at: **http://localhost:3000**

### 👻 Connect Phantom Wallet

1.  Open your Phantom Wallet extension.
2.  Go to **Settings** -> **Developer Settings**.
3.  Turn on **Testnet Mode**.
4.  Switch network to **Solana Devnet**.
5.  On the CertChain website, click **"Connect Wallet"** in the top right corner.

## 📂 Configuration

The project uses a `.env` file for configuration. A sample configuration might look like this:

```env
# Database
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/certchain?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/certchain?schema=public"

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
```

## 📜 Smart Contract

The Smart Contract is deployed on Solana Devnet.
*   **Program ID**: `8BHVu5Yt29eDf7pkt1GE3tkBHHdDrMmfT6fpuYQTuN4F`

## 👤 Author

**Nguyen Nhat Huy**
*   Email: [huy.nn225335@sis.hust.edu.vn](mailto:huy.nn225335@sis.hust.edu.vn)
*   GitHub: [huynq-hust23](https://github.com/huynq-hust23)

## 📚 Backend API Documentation

Once the backend is running, you can access the full interactive API documentation (Swagger UI) at:
**[http://localhost:8000/docs](http://localhost:8000/docs)**

## 💸 Fee Payer Configuration

The fee payer account is configured in the backend. You can change it by editing:
`backend/blockchain/client/config.py`

## 🔑 How to Get Private Key

### From Phantom Wallet
1.  Open Phantom Wallet.
2.  Go to **Settings** -> **Select Account**.
3.  Click **"Show Private Key"**.
    ![Get Private Key](tutorial/04.png)

### From Solana Playground
1.  Click on the account name (top right).
2.  Select **"Export"** to get the keypair.
3.  Use the backend API convert function to get the private key if needed.

## 🔍 How to Check on Explorer

You can view transaction history and account details on the Solana Devnet Explorer:

*   **Account Info**: `https://explorer.solana.com/address/{public_address}?cluster=devnet`
*   **Transaction Info**: `https://explorer.solana.com/tx/{transaction_signature}?cluster=devnet`

### Examples
*   [Sample Account](https://explorer.solana.com/address/CqNsnnTNyCsoVrTtNdiFZegK2eJSARXrXwvyzYGBcYi2?cluster=devnet)
*   [Sample Transaction](https://explorer.solana.com/tx/2zeiZyYjhbriiGcfPNXz8YTt4qtB3X7BqE1zocxrLwpTGRgHTuqBuFb4dW2ZXNq467ptM5xWNWJTfaEv3GxwQV5J?cluster=devnet)
