import fs from 'fs';

const raw = `Some description here
Input
first line
Output
second line
Example
Input
6
ABACAB
Output
NO
YES
Note
This is a note.`;

function formatDescription(raw) {
  if (!raw) return "";

  const lines = raw.split('\n');
  const headerStyle = "text-brand-orange text-[13px] font-bold tracking-[0.08em] uppercase border-b border-border-card pb-2 mt-8 mb-4 block w-full";

  let inExamplesSection = false;
  let resultLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (t === "Example" || t === "Examples") {
      inExamplesSection = true;
      continue;
    }

    if (inExamplesSection) {
      if (t === "Note") {
        inExamplesSection = false;
      } else {
        continue;
      }
    }

    if (t === "Input" || t === "Output" || t === "Note") {
      resultLines.push(`<div class="${headerStyle}">${t}</div>`);
    } else if (t) {
      resultLines.push(`<div class="min-h-[24px]">${line}</div>`);
    } else {
      resultLines.push("<div class='h-4'></div>");
    }
  }

  return resultLines.join('');
}

console.log(formatDescription(raw));
