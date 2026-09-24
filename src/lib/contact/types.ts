/** Client-safe contact constants and types (no validation library in the browser bundle). */
export const CONTACT_TYPES = ["website", "software", "app", "ai", "automation", "unsure"] as const;

export type ContactField = "type" | "name" | "contact" | "message";

export interface ContactState {
  status: "idle" | "success" | "error" | "unconfigured";
  errors?: Partial<Record<ContactField, true>>;
  /** Echoed back so fields keep their text (React resets forms after an action). */
  values?: { name: string; company: string; contact: string; message: string };
}
