import { mkdirSync, writeFileSync } from "node:fs";
import { testLectoraPipeline } from "../lib/paes/lectora.test";
import { createLectoraPrintableHtml } from "../lib/paes/lectora-print";

const { exam, matrix } = testLectoraPipeline();
mkdirSync("artifacts/paes-lectora", { recursive: true });
for (const version of ["estudiante", "profesor"] as const) {
  const html = createLectoraPrintableHtml(exam, matrix, version);
  writeFileSync(`artifacts/paes-lectora/${version}.html`, html, "utf8");
}
console.log("Generated synthetic PAES print samples for visual inspection (NOT a full exam).");
