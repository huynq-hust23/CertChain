"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GetCertificateDataSchemaType,
  getCertificateDataSchema,
} from "@/schemas/form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { usePhantomWallet } from "@/lib/phantom-wallet";
import { GetCertificatesByOwner } from "@/action/certificate";
import { RevokeCertificate } from "@/action/certificate";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "@/lib/idl/certchain.json";

export default function GetCertificate() {
  const { publicKey } = usePhantomWallet();
  const [certificateData, setCertificateData] = useState<any>(null);
  const [myCertificates, setMyCertificates] = useState<any[]>([]);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const form = useForm<GetCertificateDataSchemaType>({
    resolver: zodResolver(getCertificateDataSchema),
    defaultValues: {
      cert_public_key: "",
    },
  });

  // Fetch my certificates when wallet is connected
  useEffect(() => {
    async function fetchMyCertificates() {
      if (publicKey) {
        try {
          const certs = await GetCertificatesByOwner(publicKey.toString());
          setMyCertificates(certs);
        } catch (error) {
          console.error("Failed to fetch certificates", error);
        }
      }
    }
    fetchMyCertificates();
  }, [publicKey]);

  async function onHandleSubmit(values: GetCertificateDataSchemaType) {
    try {
      const url = new URL("http://localhost:8000/get-certificate-data");

      // Add query parameters
      url.searchParams.append("cert_public_key", values.cert_public_key);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data?.status === "Success") {
        console.log("Certificate Data:", data);
        setCertificateData(data.data);
        toast({
          title: "Success",
          description: "Certificate data retrieved successfully.",
          variant: "default",
        });
      } else {
        // Handle revoked/deleted account
        if (data?.message?.includes("Account details not found") || data?.message?.includes("Account not found")) {
          const explorerUrl = `https://explorer.solana.com/address/${values.cert_public_key}?cluster=devnet`;
          window.open(explorerUrl, '_blank');

          toast({
            title: "Certificate Revoked",
            description: "This certificate has been revoked. Redirecting to Solana Explorer for history.",
            variant: "destructive",
          });
          setCertificateData(null);
        } else {
          toast({
            title: "Error",
            description: `Failed to retrieve certificate data: ${data?.message || "Unknown error"
              }`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Request failed. Please check your network connection.",
        variant: "destructive",
      });
    }
  }

  const handleSelectCert = (certKey: string) => {
    form.setValue("cert_public_key", certKey);
    // Optional: Auto submit
    // form.handleSubmit(onHandleSubmit)();
  };

  const handleRevoke = async (certPublicKey: string) => {
    if (!publicKey) return;

    setIsRevoking(certPublicKey);
    try {
      // 1. Setup Anchor Provider
      const connection = new anchor.web3.Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");
      const provider = new anchor.AnchorProvider(
        connection,
        window.solana as any,
        anchor.AnchorProvider.defaultOptions()
      );

      // 2. Setup Program
      const programId = new PublicKey("8BHVu5Yt29eDf7pkt1GE3tkBHHdDrMmfT6fpuYQTuN4F");
      const program = new anchor.Program(idl as any, provider);

      // 3. Call SC revoke_certificate
      console.log("Revoking certificate on-chain:", certPublicKey);
      const tx = await program.methods
        .revokeCertificate()
        .accounts({
          owner: publicKey,
          cert: new PublicKey(certPublicKey),
        })
        .rpc();

      console.log("Revocation TX:", tx);

      // 4. Update DB
      await RevokeCertificate(certPublicKey, publicKey.toString());

      toast({
        title: "Success",
        description: "Certificate revoked successfully.",
        variant: "default",
      });

      // Refresh list
      const certs = await GetCertificatesByOwner(publicKey.toString());
      setMyCertificates(certs);

    } catch (error: any) {
      console.error("Revocation failed:", error);
      toast({
        title: "Error",
        description: "Failed to revoke certificate: " + (error.message || error),
        variant: "destructive",
      });
    } finally {
      setIsRevoking(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-4">
      <div className="w-full h-fit flex flex-col items-center">
        <div className="text-4xl font-bold">Get Certificate Data</div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onHandleSubmit)}
            className="space-y-4 w-2/3 flex py-10"
          >
            <div className="w-3/4">
              <FormField
                control={form.control}
                name="cert_public_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Public Key:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Certificate Public Key"
                        className="outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full mt-4"
              >
                {!form.formState.isSubmitting && (
                  <span>Get Certificate Data</span>
                )}
                {form.formState.isSubmitting && (
                  <FaSpinner className="animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </Form>

        {certificateData && (
          <div className="mt-4 p-4 rounded-lg w-2/3 bg-secondary">
            <h3 className="text-2xl font-bold mb-4">Certificate Data:</h3>
            <p>
              <strong>Sender:</strong> {certificateData.sender}
            </p>
            <p>
              <strong>Owner:</strong> {certificateData.owner}
            </p>
            <p>
              <strong>Full Name:</strong> {certificateData.fullname}
            </p>
            <p>
              <strong>Birthday:</strong> {certificateData.birthday.day}/
              {certificateData.birthday.month}/{certificateData.birthday.year}
            </p>
            <p>
              <strong>Delivery Date:</strong>{" "}
              {certificateData.delivery_date.day}/
              {certificateData.delivery_date.month}/
              {certificateData.delivery_date.year}
            </p>
            <p>
              <strong>Serial ID:</strong> {certificateData.serial_id}
            </p>
            <p>
              <strong>Security Code:</strong> {certificateData.security_code}
            </p>
            <p>
              <strong>More Info:</strong> {certificateData.more_info}
            </p>
            <p>
              <strong>Original Data:</strong>{" "}
              {certificateData.original_data_sha256}
            </p>
            <p>
              <strong>Original Image:</strong>{" "}
              {certificateData.original_image_sha256}
            </p>
          </div>
        )}

        {/* My Certificates Section */}
        {publicKey && myCertificates.length > 0 && (
          <div className="w-2/3 mt-10">
            <h3 className="text-2xl font-bold mb-4">My Certificates</h3>
            <div className="grid gap-4">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 border rounded-lg flex justify-between items-center bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col cursor-pointer" onClick={() => handleSelectCert(cert.certPublicKey)}>
                    <span className="font-mono text-sm">{cert.certPublicKey}</span>
                    <span className={`text-xs ${cert.isRevoked ? "text-destructive" : "text-green-500"}`}>
                      {cert.isRevoked ? "Revoked" : "Active"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      if (cert.isRevoked) {
                        window.open(`https://explorer.solana.com/address/${cert.certPublicKey}?cluster=devnet`, '_blank');
                      } else {
                        handleSelectCert(cert.certPublicKey);
                        form.handleSubmit(onHandleSubmit)();
                      }
                    }}>
                      {cert.isRevoked ? "View History" : "View"}
                    </Button>
                    {!cert.isRevoked && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!!isRevoking}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevoke(cert.certPublicKey);
                        }}
                      >
                        {isRevoking === cert.certPublicKey ? <FaSpinner className="animate-spin" /> : "Revoke"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
