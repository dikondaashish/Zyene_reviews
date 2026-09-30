import type Papa from "papaparse";

export const SAFE_CSV_OPTIONS: Papa.UnparseConfig = {
    escapeFormulae: /^(?:[=+\-@\t\r]|\s+[=+\-@])/,
};
