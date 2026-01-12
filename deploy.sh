#!/bin/bash
set -e

# Setup paths
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Build (if not already built)
echo "Ensuring build is complete..."
cd backend/blockchain/solana/anchor
# Run cargo-build-sbf directly if needed to force toolchain installation
# cargo-build-sbf --force-tools-install

anchor build

# Deploy
echo "Deploying to devnet..."
anchor deploy

# Show program info
echo "Deployment Info:"
solana program show 8BHVu5Yt29eDf7pkt1GE3tkBHHdDrMmfT6fpuYQTuN4F
