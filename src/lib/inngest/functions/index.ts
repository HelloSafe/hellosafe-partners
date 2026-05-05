/**
 * Registry of Inngest functions exposed to the runtime. Add new handlers
 * here so /api/inngest/route.ts picks them up.
 */

import { clickLoggedPersist } from "./click-logged";
import { conversionCreatedNotify } from "./conversion-created";

export const functions = [clickLoggedPersist, conversionCreatedNotify];
