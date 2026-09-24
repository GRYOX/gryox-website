import { z } from "zod";
import { CONTACT_TYPES } from "./types";

/** Server-side validation for the contact action. */
export const contactSchema = z.object({
  type: z.enum(CONTACT_TYPES, { error: "type" }),
  name: z.string().trim().min(2, "name").max(120, "name"),
  company: z.string().trim().max(160).optional().default(""),
  contact: z.string().trim().min(5, "contact").max(200, "contact"),
  message: z.string().trim().min(10, "message").max(5000, "message"),
  // Honeypot — humans never see or fill it.
  website: z.string().max(0).optional().default(""),
});
