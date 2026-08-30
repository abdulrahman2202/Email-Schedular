"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";

interface FileUploadProps {
  onEmailsParsed: (emails: string[]) => void;
}

export default function FileUpload({ onEmailsParsed }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      Papa.parse(file, {
        complete(results) {
          const allStrings = results.data.flat().map(String);
          const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
          const found = new Set<string>();
          for (const cell of allStrings) {
            const matches = cell.match(emailRegex);
            if (matches) {
              for (const m of matches) found.add(m.toLowerCase());
            }
          }
          onEmailsParsed(Array.from(found));
        },
        error() {
          onEmailsParsed([]);
        },
      });
    },
    [onEmailsParsed]
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-[#10B981] text-sm font-medium hover:underline cursor-pointer"
      >
        <Upload size={14} />
        Upload List
      </button>
    </>
  );
}
