import fs from 'fs';

const desc = `Three little pigs from all over the world are meeting for a convention! Every minute, a triple of 3 new pigs arrives on the convention floor. After the n-th minute, the convention ends.

The big bad wolf has learned about this convention, and he has an attack plan. At some minute in the convention, he will arrive and eat exactly x pigs. Then he will get away.

Input

The first line of input contains two integers n and q.

Each of the next q lines contains a single integer x_i.

Output

You should print q lines.

Examples

Input

2 3
1
5
6

Output

9
6
1

Note

In the example test, n=2.`;

function parseDescription(raw) {
  if (!raw) return "";

  // Split out the sections
  // Codeforces typical structure:
  // [Desc]
  // Input
  // [Input]
  // Output
  // [Output]
  // Examples / Example
  // ...
  // Note
  // [Note]

  const sections = {
    desc: "",
    input: "",
    output: "",
    note: ""
  };

  // We can use regex to find these markers.
  // The markers are typically exactly "Input", "Output", "Example", "Examples", "Note" preceded and followed by newlines.
  
  let currentSection = "desc";
  const lines = raw.split('\n');
  let currentText = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "Input" && currentSection === "desc") {
      sections[currentSection] = currentText.join('\n').trim();
      currentText = [];
      currentSection = "input";
    } else if (line === "Output" && currentSection === "input") {
      sections[currentSection] = currentText.join('\n').trim();
      currentText = [];
      currentSection = "output";
    } else if ((line === "Example" || line === "Examples") && currentSection === "output") {
      sections[currentSection] = currentText.join('\n').trim();
      currentText = [];
      currentSection = "examples";
    } else if (line === "Note" && (currentSection === "examples" || currentSection === "output")) {
      sections[currentSection] = currentText.join('\n').trim();
      currentText = [];
      currentSection = "note";
    } else {
      currentText.push(lines[i]);
    }
  }
  
  if (currentSection !== "examples") {
    sections[currentSection] = currentText.join('\n').trim();
  }

  // Format into HTML
  const formatHTML = (text) => text.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<br/>').join('');

  let finalHTML = formatHTML(sections.desc);
  
  if (sections.input) {
    finalHTML += `\n<h3 class="font-bold text-text-primary text-[15px] mt-6 mb-2">Input</h3>\n${formatHTML(sections.input)}`;
  }
  if (sections.output) {
    finalHTML += `\n<h3 class="font-bold text-text-primary text-[15px] mt-6 mb-2">Output</h3>\n${formatHTML(sections.output)}`;
  }
  if (sections.note) {
    finalHTML += `\n<h3 class="font-bold text-text-primary text-[15px] mt-6 mb-2">Note</h3>\n${formatHTML(sections.note)}`;
  }

  return finalHTML;
}

console.log(parseDescription(desc));
