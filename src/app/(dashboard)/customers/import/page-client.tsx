"use client";

import { useImportCustomers } from "./use-import-customers";
import { ImportCustomersHeader } from "./import-customers-header";
import {
    ImportingStep,
    ImportMapStep,
    ImportSuccessStep,
    ImportUploadStep,
} from "./import-customers-steps";

export default function ImportCustomersPage() {
    const state = useImportCustomers();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
            <ImportCustomersHeader />

            {state.step === "upload" && (
                <ImportUploadStep fileInputRef={state.fileInputRef} onFileSelect={state.handleFileSelect} />
            )}
            {state.step === "map" && <ImportMapStep state={state} />}
            {state.step === "importing" && <ImportingStep />}
            {state.step === "success" && state.importResults && (
                <ImportSuccessStep
                    importResults={state.importResults}
                    onImportAnother={state.resetUpload}
                />
            )}
        </div>
    );
}
