"use client";

import { formSchema, formSchemaType } from "@/schemas/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FaSpinner } from "react-icons/fa";
import { CreateCertificate } from "@/action/certificate";
import { usePhantomWallet } from "@/lib/phantom-wallet";
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { sha256 } from "js-sha256";
import BN from "bn.js";
import idl from "@/lib/idl/certchain.json";
import { useEffect } from "react";

// Helpers
function stringToU16Array(str: string, len: number): number[] {
  const res = new Array(len).fill(0);
  for (let i = 0; i < str.length && i < len; i++) {
    res[i] = str.charCodeAt(i) + 1;
  }
  return res;
}

export default function CreateCertificates() {
  const { publicKey, isInstalled } = usePhantomWallet();

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderPrivateKey: "",
      ownerPublicKey: "",
      fullname: "",
      birthday: {
        day: 1,
        month: 1,
        year: 2000,
      },
      deliveryDate: {
        day: 1,
        month: 1,
        year: 2024,
      },
      serialId: "",
      securityCode: "123456",
      moreInfo: "",
      originalData: "",
      originalImage: "",
    },
  });

  // Auto-fill dummy sender key if connected
  useEffect(() => {
    if (publicKey) {
      // Set dummy valid base58 string (32 bytes of 1s) to pass Zod validation logic
      // The actual signing uses the connected wallet, so this value is ignored by the smart contract call logic
      const dummyKey = "1111111111111111111111111111111111111111111111111111111111111111"; // 64 chars
      // Fix validation: schema checks for 64 bytes or 32 bytes decode.
      // Let's use a valid base58 string that decodes to 32/64 bytes.
      // "11111111111111111111111111111111" decodes to 32 bytes of zeros.
      form.setValue("senderPrivateKey", "11111111111111111111111111111111");
    }
  }, [publicKey, form]);

  async function onHandleSubmit(values: formSchemaType) {
    if (publicKey) {
      // Client-side signing with Phantom
      try {
        if (!window.solana) throw new Error("Phantom not found window.solana");

        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");

        // Simple wallet adapter for Anchor
        const wallet = {
          publicKey: new PublicKey(publicKey),
          signTransaction: async (tx: any) => {
            return await window.solana!.signTransaction(tx);
          },
          signAllTransactions: async (txs: any[]) => {
            return await window.solana!.signAllTransactions(txs);
          }
        };

        const provider = new anchor.AnchorProvider(connection, wallet, {});
        const program = new anchor.Program(idl as any, provider);

        // Prepare Data
        const seed_8 = new BN(Date.now());
        const fullname = stringToU16Array(values.fullname, 32);
        const serial_id = stringToU16Array(values.serialId, 64);
        const more_info = stringToU16Array(values.moreInfo || "", 256); // Fix optional
        const security_code = sha256.digest(values.securityCode);
        const original_data = sha256.digest(values.originalData);
        const original_image = sha256.digest(values.originalImage);

        const bYear = values.birthday.year;
        const birthdayBytes = [values.birthday.day, values.birthday.month, bYear & 0xFF, (bYear >> 8) & 0xFF];

        const dYear = values.deliveryDate.year;
        const deliveryDateBytes = [values.deliveryDate.day, values.deliveryDate.month, dYear & 0xFF, (dYear >> 8) & 0xFF];

        // PDA
        const [certPda] = PublicKey.findProgramAddressSync(
          [
            wallet.publicKey.toBuffer(),
            Buffer.from("certificate"),
            seed_8.toArrayLike(Buffer, 'le', 8)
          ],
          program.programId
        );

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
            owner: new PublicKey(values.ownerPublicKey),
            cert: certPda,
          })
          .rpc();

        console.log("Tx Signature:", tx);

        toast({
          title: "Success",
          description: "Certificate created successfully on-chain!",
          variant: "default",
        });

        await CreateCertificate(certPda.toString(), values.ownerPublicKey);

      } catch (error: any) {
        console.error("Client Error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create certificate",
          variant: "destructive",
        });
      }
      return;
    }

    // Fallback to Server-side Logic
    console.log(values);
    try {
      const url = new URL("http://localhost:8000/init-certificate");

      // Add query parameters
      url.searchParams.append("senderPrivateKey", values.senderPrivateKey);
      url.searchParams.append("ownerPublicKey", values.ownerPublicKey);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: values.fullname,
          birthday: values.birthday,
          delivery_date: values.deliveryDate,
          serial_id: values.serialId,
          security_code: values.securityCode,
          more_info: values.moreInfo,
          original_data: values.originalData,
          original_image: values.originalImage,
        }),
      });

      const data = await response.json();
      if (data?.status === "Success") {
        console.log("Certificate created successfully:", data);
        toast({
          title: "Success",
          description: "Certificate created successfully.",
          variant: "default",
        });

        const certificatePublicKey: string | undefined =
          data?.data?.certificate_public_key;
        if (!certificatePublicKey) {
          throw new Error("Missing certificate_public_key from API response");
        }

        await CreateCertificate(certificatePublicKey, values.ownerPublicKey);
      } else {
        console.error("Error creating certificate:", data);
        // Fix lint error: cast data to any or specific error type if message is dynamic
        // Assuming data might have message property or default string
        const errorMsg = (data as any)?.message || "Unknown error";
        toast({
          title: "Error",
          description: `Failed to create certificate: ${errorMsg}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Request failed:", error);
      // Handle network or other unexpected errors
      toast({
        title: "Network Error",
        description: "Request failed. Please check your network connection.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-4">
      <div className="w-full h-fit flex flex-col items-center">
        <div className="text-4xl font-bold">Create Certificate</div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onHandleSubmit)}
            className="space-y-2 w-2/3 flex flex-col py-10"
          >
            <div className="w-full flex">
              <div className="w-1/2 px-4">
                <FormField
                  control={form.control}
                  name="senderPrivateKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Private Key(BS58 String):</FormLabel>
                      <FormControl>
                        {publicKey ? (
                          <div className="p-2 bg-secondary rounded text-muted-foreground border border-input text-sm">
                            Signed by Phantom: {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                          </div>
                        ) : (
                          <Input {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerPublicKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Public Key:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday:</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log(e.target.value);
                            const date = new Date(value);
                            field.onChange({
                              day: date.getDate(),
                              month: date.getMonth() + 1,
                              year: date.getFullYear(),
                            });
                            console.log(field.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date:</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log(e.target.value);

                            const date = new Date(value);
                            field.onChange({
                              day: date.getDate(),
                              month: date.getMonth() + 1,
                              year: date.getFullYear(),
                            });
                            console.log(field.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="no-margin-top w-1/2 px-4">
                <FormField
                  control={form.control}
                  name="serialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial ID:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="securityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Code:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moreInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>More Information (Optional):</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Data:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Image URL:</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the original image URL"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="px-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full mt-4"
              >
                {!form.formState.isSubmitting && (
                  <span>Create Certificate</span>
                )}
                {form.formState.isSubmitting && (
                  <FaSpinner className="animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
