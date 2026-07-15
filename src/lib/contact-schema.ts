import { z } from "zod";

/**
 * Shared client/server validation for the contact form.
 * Data minimization: only the fields the business actually needs.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "נא להזין שם מלא (לפחות 2 תווים)")
    .max(100, "השם ארוך מדי"),
  phone: z
    .string()
    .trim()
    .regex(/^0(?:[23489]|5[0-9]|7[2-9])-?\d{7}$/, "נא להזין מספר טלפון ישראלי תקין"),
  email: z.string().trim().email("נא להזין כתובת אימייל תקינה").max(254),
  service: z
    .enum(["business-advisory", "business-credit", "mortgage-advisory", "other"])
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, "נא לפרט את הפנייה (לפחות 10 תווים)")
    .max(2000, "ההודעה ארוכה מדי (עד 2000 תווים)"),
  /** Explicit opt-in for marketing (Communications Law §30A). Default off. */
  marketingConsent: z.boolean().default(false),
  /** Honeypot — humans leave it empty; the server pretends success if filled. */
  company: z.string().max(200).optional(),
  /** Anti-bot time trap — when the form was rendered. */
  renderedAt: z.number(),
});

export type ContactInput = z.infer<typeof contactSchema>;
