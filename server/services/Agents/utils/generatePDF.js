import PDFDocument from "pdfkit";

/**
 * Generates an executive, publication-grade PDF document.
 * Includes modern cover page, running headers/footers, clean typography,
 * code blocks, zebra-striped tables, hanging indent lists, and callout boxes.
 */
const generatePDF = async (data) => {
  return new Promise((resolve, reject) => {
    if (!data || typeof data !== "object") {
      reject(new Error("Invalid document data: object expected."));
      return;
    }

    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      data.title = "Executive Document";
    }

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 54,
        bottom: 54,
        left: 54,
        right: 54,
      },
      bufferPages: true,
      info: {
        Author: data.metadata?.author || "AgentFlow AI",
        Title: data.title,
        Creator: "AgentFlow AI",
        Subject: data.subtitle || data.documentType || "Executive Document",
      },
    });

    const chunks = [];
    let settled = false;

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });

    doc.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks));
    });

    // --------------------------------------------------
    // DESIGN SYSTEM & PALETTE
    // --------------------------------------------------

    const PAGE_LEFT = 54;
    const PAGE_RIGHT = 54;
    const CONTENT_WIDTH = doc.page.width - PAGE_LEFT - PAGE_RIGHT;

    const COLORS = {
      primary: "#0F172A",       // Slate 900
      primaryDark: "#020617",   // Slate 950
      accent: "#2563EB",        // Royal Blue
      accentHover: "#1D4ED8",
      accentLight: "#DBEAFE",   // Blue 100
      secondary: "#475569",     // Slate 600
      text: "#334155",          // Slate 700 - optimal body readability
      heading: "#0F172A",       // Slate 900
      muted: "#64748B",         // Slate 500
      border: "#E2E8F0",        // Slate 200
      borderLight: "#F1F5F9",   // Slate 100
      surface: "#F8FAFC",       // Slate 50
      surfaceCard: "#F1F5F9",   // Slate 100
      white: "#FFFFFF",
      codeBg: "#0F172A",        // Dark code box
      codeHeader: "#020617",    // Dark header bar for code
      codeText: "#E2E8F0",
      // Callout themes
      infoBg: "#EFF6FF",
      infoBorder: "#2563EB",
      infoText: "#1E40AF",
      warningBg: "#FFFBEB",
      warningBorder: "#D97706",
      warningText: "#92400E",
      errorBg: "#FEF2F2",
      errorBorder: "#DC2626",
      errorText: "#991B1B",
      successBg: "#ECFDF5",
      successBorder: "#059669",
      successText: "#065F46",
    };

    // --------------------------------------------------
    // LAYOUT HELPERS
    // --------------------------------------------------

    const ensureSpace = (height = 35) => {
      if (doc.y <= doc.page.margins.top + 10) return;
      if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }
    };

    const addHeading = (text, level = 1) => {
      if (!text) return;

      if (level === 1) {
        ensureSpace(42);
        doc.moveDown(0.4);

        const startY = doc.y;

        // Accent vertical bar
        doc
          .roundedRect(PAGE_LEFT, startY + 1, 3.5, 18, 1.5)
          .fill(COLORS.accent);

        // Heading text
        doc
          .font("Helvetica-Bold")
          .fontSize(16)
          .fillColor(COLORS.heading)
          .text(String(text), PAGE_LEFT + 12, startY, {
            width: CONTENT_WIDTH - 12,
          });

        const endY = doc.y;

        // Subtle divider underline
        doc
          .rect(PAGE_LEFT, endY + 4, CONTENT_WIDTH, 0.5)
          .fill(COLORS.border);

        doc.y = endY + 10;
      } else if (level === 2) {
        ensureSpace(32);
        doc.moveDown(0.3);

        doc
          .font("Helvetica-Bold")
          .fontSize(13)
          .fillColor(COLORS.primary)
          .text(String(text), PAGE_LEFT, doc.y, {
            width: CONTENT_WIDTH,
          });

        doc.moveDown(0.2);
      } else {
        ensureSpace(24);
        doc.moveDown(0.25);

        doc
          .font("Helvetica-Bold")
          .fontSize(10.5)
          .fillColor(COLORS.secondary)
          .text(String(text), PAGE_LEFT, doc.y, {
            width: CONTENT_WIDTH,
          });

        doc.moveDown(0.25);
      }
    };

    const addParagraph = (text) => {
      if (text === undefined || text === null || text === "") {
        return;
      }

      ensureSpace(22);

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.text)
        .text(String(text), PAGE_LEFT, doc.y, {
          width: CONTENT_WIDTH,
          lineGap: 3.5,
          paragraphGap: 4,
        });

      doc.moveDown(0.35);
    };

    const addBulletList = (items = []) => {
      if (!Array.isArray(items) || items.length === 0) return;

      const indentX = 18;
      const textWidth = CONTENT_WIDTH - indentX;

      items.forEach((item) => {
        const text =
          typeof item === "string"
            ? item
            : (item?.text ?? item?.description ?? item?.title ?? "");

        if (!text) return;

        ensureSpace(18);

        const currentY = doc.y;

        // Render sleek circular bullet
        doc
          .circle(PAGE_LEFT + 6, currentY + 5.5, 2.2)
          .fill(COLORS.accent);

        // Render text with true hanging indent
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(COLORS.text)
          .text(text, PAGE_LEFT + indentX, currentY, {
            width: textWidth,
            lineGap: 3,
          });

        doc.moveDown(0.2);
      });

      doc.moveDown(0.3);
    };

    const addNumberedList = (items = []) => {
      if (!Array.isArray(items) || items.length === 0) return;

      const indentX = 22;
      const textWidth = CONTENT_WIDTH - indentX;

      items.forEach((item, index) => {
        const text =
          typeof item === "string"
            ? item
            : (item?.text ?? item?.description ?? item?.title ?? "");

        if (!text) return;

        ensureSpace(18);

        const currentY = doc.y;

        // Render number pill
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(COLORS.accent)
          .text(`${index + 1}.`, PAGE_LEFT + 2, currentY, {
            width: 16,
            align: "left",
          });

        // Render text with true hanging indent
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(COLORS.text)
          .text(text, PAGE_LEFT + indentX, currentY, {
            width: textWidth,
            lineGap: 3,
          });

        doc.moveDown(0.2);
      });

      doc.moveDown(0.3);
    };

    const addCallout = (item) => {
      const calloutObj = typeof item === "string" ? { text: item } : (item || {});
      const title = calloutObj.title || "Note";
      const text = calloutObj.text || "";
      const severity = String(calloutObj.severity || "info").toLowerCase();

      let bg = COLORS.infoBg;
      let border = COLORS.infoBorder;
      let titleColor = COLORS.infoText;
      let badgeLabel = "INFO";

      if (severity === "warning") {
        bg = COLORS.warningBg;
        border = COLORS.warningBorder;
        titleColor = COLORS.warningText;
        badgeLabel = "WARNING";
      } else if (severity === "error") {
        bg = COLORS.errorBg;
        border = COLORS.errorBorder;
        titleColor = COLORS.errorText;
        badgeLabel = "IMPORTANT";
      } else if (severity === "success" || severity === "tip") {
        bg = COLORS.successBg;
        border = COLORS.successBorder;
        titleColor = COLORS.successText;
        badgeLabel = "NOTE";
      }

      ensureSpace(60);

      const startY = doc.y;
      const padding = 12;
      const innerWidth = CONTENT_WIDTH - padding * 2 - 4;

      doc.font("Helvetica-Bold").fontSize(10);
      const titleHeight = doc.heightOfString(`${badgeLabel}: ${title}`, {
        width: innerWidth,
      });

      doc.font("Helvetica").fontSize(9);
      const textHeight = text
        ? doc.heightOfString(text, {
            width: innerWidth,
            lineGap: 3,
          })
        : 0;

      const boxHeight = padding * 2 + titleHeight + (text ? 5 + textHeight : 0);

      // Callout box background
      doc
        .roundedRect(PAGE_LEFT, startY, CONTENT_WIDTH, boxHeight, 6)
        .fill(bg);

      // Left accent bar
      doc
        .roundedRect(PAGE_LEFT, startY, 4, boxHeight, 2)
        .fill(border);

      // Callout Title
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(titleColor)
        .text(`${badgeLabel}: ${title}`, PAGE_LEFT + padding + 4, startY + padding, {
          width: innerWidth,
        });

      // Callout Text
      if (text) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(text, PAGE_LEFT + padding + 4, doc.y + 4, {
            width: innerWidth,
            lineGap: 3,
          });
      }

      doc.y = startY + boxHeight + 12;
    };

    const addQuote = (item) => {
      const quoteObj = typeof item === "string" ? { text: item } : (item || {});
      if (!quoteObj.text) return;

      ensureSpace(45);

      const startY = doc.y;
      const padding = 10;
      const innerWidth = CONTENT_WIDTH - 20;

      doc.font("Helvetica-Oblique").fontSize(9.5);
      const textHeight = doc.heightOfString(`“${item.text}”`, {
        width: innerWidth,
        lineGap: 3,
      });

      const attributionHeight = item.attribution ? 16 : 0;
      const totalHeight = textHeight + attributionHeight;

      // Vertical quote bar on the left
      doc
        .roundedRect(PAGE_LEFT + 2, startY, 3, totalHeight + 2, 1.5)
        .fill(COLORS.accent);

      doc
        .font("Helvetica-Oblique")
        .fontSize(9.5)
        .fillColor(COLORS.secondary)
        .text(`“${item.text}”`, PAGE_LEFT + 14, startY, {
          width: innerWidth,
          lineGap: 3,
        });

      if (item.attribution) {
        doc
          .moveDown(0.2)
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .fillColor(COLORS.muted)
          .text(`— ${item.attribution}`, PAGE_LEFT + 14, doc.y, {
            align: "right",
            width: innerWidth,
          });
      }

      doc.moveDown(0.5);
    };

    // --------------------------------------------------
    // TABLE RENDERER (ZEBRA STRIPED & AUTO PAGING)
    // --------------------------------------------------

    const addTable = (item) => {
      const columns = item.columns || [];
      const rows = item.rows || [];

      if (!columns.length) return;

      const colCount = columns.length;
      const colWidth = CONTENT_WIDTH / colCount;
      const padding = 7;
      const fontSize = 8.5;

      const drawRow = (cells, isHeader = false, isEven = false) => {
        const values = columns.map((_, index) => String(cells?.[index] ?? ""));
        const font = isHeader ? "Helvetica-Bold" : "Helvetica";

        const heights = values.map((value) => {
          doc.font(font).fontSize(fontSize);
          return doc.heightOfString(value, {
            width: colWidth - padding * 2,
            lineGap: 2,
          });
        });

        const rowHeight = Math.max(...heights, 12) + padding * 2;

        if (doc.y > doc.page.margins.top + 10 && doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }

        const startY = doc.y;
        const rowBg = isHeader
          ? COLORS.primary
          : isEven
            ? COLORS.surface
            : COLORS.white;

        values.forEach((value, index) => {
          const x = PAGE_LEFT + index * colWidth;

          doc
            .rect(x, startY, colWidth, rowHeight)
            .lineWidth(0.5)
            .fillAndStroke(rowBg, COLORS.border);

          doc
            .font(font)
            .fontSize(fontSize)
            .fillColor(isHeader ? COLORS.white : COLORS.text)
            .text(value, x + padding, startY + padding, {
              width: colWidth - padding * 2,
              height: rowHeight - padding * 2,
              lineGap: 2,
            });
        });

        doc.y = startY + rowHeight;
      };

      ensureSpace(40);
      drawRow(columns, true, false);

      rows.forEach((row, rowIndex) => {
        const isEven = rowIndex % 2 === 1;
        if (Array.isArray(row)) {
          drawRow(row, false, isEven);
        } else if (row && typeof row === "object") {
          const rowKeys = Object.keys(row);
          const cellValues = columns.map((column) => {
            if (row[column] !== undefined) return row[column];
            const lowerCol = String(column).toLowerCase();
            const matchedKey = rowKeys.find((k) => k.toLowerCase() === lowerCol);
            return matchedKey ? row[matchedKey] : "";
          });
          drawRow(cellValues, false, isEven);
        }
      });

      doc.moveDown(0.6);
    };

    // --------------------------------------------------
    // CODE BLOCK RENDERER (MODERN DARK THEME)
    // --------------------------------------------------

    const addCodeBlock = (item) => {
      if (item.title) {
        addHeading(item.title, 3);
      }

      const language = (item.language || "code").toUpperCase();
      const code = String(item.code || "");
      const lines = code.split("\n");
      const maxLinesPerBlock = 30;

      for (let i = 0; i < lines.length; i += maxLinesPerBlock) {
        const block = lines.slice(i, i + maxLinesPerBlock).join("\n");

        doc.font("Courier").fontSize(8);
        const codeHeight = doc.heightOfString(block, {
          width: CONTENT_WIDTH - 20,
          lineGap: 2,
        });

        const headerHeight = 20;
        const boxHeight = headerHeight + codeHeight + 16;

        if (doc.y > doc.page.margins.top + 10 && doc.y + boxHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }

        const startY = doc.y;

        // Container background
        doc
          .roundedRect(PAGE_LEFT, startY, CONTENT_WIDTH, boxHeight, 6)
          .fill(COLORS.codeBg);

        // Header bar background
        doc
          .roundedRect(PAGE_LEFT, startY, CONTENT_WIDTH, headerHeight, 6)
          .fill(COLORS.codeHeader);

        // Fill gap between header and body so bottom of header isn't rounded
        doc
          .rect(PAGE_LEFT, startY + headerHeight - 4, CONTENT_WIDTH, 4)
          .fill(COLORS.codeHeader);

        // Mac-style window dots
        doc.circle(PAGE_LEFT + 12, startY + 10, 3).fill("#EF4444"); // Red
        doc.circle(PAGE_LEFT + 22, startY + 10, 3).fill("#F59E0B"); // Yellow
        doc.circle(PAGE_LEFT + 32, startY + 10, 3).fill("#10B981"); // Green

        // Language tag
        doc
          .font("Courier-Bold")
          .fontSize(7.5)
          .fillColor(COLORS.muted)
          .text(language, PAGE_LEFT, startY + 6.5, {
            width: CONTENT_WIDTH - 12,
            align: "right",
          });

        // Code content
        doc
          .font("Courier")
          .fontSize(8)
          .fillColor(COLORS.codeText)
          .text(block, PAGE_LEFT + 10, startY + headerHeight + 8, {
            width: CONTENT_WIDTH - 20,
            lineGap: 2,
          });

        doc.y = startY + boxHeight + 8;
      }

      if (item.explanation) {
        addParagraph(item.explanation);
      }
    };

    // --------------------------------------------------
    // STEP RENDERER
    // --------------------------------------------------

    const addSteps = (item) => {
      if (item.title) {
        addHeading(item.title, 2);
      }

      (item.items || []).forEach((step, index) => {
        const stepNum = typeof step === "object" && step !== null ? (step.step ?? index + 1) : index + 1;
        const stepTitle = typeof step === "string" ? step : (step?.title || `Step ${stepNum}`);
        const stepDesc = typeof step === "object" && step !== null ? (step?.description || "") : "";
        ensureSpace(45);

        const startY = doc.y;

        // Step circle badge
        doc
          .circle(PAGE_LEFT + 10, startY + 9, 8)
          .fill(COLORS.accent);

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(COLORS.white)
          .text(String(stepNum), PAGE_LEFT + 2, startY + 5.5, {
            width: 16,
            align: "center",
          });

        // Step title
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(COLORS.heading)
          .text(step.title || `Step ${stepNum}`, PAGE_LEFT + 26, startY + 3, {
            width: CONTENT_WIDTH - 26,
          });

        doc.y = startY + 22;

        if (step.description) {
          doc
            .font("Helvetica")
            .fontSize(9.5)
            .fillColor(COLORS.text)
            .text(step.description, PAGE_LEFT + 26, doc.y, {
              width: CONTENT_WIDTH - 26,
              lineGap: 3,
            });
          doc.moveDown(0.4);
        }
      });
    };

    // --------------------------------------------------
    // CONTENT RENDERER
    // --------------------------------------------------

    const renderContent = (content = []) => {
      if (!Array.isArray(content)) return;

      content.forEach((item) => {
        if (!item || typeof item !== "object") return;

        switch (item.type) {
          case "paragraph":
            addParagraph(item.text);
            break;

          case "subheading":
            addHeading(item.text, 2);
            break;

          case "bulletList":
            if (item.title) addHeading(item.title, 3);
            addBulletList(item.items);
            break;

          case "numberedList":
            if (item.title) addHeading(item.title, 3);
            addNumberedList(item.items);
            break;

          case "table":
            if (item.title) addHeading(item.title, 3);
            addTable(item);
            break;

          case "code":
            addCodeBlock(item);
            break;

          case "quote":
            addQuote(item);
            break;

          case "callout":
            addCallout(item);
            break;

          case "steps":
            addSteps(item);
            break;

          default:
            console.warn(`Unsupported PDF content type: ${item.type}`);
        }
      });
    };

    // --------------------------------------------------
    // COVER PAGE (EXECUTIVE DESIGN)
    // --------------------------------------------------

    const docTypeLabel = (data.documentType || "DOCUMENT").toUpperCase();

    // Top Brand Banner
    doc
      .rect(0, 0, doc.page.width, 140)
      .fill(COLORS.primary);

    // Accent Stripe
    doc
      .rect(0, 140, doc.page.width, 4)
      .fill(COLORS.accent);

    // Brand Label inside banner
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.white)
      .text("AGENTFLOW AI", PAGE_LEFT, 50, {
        characterSpacing: 2,
      });

    // Document Type Tag inside banner
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.accentLight)
      .text(`OFFICIAL ${docTypeLabel} PUBLICATION`, PAGE_LEFT, 72, {
        characterSpacing: 1,
      });

    // Title area
    doc.y = 200;

    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor(COLORS.heading)
      .text(data.title, PAGE_LEFT, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: 4,
      });

    // Accent Underline Bar
    doc.moveDown(0.4);
    doc
      .roundedRect(PAGE_LEFT, doc.y, 44, 3.5, 1.5)
      .fill(COLORS.accent);

    doc.moveDown(0.8);

    // Subtitle
    if (data.subtitle) {
      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor(COLORS.secondary)
        .text(data.subtitle, PAGE_LEFT, doc.y, {
          width: CONTENT_WIDTH,
          lineGap: 3,
        });
    }

    // Executive Metadata Card
    const cardY = 590;
    const cardHeight = 110;

    doc
      .roundedRect(PAGE_LEFT, cardY, CONTENT_WIDTH, cardHeight, 8)
      .lineWidth(1)
      .fillAndStroke(COLORS.surface, COLORS.border);

    const colW = CONTENT_WIDTH / 3;
    const padTop = cardY + 16;
    const author = data.metadata?.author || "AgentFlow AI Intelligence";
    const createdDate = data.metadata?.createdAt || new Date().toISOString().split("T")[0];
    const version = data.metadata?.version || "1.0";
    const language = data.language || "English";

    // Metadata Col 1
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text("AUTHOR & GENERATOR", PAGE_LEFT + 16, padTop, { characterSpacing: 0.5 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.heading)
      .text(author, PAGE_LEFT + 16, padTop + 14, { width: colW - 20 });
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.secondary)
      .text("AgentFlow AI Suite", PAGE_LEFT + 16, padTop + 30);

    // Metadata Col 2
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text("PUBLICATION DATE", PAGE_LEFT + colW + 10, padTop, { characterSpacing: 0.5 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.heading)
      .text(createdDate, PAGE_LEFT + colW + 10, padTop + 14);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.secondary)
      .text(`Status: Verified`, PAGE_LEFT + colW + 10, padTop + 30);

    // Metadata Col 3
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text("SPECIFICATIONS", PAGE_LEFT + colW * 2 + 10, padTop, { characterSpacing: 0.5 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.heading)
      .text(`Version ${version}`, PAGE_LEFT + colW * 2 + 10, padTop + 14);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.secondary)
      .text(`Language: ${language}`, PAGE_LEFT + colW * 2 + 10, padTop + 30);

    // Cover Page Bottom Notice
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(
        "CONFIDENTIAL & PROPRIETARY • GENERATED BY AGENTFLOW AI",
        PAGE_LEFT,
        760,
        {
          width: CONTENT_WIDTH,
          align: "center",
          characterSpacing: 1,
        },
      );

    // --------------------------------------------------
    // PAGE 2: TABLE OF CONTENTS & INTRODUCTION
    // --------------------------------------------------

    doc.addPage();

    // Table of contents
    if (data.tableOfContents?.length) {
      addHeading("Table of Contents", 1);

      data.tableOfContents.forEach((section, index) => {
        ensureSpace(22);

        const startY = doc.y;

        // Section badge pill
        const numLabel = String(index + 1).padStart(2, "0");
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(COLORS.accent)
          .text(numLabel, PAGE_LEFT + 2, startY, {
            width: 20,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(COLORS.heading)
          .text(section.title || "", PAGE_LEFT + 24, startY, {
            width: CONTENT_WIDTH - 24,
          });

        doc.y = doc.y + 2;

        (section.subsections || []).forEach((subsection) => {
          doc
            .font("Helvetica")
            .fontSize(8.5)
            .fillColor(COLORS.secondary)
            .text(`—  ${subsection.title || ""}`, PAGE_LEFT + 36, doc.y, {
              width: CONTENT_WIDTH - 36,
            });
          doc.y = doc.y + 2;
        });

        doc.moveDown(0.2);
      });

      doc.moveDown(0.8);
    }

    // Introduction
    if (data.introduction) {
      addHeading(data.introduction.heading || "Introduction", 1);
      (data.introduction.paragraphs || []).forEach(addParagraph);
      addBulletList(data.introduction.bulletPoints || []);
      doc.moveDown(0.6);
    }

    // --------------------------------------------------
    // MAIN SECTIONS (CONTINUOUS FLOW WITH INTELLIGENT SPACING)
    // --------------------------------------------------

    (data.sections || []).forEach((section) => {
      const hasContent = Array.isArray(section.content) && section.content.length > 0;
      if (!section.heading && !hasContent && !section.description) {
        return;
      }

      addHeading(section.heading || "Section", 1);

      if (section.description) {
        addParagraph(section.description);
      }

      renderContent(section.content || []);
      doc.moveDown(0.4);
    });

    // --------------------------------------------------
    // KEY TAKEAWAYS (HIGHLIGHTED EXECUTIVE BOX)
    // --------------------------------------------------

    if (data.keyTakeaways?.length) {
      ensureSpace(90);
      addHeading("Key Takeaways", 1);

      const boxStartY = doc.y;
      doc.moveDown(0.4);

      data.keyTakeaways.forEach((takeaway) => {
        const text =
          typeof takeaway === "string"
            ? takeaway
            : (takeaway?.text ?? takeaway?.description ?? "");

        if (!text) return;

        ensureSpace(20);
        const currentY = doc.y;

        // Checkmark circle badge
        doc
          .circle(PAGE_LEFT + 10, currentY + 6, 2.8)
          .fill(COLORS.accent);

        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(COLORS.text)
          .text(text, PAGE_LEFT + 22, currentY, {
            width: CONTENT_WIDTH - 22,
            lineGap: 3,
          });

        doc.moveDown(0.25);
      });

      doc.moveDown(0.6);
    }

    // --------------------------------------------------
    // CONCLUSION
    // --------------------------------------------------

    if (
      data.conclusion &&
      ((data.conclusion.paragraphs && data.conclusion.paragraphs.length > 0) ||
        (data.conclusion.bulletPoints && data.conclusion.bulletPoints.length > 0))
    ) {
      addHeading(data.conclusion.heading || "Conclusion", 1);
      (data.conclusion.paragraphs || []).forEach(addParagraph);
      addBulletList(data.conclusion.bulletPoints || []);
      doc.moveDown(0.4);
    }

    // --------------------------------------------------
    // REFERENCES
    // --------------------------------------------------

    const validReferences = (data.references || []).filter(
      (ref) => ref && (ref.title || ref.url),
    );

    if (validReferences.length > 0) {
      addHeading("References", 1);

      validReferences.forEach((reference, index) => {
        const title = reference.title || "Reference Source";
        const url = reference.url ? ` — ${reference.url}` : "";
        const accessedAt = reference.accessedAt
          ? ` (Accessed: ${reference.accessedAt})`
          : "";

        addParagraph(`${index + 1}. ${title}${url}${accessedAt}`);
      });
    }

    // --------------------------------------------------
    // RUNNING HEADERS & FOOTERS (PAGES 2+)
    // --------------------------------------------------

    const pageRange = doc.bufferedPageRange();
    const totalPages = pageRange.count;

    for (
      let index = pageRange.start + 1; // Skip cover page (index 0)
      index < pageRange.start + totalPages;
      index++
    ) {
      doc.switchToPage(index);

      // Save margins and temporarily zero them so running headers/footers outside
      // the content area never trigger PDFKit's automatic page break!
      const origMargins = {
        top: doc.page.margins.top,
        bottom: doc.page.margins.bottom,
        left: doc.page.margins.left,
        right: doc.page.margins.right,
      };

      doc.page.margins.top = 0;
      doc.page.margins.bottom = 0;
      doc.page.margins.left = 0;
      doc.page.margins.right = 0;

      // Top Running Header
      const headerY = 24;
      const cleanTitle = (data.title || "Document").slice(0, 50);

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(cleanTitle.toUpperCase(), PAGE_LEFT, headerY, {
          width: CONTENT_WIDTH - 100,
          align: "left",
          lineBreak: false,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(COLORS.accent)
        .text(docTypeLabel, PAGE_LEFT + CONTENT_WIDTH - 90, headerY, {
          width: 90,
          align: "right",
          lineBreak: false,
        });

      // Top Header Divider Line
      doc
        .rect(PAGE_LEFT, headerY + 12, CONTENT_WIDTH, 0.5)
        .fill(COLORS.borderLight);

      // Bottom Running Footer
      const footerY = doc.page.height - 35;

      // Bottom Footer Divider Line
      doc
        .rect(PAGE_LEFT, footerY - 8, CONTENT_WIDTH, 0.5)
        .fill(COLORS.border);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text("AgentFlow AI • Intelligent Document Platform", PAGE_LEFT, footerY, {
          width: CONTENT_WIDTH - 80,
          align: "left",
          lineBreak: false,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.secondary)
        .text(`Page ${index + 1} of ${totalPages}`, PAGE_LEFT + CONTENT_WIDTH - 70, footerY, {
          width: 70,
          align: "right",
          lineBreak: false,
        });

      // Restore original margins
      doc.page.margins.top = origMargins.top;
      doc.page.margins.bottom = origMargins.bottom;
      doc.page.margins.left = origMargins.left;
      doc.page.margins.right = origMargins.right;
    }

    // --------------------------------------------------
    // FINALIZE PDF
    // --------------------------------------------------

    doc.end();
  });
};

export default generatePDF;
