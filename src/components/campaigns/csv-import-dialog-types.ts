import type { CsvContactRow } from "@/types/components";

export type CsvImportDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (contacts: { name?: string; email?: string; phone?: string }[]) => Promise<void>;
    isImporting: boolean;
};

export type CsvImportMapping = {
    name: string;
    email: string;
    phone: string;
};

export type { CsvContactRow };
