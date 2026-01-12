"use client";
import { useEffect, useState } from "react";
import { CertificateType } from "@/schemas/form";
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { usePhantomWallet } from "@/lib/phantom-wallet";
import {
  GetCertificateRecordByPublicKey,
  RevokeCertificate,
} from "@/action/certificate";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

async function getAnchorDiscriminator(name: string) {
  const preimage = new TextEncoder().encode(`global:${name}`);
  const hashBuf = await crypto.subtle.digest("SHA-256", preimage);
  return new Uint8Array(hashBuf).slice(0, 8);
}

async function revokeCertificateOnChain(
  certPublicKey: string,
  ownerPublicKey: string
) {
  const provider = (window as any).solana;
  if (!provider?.isPhantom) {
    throw new Error("Phantom wallet is not available");
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID ||
      "DrLi2HqpW1KM3mDTV8u2BHC7h5vZcGJPKCnoayZ1Rtrf"
  );

  const connection = new Connection(rpcUrl, "confirmed");
  const ownerPk = new PublicKey(ownerPublicKey);
  const certPk = new PublicKey(certPublicKey);

  const discriminator = await getAnchorDiscriminator("revoke_certificate");
  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: ownerPk, isSigner: true, isWritable: true },
      { pubkey: certPk, isSigner: false, isWritable: true },
    ],
    data: Buffer.from(discriminator),
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: ownerPk, recentBlockhash: blockhash });
  tx.add(ix);

  let signature: string;
  if (typeof provider.signAndSendTransaction === "function") {
    const res = await provider.signAndSendTransaction(tx);
    signature = res.signature;
  } else {
    const signedTx = await provider.signTransaction(tx);
    signature = await connection.sendRawTransaction(signedTx.serialize());
  }

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return signature;
}

export default function CertificateDetails({
  params,
}: {
  params: {
    certificate_public_key: string;
  };
}) {
  const { certificate_public_key } = params;
  console.log(certificate_public_key);
  const [certificateData, setCertificateData] =
    useState<CertificateType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevoked, setIsRevoked] = useState<boolean>(false);
  const [revoking, setRevoking] = useState<boolean>(false);

  const { publicKey: phantomPublicKey } = usePhantomWallet();
  //localhost:8000/get-certificate-data?cert_public_key=FHKZCEfSivvadB19bDSkED5sb26Z1BTFmKgaJ6poWNPD
  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-certificate-data?cert_public_key=${certificate_public_key}`
        );
        const data = await response.json();

        if (data?.status !== "Success") {
          throw new Error(data?.message || "Failed to fetch certificate data");
        }

        setCertificateData(data.data);

        const record = await GetCertificateRecordByPublicKey(
          certificate_public_key
        );
        setIsRevoked(!!record?.isRevoked);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [certificate_public_key]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const canRevoke =
    !!certificateData &&
    !!phantomPublicKey &&
    phantomPublicKey === certificateData.owner &&
    !isRevoked;

  async function onRevoke() {
    if (!certificateData) return;
    if (!phantomPublicKey) {
      toast({
        title: "Not connected",
        description: "Please login Phantom first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRevoking(true);

      const sig = await revokeCertificateOnChain(
        certificate_public_key,
        phantomPublicKey
      );

      await RevokeCertificate(certificate_public_key, phantomPublicKey);
      setIsRevoked(true);
      toast({
        title: "Revoked",
        description: `Certificate revoked on-chain. Tx: ${sig}`,
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: String(e),
        variant: "destructive",
      });
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center">
      {certificateData ? (
        <div className=" p-10 rounded-lg w-2/3 bg-secondary">
          <h3 className="text-2xl font-bold mb-4">Certificate Details:</h3>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Status: {isRevoked ? "Revoked" : "Active"}
            </div>
            {canRevoke && (
              <Button
                type="button"
                variant={"destructive"}
                disabled={revoking}
                onClick={onRevoke}
              >
                {revoking ? "Revoking..." : "Revoke"}
              </Button>
            )}
          </div>
          <p>
            <strong>Full Name:</strong> {certificateData.fullname}
          </p>
          <p>
            <strong>Birthday:</strong> {certificateData.birthday.day}/
            {certificateData.birthday.month}/{certificateData.birthday.year}
          </p>
          <p>
            <strong>Delivery Date:</strong> {certificateData.delivery_date.day}/
            {certificateData.delivery_date.month}/
            {certificateData.delivery_date.year}
          </p>
          <p>
            <strong>Sender:</strong> {certificateData.sender}
          </p>
          <p>
            <strong>Owner:</strong> {certificateData.owner}
          </p>
          <p>
            <strong>Serial ID:</strong> {certificateData.serial_id}
          </p>
          <p>
            <strong>Security Code:</strong> {certificateData.security_code}
          </p>
          <p>
            <strong>More Info:</strong> {certificateData.more_info || "N/A"}
          </p>
          <p>
            <strong>Original Data SHA-256:</strong>{" "}
            {certificateData.original_data_sha256}
          </p>
          <p>
            <strong>Original Image SHA-256:</strong>{" "}
            {certificateData.original_image_sha256}
          </p>
        </div>
      ) : (
        <p>Certificate not found.</p>
      )}
    </div>
  );
}
