export type CsvImportModalRow = {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    [key: string]: string | undefined;
};

export type CsvImportModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void | Promise<void>;
};
