const ICON_BASE = 'xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const EMAIL_STATUS_ICONS = {
    success: `<svg ${ICON_BASE} style="color:#16a34a"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>`,
    warning: `<svg ${ICON_BASE} style="color:#dc2626"><path d="M12 3 2.8 19a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    sparkle: `<svg ${ICON_BASE} style="color:#16a34a"><path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z"/><path d="m19 16-.5 2.5L16 19l2.5.5L19 22l.5-2.5L22 19l-2.5-.5L19 16Z"/></svg>`,
    goodbye: `<svg ${ICON_BASE} style="color:#52525b"><path d="M15 8.5a4.5 4.5 0 1 0 0 7"/><path d="M9 12h10"/><path d="m16 9 3 3-3 3"/></svg>`,
    check: `<svg ${ICON_BASE} width="16" height="16" style="color:#10b981"><path d="m5 12 4 4L19 6"/></svg>`,
} as const;
