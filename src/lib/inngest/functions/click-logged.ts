import { db } from "@/db";
import { clicks } from "@/db/schema";
import { newId } from "@/lib/ids";
import { inngest } from "../client";

/**
 * On `click/logged`: persist a click row.
 *
 * Why a queued event and not a synchronous DB write at /r/[code]: the
 * redirect route runs on Edge runtime (no Node net module) and we don't
 * want to block the response on a DB round-trip. Sending an event is a
 * single fetch to Inngest (~5ms), the actual write happens in this Node
 * handler with retries.
 */
export const clickLoggedPersist = inngest.createFunction(
  {
    id: "click-logged-persist",
    name: "Persist click event in DB",
    triggers: [{ event: "click/logged" }],
  },
  async ({ event, step }) => {
    const data = event.data as {
      linkId: string;
      partnerId: string;
      ipHash: string | null;
      userAgent: string | null;
      referer: string | null;
      country: string | null;
      subIdOverride: string | null;
    };

    await step.run("insert-click", async () => {
      await db.insert(clicks).values({
        id: newId(),
        linkId: data.linkId,
        partnerId: data.partnerId,
        ipHash: data.ipHash,
        userAgent: data.userAgent,
        referer: data.referer,
        country: data.country,
        subIdOverride: data.subIdOverride,
      });
    });

    return { ok: true };
  },
);
