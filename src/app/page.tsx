"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GetOwnerCertificateDataType,
  getOwnerCertificateData,
  CertificateType,
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
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { GetCertificatesByOwner } from "@/action/certificate";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const [certsData, setCertsData] = useState<
    { data: CertificateType; certificate_public_key: string }[]
  >([]);
  const form = useForm<GetOwnerCertificateDataType>({
    resolver: zodResolver(getOwnerCertificateData),
    defaultValues: {
      owner_public_key: "",
    },
  });

  async function onHandleSubmit(values: GetOwnerCertificateDataType) {
    try {
      const certs = await GetCertificatesByOwner(values.owner_public_key);

      const certsDataArray = await Promise.all(
        certs.map(async (cert) => {
          const url = new URL("http://localhost:8000/get-certificate-data");

          // Add query parameters
          url.searchParams.append("cert_public_key", cert.certPublicKey);

          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (data?.status === "Success") {
            return {
              data: data.data,
              certificate_public_key: cert.certPublicKey,
            };
          }

          toast({
            title: "Error",
            description: `Failed to retrieve certificate data: ${
              data?.message || "Unknown error"
            }`,
            variant: "destructive",
          });
          return null;
        })
      );

      // Lọc bỏ những giá trị null trong mảng kết quả và cập nhật state
      const filteredCertsData = certsDataArray.filter((cert) => cert !== null);
      setCertsData(
        filteredCertsData as {
          data: CertificateType;
          certificate_public_key: string;
        }[]
      );
    } catch (error) {
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
        <div className="text-4xl font-bold">Get Your Certificate</div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onHandleSubmit)}
            className="space-y-4 w-2/3 flex py-10"
          >
            <div className="w-3/4">
              <FormField
                control={form.control}
                name="owner_public_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Public Key:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Your Public Key"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certsData.map(({ data, certificate_public_key }) => {
            console.log({ data, certificate_public_key });
            return (
              <CertCard
                key={certificate_public_key}
                cert={data}
                certificate_public_key={certificate_public_key}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CertCard({
  cert,
  certificate_public_key,
}: {
  cert: CertificateType;
  certificate_public_key: string;
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="truncate font-bold">{cert.fullname}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Serial ID: <span>{cert.serial_id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 truncate text-sm text-muted-foreground">
        <div className="text-sm font-medium text-muted-foreground">
          Sender: <span>{cert.sender}</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Birthday: {cert.birthday.day}/{cert.birthday.month}/
          {cert.birthday.year}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Delivery Date: {cert.delivery_date.day}/{cert.delivery_date.month}/
          {cert.delivery_date.year}
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full mt-2 text-md gap-4">
          <Link href={`/get-certificate/${certificate_public_key}`}>
            View Certificate
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
