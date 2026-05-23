import { INTEGRATIONS_A } from "./integrations-items-a";
import { INTEGRATIONS_B } from "./integrations-items-b";
import type { IntegrationItem } from "./integrations-types";

export type { IntegrationItem } from "./integrations-types";

export const INTEGRATIONS: IntegrationItem[] = [...INTEGRATIONS_A, ...INTEGRATIONS_B];

export const LIVE_INTEGRATIONS = INTEGRATIONS.filter((i) => i.status === "live");
export const COMING_INTEGRATIONS = INTEGRATIONS.filter((i) => i.status === "soon");
