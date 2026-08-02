export interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
}

export interface GoogleIdentityApi {
    initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        nonce: string;
        ux_mode: "popup";
        use_fedcm_for_button: boolean;
        button_auto_select: boolean;
    }): void;
    renderButton(
        parent: HTMLElement,
        options: {
            type: "standard";
            theme: "filled_black";
            size: "large";
            text: "signin_with" | "signup_with";
            shape: "pill";
            logo_alignment: "left";
            width: number;
        },
    ): void;
}

declare global {
    interface Window {
        google?: { accounts: { id: GoogleIdentityApi } };
    }
}
