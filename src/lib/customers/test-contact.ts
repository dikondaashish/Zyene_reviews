/** Reserved, explicitly assigned tag. Never infer test status from names or contact details. */
export const TEST_CONTACT_TAG = "zyene:test";
export function isTestContact(contact: { tags?: unknown } | null | undefined): boolean {
    return Array.isArray(contact?.tags) && contact.tags.includes(TEST_CONTACT_TAG);
}
