const BOM = String.fromCharCode(0xfeff);

const MIME = {
  json: "application/json;charset=utf-8",
  csv: "text/csv;charset=utf-8",
};

export function downloadText(filename, text, kind) {
  const body = kind === "csv" ? BOM + text : text;
  const blob = new Blob([body], { type: MIME[kind] ?? "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
