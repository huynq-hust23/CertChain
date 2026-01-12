# How to use
## Create new wallet

There are 2 way to create new wallet

First you need to visit solana playground: [beta.solpg.io](https://beta.solpg.io/)

Then select connect to devnet on bottom left of website
![](backend/tutorial/01.png)

Then you can create an account direct on top right menu
![](backend/tutorial/02.png)

Another way is better but not recommend for noob, you need to download Phantom extension and sign up an account. Then you can create many wallet as you want, but to use this wallet in devnet solana, you need to first connect in solana playground
![](backend/tutorial/03.png)

## How to start server API

First of all you need python > 3.10 and pip

### Windows
```
./install.bat
./run.bat
```

### Linux
```
cd blockchain\client

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python main.py
```

### Document API

When server start at port 8000 then visit [http://localhost:8000/docs](http://localhost:8000/docs) for document of API

## On-chain revoke (Devnet)

UI revoke uses Phantom to sign and send an on-chain transaction calling the Anchor instruction `revoke_certificate`.

### 1) Configure client env

Copy `.env.example` to `.env` and set:

- `NEXT_PUBLIC_SOLANA_RPC_URL` (default: `https://api.devnet.solana.com`)
- `NEXT_PUBLIC_SOLANA_PROGRAM_ID`

### 2) Build/deploy/upgrade the program

The Anchor workspace is in `backend/blockchain/solana/anchor`.

Notes:
- This repo currently does not include Anchor CLI in your PATH. On Windows, the most reliable setup is installing Anchor in WSL2.
- Program ID in the source is `DrLi2HqpW1KM3mDTV8u2BHC7h5vZcGJPKCnoayZ1Rtrf`. If you deploy to a different program id, update `NEXT_PUBLIC_SOLANA_PROGRAM_ID`.

From WSL2 (recommended):

1. Install Solana + Anchor (standard docs)
2. `cd /mnt/d/Prj3_MMUD/certchain/backend/blockchain/solana/anchor`
3. `anchor build`
4. `anchor deploy` (or `anchor upgrade` if you already deployed this program id)

## Account are using for fee payer

you can change fee payer in `blockchain\client\config.py`

## How to get private key of wallet

For solana wallet you can get private key by get keypair from export function on top right menu then using convert pair function on docs api of server to get private key of account

For Phantom wallet is must easier, just go to setting on extension then click to account you want to get private key, then take the private key

![](backend/tutorial/04.png)

## How to check on chain

For check account info you can see at `https://explorer.solana.com/address/{public_address}?cluster=devnet`

For check Instruction info you can see at `https://explorer.solana.com/tx/{public_address}?cluster=devnet`

For example:
- [https://explorer.solana.com/address/CqNsnnTNyCsoVrTtNdiFZegK2eJSARXrXwvyzYGBcYi2?cluster=devnet](https://explorer.solana.com/address/CqNsnnTNyCsoVrTtNdiFZegK2eJSARXrXwvyzYGBcYi2?cluster=devnet)
- [https://explorer.solana.com/tx/2zeiZyYjhbriiGcfPNXz8YTt4qtB3X7BqE1zocxrLwpTGRgHTuqBuFb4dW2ZXNq467ptM5xWNWJTfaEv3GxwQV5J?cluster=devnet](https://explorer.solana.com/tx/2zeiZyYjhbriiGcfPNXz8YTt4qtB3X7BqE1zocxrLwpTGRgHTuqBuFb4dW2ZXNq467ptM5xWNWJTfaEv3GxwQV5J?cluster=devnet)