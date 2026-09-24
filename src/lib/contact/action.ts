"use server";

import { contactSchema } from "./schema";
import type { ContactField, ContactState } from "./types";

/**
 * Contact form → email via Resend's REST API (no SDK).
 * Required env: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL (a verified sender).
 * Without them the action reports "unconfigured" instead of pretending to send.
 */
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData);
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).slice(0, 5000) : "");
  const values = { name: str("name"), company: str("company"), contact: str("contact"), message: str("message") };
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    // A filled honeypot is a bot: answer as if it worked, send nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { status: "success" };
    const errors: Partial<Record<ContactField, true>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "type" || field === "name" || field === "contact" || field === "message") errors[field] = true;
    }
    return { status: "error", errors, values };
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) return { status: "unconfigured", values };

  const { type, name, company, contact, message } = parsed.data;
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : undefined;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject: `GRYOX — ${type} — ${name}`,
        // Plain text only: user input is never interpreted as HTML.
        text: [
          `Tipo / Type: ${type}`,
          `Nome / Name: ${name}`,
          `Empresa / Company: ${company || "—"}`,
          `Contato / Contact: ${contact}`,
          "",
          message,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { status: "error", values };
    return { status: "success" };
  } catch {
    return { status: "error", values };
  }
}
