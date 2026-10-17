/**
 * Extracts structured project files from an AI coding agent markdown response.
 * Handles multiple formats:
 * 1. Preceding headers: ### File: `index.html` or **index.html** or File: index.html
 * 2. Fence tags: ```html filename="index.html" or ```js:script.js or ```html index.html
 * 3. XML tags: <file name="index.html">...</file>
 * 4. Fallback defaults for standalone code blocks (e.g. index.html, style.css, script.js)
 */

const EXCLUDED_LANGUAGES = new Set([
  "bash",
  "sh",
  "shell",
  "zsh",
  "powershell",
  "ps1",
  "cmd",
  "terminal",
  "console",
  "text",
  "txt",
]);

const LANGUAGE_DEFAULT_FILENAMES = {
  html: "index.html",
  css: "style.css",
  javascript: "script.js",
  js: "script.js",
  jsx: "App.jsx",
  typescript: "index.ts",
  ts: "index.ts",
  tsx: "App.tsx",
  python: "main.py",
  py: "main.py",
  java: "Main.java",
  cpp: "main.cpp",
  c: "main.c",
  csharp: "Program.cs",
  cs: "Program.cs",
  go: "main.go",
  rust: "main.rs",
  rs: "main.rs",
  php: "index.php",
  ruby: "main.rb",
  rb: "main.rb",
  sql: "schema.sql",
  json: "package.json",
};

export const extractFilesFromMarkdown = (content) => {
  if (!content || typeof content !== "string") {
    return [];
  }

  const files = [];
  const seenFileNames = new Set();

  const addFile = (name, code) => {
    if (!name || typeof name !== "string") return;
    const cleanName = name.replace(/[`"'*]/g, "").trim();
    const cleanCode = code ? code.trim() : "";

    if (!cleanName || cleanCode.length === 0) return;
    if (seenFileNames.has(cleanName.toLowerCase())) return;

    seenFileNames.add(cleanName.toLowerCase());
    files.push({
      name: cleanName,
      content: cleanCode,
    });
  };

  // 1. Look for XML style tags: <file name="index.html">...</file>
  const xmlRegex = /<file\s+(?:name|path)=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
  let match;
  while ((match = xmlRegex.exec(content)) !== null) {
    const rawName = match[1];
    let fileBody = match[2].trim();
    // Strip markdown code fences if wrapped inside
    fileBody = fileBody.replace(/^```[a-zA-Z0-9_-]*\r?\n/, "").replace(/\r?\n```$/, "");
    addFile(rawName, fileBody);
  }

  // 2. Iterate through code blocks and inspect headers or previous lines
  const codeBlockRegex = /```([^\r\n]*)\r?\n([\s\S]*?)```/g;
  let blockMatch;

  while ((blockMatch = codeBlockRegex.exec(content)) !== null) {
    const fenceInfo = (blockMatch[1] || "").trim();
    const code = blockMatch[2] || "";
    const blockStartIndex = blockMatch.index;

    // Check if fence has a language and/or filename
    // e.g. ```html:index.html or ```html filename="index.html" or ```js script.js
    let fileName = null;
    let language = "";

    const fenceParts = fenceInfo.split(/[\s:=]+/);
    if (fenceParts.length > 0) {
      language = fenceParts[0].toLowerCase().trim();
    }

    // Check if filename is in the fence info
    const fileInFenceMatch = fenceInfo.match(
      /(?:file|filename)=["']?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)["']?|[:\s]([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)$/i
    );
    if (fileInFenceMatch) {
      fileName = fileInFenceMatch[1] || fileInFenceMatch[2];
    }

    // If no filename in fence, inspect the preceding text (last 300 characters before the code block)
    if (!fileName) {
      const precedingText = content.substring(Math.max(0, blockStartIndex - 350), blockStartIndex);
      const precedingLines = precedingText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      // Check last few lines before the code block
      for (let i = precedingLines.length - 1; i >= Math.max(0, precedingLines.length - 4); i--) {
        const line = precedingLines[i];
        // Match patterns like:
        // ### File: `index.html`
        // ### index.html
        // **File: index.html**
        // File: `index.html`
        // // index.html
        const fileMatch = line.match(
          /(?:###|##|#|\*\*|File:?|Path:?|\/\/|<!--)\s*(?:File:?|Path:?)?\s*[`"']?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)[`"']?/i
        );
        if (fileMatch && fileMatch[1]) {
          fileName = fileMatch[1];
          break;
        }
      }
    }

    // Skip installation commands or CLI shell scripts unless explicitly named
    if (!fileName && EXCLUDED_LANGUAGES.has(language)) {
      continue;
    }

    // If still no filename, and code is not a command, provide a fallback filename from language
    if (!fileName && language && LANGUAGE_DEFAULT_FILENAMES[language]) {
      const defaultName = LANGUAGE_DEFAULT_FILENAMES[language];
      if (!seenFileNames.has(defaultName.toLowerCase())) {
        fileName = defaultName;
      } else {
        // e.g. script_2.js
        fileName = `${language}_${files.length + 1}.${language}`;
      }
    }

    if (fileName) {
      addFile(fileName, code);
    }
  }

  return files;
};
