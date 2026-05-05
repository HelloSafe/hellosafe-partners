/**
 * Public surface of the mail module. Use this from app code:
 *   import { send } from "@/lib/mail";
 *   await send({ to, template: "welcome", data: { name, loginUrl } });
 */

export { send } from "./send";
export type { SendOptions, SendResult } from "./send";
export type { Locale, RenderedEmail, EmailTemplate } from "./types";
