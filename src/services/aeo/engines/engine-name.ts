import { ANSWER_ENGINE_IDS, type AnswerEngineId } from "./engine-types";
import { getEngineDescriptor } from "./engine-catalog";

/** Display name for an engine id ("chatgpt" → "ChatGPT"); unknown ids are tidied, never shown raw. */
export function engineName(id: string): string {
    if ((ANSWER_ENGINE_IDS as readonly string[]).includes(id)) return getEngineDescriptor(id as AnswerEngineId).label;
    return id.replace(/_/g, " ");
}
