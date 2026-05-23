/** Extract line ranges (1-based inclusive) from a file */
import fs from "node:fs";

const [file, start, end, out] = process.argv.slice(2);
const lines = fs.readFileSync(file, "utf8").split("\n");
const slice = lines.slice(Number(start) - 1, Number(end)).join("\n");
fs.writeFileSync(out, slice + "\n");
console.log(`Wrote ${out} (${Number(end) - Number(start) + 1} lines)`);
