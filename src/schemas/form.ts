import { z } from "zod";
import * as bs58 from "bs58"; // Base58 library to validate the address format

export const formSchema = z.object({
  senderPrivateKey: z.string().refine(
    (value) => {
      try {
        const decoded = bs58.decode(value);
        // Solana private keys are commonly 64 bytes (or at least 32-byte seed)
        return decoded.length === 64 || decoded.length === 32;
      } catch (e) {
        return false;
      }
    },
    {
      message:
        "Sender Private Key is invalid. It must be a valid base58 private key.",
    }
  ),

  ownerPublicKey: z.string().refine(
    (value) => {
      try {
        const decoded = bs58.decode(value);
        return decoded.length === 32; // Public keys in Solana are 32 bytes long
      } catch (e) {
        return false;
      }
    },
    {
      message:
        "Owner Public Key is invalid. It must be a valid address accont.",
    }
  ),
  fullname: z.string(),
  birthday: z.object({
    day: z
      .number()
      .min(1, "Day must be between 1 and 31.")
      .max(31, "Day must be between 1 and 31."),
    month: z
      .number()
      .min(1, "Month must be between 1 and 12.")
      .max(12, "Month must be between 1 and 12."),
    year: z.number(),
    // .min(1900, "Year must be a valid year.")
    // .max(new Date().getFullYear(), "Year cannot be in the future."),
  }),

  deliveryDate: z.object({
    day: z
      .number()
      .min(1, "Day must be between 1 and 31.")
      .max(31, "Day must be between 1 and 31."),
    month: z
      .number()
      .min(1, "Month must be between 1 and 12.")
      .max(12, "Month must be between 1 and 12."),
    year: z
      .number()
      .min(1900, "Year must be a valid year.")
      .max(2100, "Year must be before 2100."),
  }),

  serialId: z
    .string()
    .min(1, "Serial ID cannot be empty.")
    .max(50, "Serial ID must be 50 characters or less."),

  securityCode: z
    .string()
    .min(4, "Security Code must be at least 4 characters long.")
    .max(12, "Security Code must be 12 characters or less."),

  moreInfo: z.string().optional(),

  originalData: z.string().nonempty("Original Data cannot be empty."),

  originalImage: z.string().url("Original Image must be a valid URL."),
});

export type formSchemaType = z.infer<typeof formSchema>;

export const getCertificateDataSchema = z.object({
  cert_public_key: z.string().min(1, "Certificate Public Key is required"),
});

export type GetCertificateDataSchemaType = z.infer<
  typeof getCertificateDataSchema
>;

export const getOwnerCertificateData = z.object({
  owner_public_key: z.string().min(1, "Owner Public Key is required"),
});

export type GetOwnerCertificateDataType = z.infer<
  typeof getOwnerCertificateData
>;

const certificateSchema = z.object({
  sender: z.string(),
  owner: z.string(),
  fullname: z.string(),
  birthday: z.object({
    day: z.number().min(1).max(31),
    month: z.number().min(1).max(12),
    year: z.number(),
  }),
  delivery_date: z.object({
    day: z.number().min(1).max(31),
    month: z.number().min(1).max(12),
    year: z.number(),
  }),
  serial_id: z.string(),
  security_code: z.string(),
  more_info: z.string().optional(),
  original_data_sha256: z.string(),
  original_image_sha256: z.string(),
});

export type CertificateType = z.infer<typeof certificateSchema>;