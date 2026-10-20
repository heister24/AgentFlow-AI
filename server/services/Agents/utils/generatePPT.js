import PptxGenJS from "pptxgenjs";

/**
 * Sanitizes and strips invalid chars
 */
const sanitizeText = (val, fallback = "") => {
  if (val === undefined || val === null) return fallback;
  if (typeof val !== "string") return String(val);
  return val.trim();
};

/**
 * Normalizes hex colors without '#'
 */
const cleanHex = (color, fallback = "6366F1") => {
  if (!color || typeof color !== "string") return fallback;
  const cleaned = color.replace(/^#/, "").trim();
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) return cleaned.toUpperCase();
  if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
    return cleaned
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase();
  }
  return fallback;
};

/**
 * Generates an executive, professional PowerPoint presentation (.pptx)
 * returning a Promise resolving to a Node Buffer.
 */
export const generatePPT = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid presentation data: object expected.");
  }

  const presentation = data.presentation || data.data?.presentation || data;
  const pres = new PptxGenJS();

  // Standard 16:9 widescreen layout
  pres.layout = "LAYOUT_16x9";

  const title = sanitizeText(presentation.title, "Executive Presentation");
  const subtitle = sanitizeText(presentation.subtitle, "");
  const author = sanitizeText(presentation.metadata?.author, "AgentFlow AI");
  const presentationType = sanitizeText(
    presentation.presentationType,
    "Executive Overview",
  );

  pres.title = title;
  pres.subject = subtitle || presentationType;
  pres.author = author;
  pres.company = "AgentFlow AI";

  // Color Palette & Design Theme
  const isLightTheme =
    presentation.designGuidelines?.theme?.toLowerCase() === "light";
  const customPalette = Array.isArray(presentation.designGuidelines?.colorPalette)
    ? presentation.designGuidelines.colorPalette
    : [];

  const palette = {
    bg: isLightTheme ? "F8FAFC" : "0F172A",
    surface: isLightTheme ? "FFFFFF" : "1E293B",
    surfaceLight: isLightTheme ? "F1F5F9" : "334155",
    textPrimary: isLightTheme ? "0F172A" : "F8FAFC",
    textSecondary: isLightTheme ? "475569" : "94A3B8",
    accent: cleanHex(customPalette[0], isLightTheme ? "4F46E5" : "6366F1"),
    accentSecondary: cleanHex(customPalette[1], isLightTheme ? "0284C7" : "38BDF8"),
    accentWarm: cleanHex(customPalette[2], "F59E0B"),
    border: isLightTheme ? "E2E8F0" : "334155",
    codeBg: isLightTheme ? "1E293B" : "090D16",
    white: "FFFFFF",
  };

  const slides = Array.isArray(presentation.slides) ? presentation.slides : [];
  const totalSlides = slides.length || 1;

  // -------------------------------------------------------------
  // SLIDE 1: COVER / TITLE SLIDE
  // -------------------------------------------------------------
  const coverSlide = pres.addSlide();
  coverSlide.background = { color: palette.bg };

  // Decorative accent bar
  coverSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.2,
    w: 0.12,
    h: 3.2,
    fill: { color: palette.accent },
    line: { color: palette.accent },
  });

  // Presentation Category Pill
  coverSlide.addText(presentationType.toUpperCase(), {
    x: 1.1,
    y: 1.2,
    w: 4.0,
    h: 0.35,
    fontSize: 10,
    bold: true,
    color: palette.accentSecondary,
    charSpacing: 2,
  });

  // Title
  coverSlide.addText(title, {
    x: 1.1,
    y: 1.65,
    w: 8.0,
    h: 1.5,
    fontSize: 34,
    bold: true,
    color: palette.textPrimary,
    valign: "top",
    wrap: true,
  });

  // Subtitle
  if (subtitle) {
    coverSlide.addText(subtitle, {
      x: 1.1,
      y: 3.15,
      w: 8.0,
      h: 0.7,
      fontSize: 16,
      color: palette.textSecondary,
      valign: "top",
      wrap: true,
    });
  }

  // Cover Slide Footer Card
  coverSlide.addShape(pres.ShapeType.roundRect, {
    x: 1.1,
    y: 4.3,
    w: 8.0,
    h: 0.55,
    rectRadius: 0.08,
    fill: { color: palette.surface },
    line: { color: palette.border, width: 1 },
  });

  const durationText = presentation.overview?.estimatedDuration
    ? ` • ${presentation.overview.estimatedDuration}`
    : "";
  const audienceText = presentation.overview?.targetAudience
    ? ` • For: ${presentation.overview.targetAudience}`
    : "";

  coverSlide.addText(
    `Prepared by ${author}${durationText}${audienceText} • AgentFlow AI`,
    {
      x: 1.3,
      y: 4.4,
      w: 7.6,
      h: 0.35,
      fontSize: 10,
      color: palette.textSecondary,
      valign: "middle",
    },
  );

  // -------------------------------------------------------------
  // SLIDE 2: AGENDA / TABLE OF CONTENTS (if available)
  // -------------------------------------------------------------
  const toc = Array.isArray(presentation.tableOfContents)
    ? presentation.tableOfContents
    : [];
  if (toc.length > 0 && !slides.some((s) => s.type === "agenda")) {
    const agendaSlide = pres.addSlide();
    agendaSlide.background = { color: palette.bg };

    // Header
    agendaSlide.addText("AGENDA", {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: palette.accentSecondary,
      charSpacing: 2,
    });

    agendaSlide.addText("Table of Contents", {
      x: 0.8,
      y: 0.75,
      w: 8.4,
      h: 0.45,
      fontSize: 24,
      bold: true,
      color: palette.textPrimary,
    });

    agendaSlide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.3,
      w: 8.4,
      h: 0,
      line: { color: palette.border, width: 1 },
    });

    // Render TOC Grid (2 columns)
    const tocItems = toc.slice(0, 8);
    tocItems.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.8 + col * 4.3;
      const cardY = 1.55 + row * 0.85;

      agendaSlide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: cardY,
        w: 4.1,
        h: 0.7,
        rectRadius: 0.08,
        fill: { color: palette.surface },
        line: { color: palette.border, width: 1 },
      });

      // Number badge
      agendaSlide.addText(String(idx + 1).padStart(2, "0"), {
        x: cardX + 0.15,
        y: cardY + 0.15,
        w: 0.45,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: palette.accent,
        align: "center",
        valign: "middle",
      });

      // Agenda title
      const itemTitle = sanitizeText(item.title || item.section, `Topic ${idx + 1}`);
      agendaSlide.addText(itemTitle, {
        x: cardX + 0.7,
        y: cardY + 0.15,
        w: 3.25,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: palette.textPrimary,
        valign: "middle",
      });
    });

    agendaSlide.addText("AgentFlow AI • Presentation Structure", {
      x: 0.8,
      y: 5.15,
      w: 8.4,
      h: 0.3,
      fontSize: 9,
      color: palette.textSecondary,
    });
  }

  // -------------------------------------------------------------
  // CONTENT SLIDES
  // -------------------------------------------------------------
  slides.forEach((slideData, idx) => {
    const slideNumber = slideData.slideNumber || idx + 1;
    // Skip if it's explicitly title slide and we already rendered cover
    if (slideData.type === "title" && idx === 0) return;

    const slide = pres.addSlide();
    slide.background = { color: palette.bg };

    // Speaker Notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }

    // Header Kicker / Section
    const sectionName = sanitizeText(
      slideData.section || presentationType,
      "AGENTFLOW AI",
    );
    slide.addText(sectionName.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 8.4,
      h: 0.22,
      fontSize: 9,
      bold: true,
      color: palette.accentSecondary,
      charSpacing: 2,
    });

    // Slide Title
    const slideTitle = sanitizeText(slideData.title, `Slide ${slideNumber}`);
    slide.addText(slideTitle, {
      x: 0.8,
      y: 0.68,
      w: 8.4,
      h: 0.45,
      fontSize: 22,
      bold: true,
      color: palette.textPrimary,
    });

    // Subtitle / Key Message Kicker
    const keyMessage = sanitizeText(
      slideData.subtitle || slideData.keyMessage || "",
    );
    if (keyMessage) {
      slide.addText(keyMessage, {
        x: 0.8,
        y: 1.15,
        w: 8.4,
        h: 0.25,
        fontSize: 11,
        italic: true,
        color: palette.textSecondary,
      });
    }

    // Divider Line
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: keyMessage ? 1.45 : 1.25,
      w: 8.4,
      h: 0,
      line: { color: palette.border, width: 1 },
    });

    const contentStartY = keyMessage ? 1.6 : 1.4;
    const contentItems = Array.isArray(slideData.content) ? slideData.content : [];

    // Check if right column element exists
    const hasChart =
      slideData.chartData &&
      slideData.chartData.chartType &&
      slideData.chartData.chartType !== "none" &&
      Array.isArray(slideData.chartData.series) &&
      slideData.chartData.series.length > 0 &&
      slideData.chartData.series[0].data &&
      slideData.chartData.series[0].data.length > 0;

    const tableItem = contentItems.find((c) => c.type === "table" && Array.isArray(c.rows) && c.rows.length > 0);
    const codeItem = contentItems.find((c) => c.type === "code" && c.code);
    const calloutItem = contentItems.find((c) => c.type === "callout" && c.text);
    const visualItem = Array.isArray(slideData.visuals)
      ? slideData.visuals.find((v) => v.type && v.type !== "none")
      : null;

    const hasRightColumn = hasChart || tableItem || codeItem || calloutItem || visualItem;

    const leftColW = hasRightColumn ? 4.9 : 8.4;
    const rightColX = 6.0;
    const rightColW = 3.2;

    // -----------------------------------------
    // Render Left Column / Main Content
    // -----------------------------------------
    let currentY = contentStartY;

    contentItems.forEach((item) => {
      if (currentY >= 4.8) return; // avoid overflowing into footer

      if (item.type === "paragraph" && item.text) {
        slide.addText(item.text, {
          x: 0.8,
          y: currentY,
          w: leftColW,
          h: 0.6,
          fontSize: 12,
          color: palette.textPrimary,
          lineSpacingMultiple: 1.2,
          wrap: true,
        });
        currentY += 0.7;
      } else if (item.type === "bulletList" && Array.isArray(item.items)) {
        if (item.title) {
          slide.addText(item.title, {
            x: 0.8,
            y: currentY,
            w: leftColW,
            h: 0.3,
            fontSize: 13,
            bold: true,
            color: palette.accent,
          });
          currentY += 0.35;
        }

        const bulletTexts = item.items
          .filter(Boolean)
          .slice(0, 6)
          .map((pt) => {
            const str = typeof pt === "string" ? pt : pt.text || JSON.stringify(pt);
            return {
              text: str,
              options: {
                bullet: true,
                color: palette.textPrimary,
                fontSize: 11,
                lineSpacingMultiple: 1.25,
              },
            };
          });

        if (bulletTexts.length > 0) {
          const estimatedH = Math.min(2.2, bulletTexts.length * 0.4);
          slide.addText(bulletTexts, {
            x: 0.8,
            y: currentY,
            w: leftColW,
            h: estimatedH,
            wrap: true,
          });
          currentY += estimatedH + 0.15;
        }
      } else if (item.type === "numberedList" && Array.isArray(item.items)) {
        const numberedTexts = item.items
          .filter(Boolean)
          .slice(0, 5)
          .map((pt, i) => {
            const str = typeof pt === "string" ? pt : pt.text || "";
            return {
              text: `${i + 1}. ${str}\n`,
              options: {
                color: palette.textPrimary,
                fontSize: 11,
                lineSpacingMultiple: 1.2,
              },
            };
          });

        if (numberedTexts.length > 0) {
          const estimatedH = Math.min(2.0, numberedTexts.length * 0.38);
          slide.addText(numberedTexts, {
            x: 0.8,
            y: currentY,
            w: leftColW,
            h: estimatedH,
            wrap: true,
          });
          currentY += estimatedH + 0.15;
        }
      } else if (item.type === "steps" && Array.isArray(item.items)) {
        const stepItems = item.items.slice(0, 4);
        stepItems.forEach((st, sIdx) => {
          if (currentY >= 4.8) return;
          const sNum = st.step || sIdx + 1;
          const sTitle = sanitizeText(st.title, `Step ${sNum}`);
          const sDesc = sanitizeText(st.description, "");

          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.8,
            y: currentY,
            w: leftColW,
            h: 0.55,
            rectRadius: 0.06,
            fill: { color: palette.surface },
            line: { color: palette.border, width: 1 },
          });

          slide.addText(String(sNum), {
            x: 0.9,
            y: currentY + 0.1,
            w: 0.35,
            h: 0.35,
            fontSize: 12,
            bold: true,
            color: palette.accent,
            align: "center",
            valign: "middle",
          });

          slide.addText(`${sTitle}: ${sDesc}`, {
            x: 1.35,
            y: currentY + 0.08,
            w: leftColW - 0.65,
            h: 0.4,
            fontSize: 10.5,
            color: palette.textPrimary,
            valign: "middle",
            wrap: true,
          });

          currentY += 0.65;
        });
      } else if (item.type === "quote" && item.text) {
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8,
          y: currentY,
          w: 0.08,
          h: 0.7,
          fill: { color: palette.accentWarm },
        });

        slide.addText(`“${item.text}”${item.attribution ? `\n— ${item.attribution}` : ""}`, {
          x: 1.0,
          y: currentY,
          w: leftColW - 0.2,
          h: 0.7,
          fontSize: 11.5,
          italic: true,
          color: palette.textPrimary,
          wrap: true,
        });
        currentY += 0.8;
      }
    });

    // -----------------------------------------
    // Render Right Column (Visual / Chart / Table / Callout / Code)
    // -----------------------------------------
    if (hasRightColumn) {
      const rightBoxY = contentStartY;

      if (hasChart) {
        try {
          const chartTypeStr = slideData.chartData.chartType.toLowerCase();
          const validChartType =
            pres.ChartType[chartTypeStr] || pres.ChartType.bar;

          const chartDataSeries = slideData.chartData.series.map((s) => ({
            name: s.name || "Metric",
            labels: slideData.chartData.categories || [],
            values: s.data || [],
          }));

          slide.addChart(validChartType, chartDataSeries, {
            x: rightColX,
            y: rightBoxY,
            w: rightColW,
            h: 2.7,
            title: slideData.chartData.title || "Data Analysis",
            titleFontSize: 11,
            titleColor: palette.textPrimary,
            legendPos: "b",
            legendColor: palette.textSecondary,
            legendFontSize: 9,
          });

          if (slideData.chartData.insight) {
            slide.addShape(pres.ShapeType.roundRect, {
              x: rightColX,
              y: rightBoxY + 2.75,
              w: rightColW,
              h: 0.55,
              rectRadius: 0.06,
              fill: { color: palette.surface },
              line: { color: palette.border, width: 1 },
            });

            slide.addText(`💡 ${slideData.chartData.insight}`, {
              x: rightColX + 0.1,
              y: rightBoxY + 2.78,
              w: rightColW - 0.2,
              h: 0.48,
              fontSize: 9.5,
              color: palette.accentWarm,
              wrap: true,
            });
          }
        } catch (chartErr) {
          console.warn("Could not add native chart:", chartErr.message);
        }
      } else if (tableItem) {
        // Table layout
        const headers = Array.isArray(tableItem.columns)
          ? tableItem.columns.map((c) => ({
              text: sanitizeText(c, "Col"),
              options: {
                bold: true,
                color: palette.white,
                fill: { color: palette.accent },
                fontSize: 10,
                align: "center",
              },
            }))
          : [];

        const rows = (tableItem.rows || []).slice(0, 5).map((r, rIdx) => {
          const rowVals = Array.isArray(r) ? r : Object.values(r);
          return rowVals.map((cell) => ({
            text: sanitizeText(cell, ""),
            options: {
              color: palette.textPrimary,
              fill: { color: rIdx % 2 === 0 ? palette.surface : palette.surfaceLight },
              fontSize: 9.5,
              align: "left",
            },
          }));
        });

        const tableData = [headers, ...rows].filter((row) => row.length > 0);
        if (tableData.length > 0) {
          slide.addTable(tableData, {
            x: rightColX,
            y: rightBoxY,
            w: rightColW,
            colW: headers.length > 0 ? rightColW / headers.length : undefined,
            border: { color: palette.border, pt: 1 },
          });
        }
      } else if (codeItem) {
        // Code Block
        slide.addShape(pres.ShapeType.roundRect, {
          x: rightColX,
          y: rightBoxY,
          w: rightColW,
          h: 2.8,
          rectRadius: 0.08,
          fill: { color: palette.codeBg },
          line: { color: palette.border, width: 1 },
        });

        if (codeItem.title || codeItem.language) {
          slide.addText(
            `${codeItem.language ? `[${codeItem.language.toUpperCase()}] ` : ""}${codeItem.title || "Code Sample"}`,
            {
              x: rightColX + 0.15,
              y: rightBoxY + 0.1,
              w: rightColW - 0.3,
              h: 0.25,
              fontSize: 9,
              bold: true,
              color: palette.accentSecondary,
            },
          );
        }

        slide.addText(codeItem.code, {
          x: rightColX + 0.15,
          y: rightBoxY + 0.35,
          w: rightColW - 0.3,
          h: 2.3,
          fontFace: "Courier New",
          fontSize: 9,
          color: "E2E8F0",
          valign: "top",
          wrap: true,
        });
      } else if (calloutItem) {
        // Callout card
        slide.addShape(pres.ShapeType.roundRect, {
          x: rightColX,
          y: rightBoxY,
          w: rightColW,
          h: 2.2,
          rectRadius: 0.08,
          fill: { color: palette.surface },
          line: { color: palette.accentWarm, width: 1.5 },
        });

        slide.addText(calloutItem.title || "Key Takeaway", {
          x: rightColX + 0.2,
          y: rightBoxY + 0.15,
          w: rightColW - 0.4,
          h: 0.3,
          fontSize: 12,
          bold: true,
          color: palette.accentWarm,
        });

        slide.addText(calloutItem.text, {
          x: rightColX + 0.2,
          y: rightBoxY + 0.5,
          w: rightColW - 0.4,
          h: 1.5,
          fontSize: 10.5,
          color: palette.textPrimary,
          wrap: true,
        });
      } else if (visualItem) {
        // Visual Recommendation Card
        slide.addShape(pres.ShapeType.roundRect, {
          x: rightColX,
          y: rightBoxY,
          w: rightColW,
          h: 2.5,
          rectRadius: 0.08,
          fill: { color: palette.surface },
          line: { color: palette.border, width: 1 },
        });

        slide.addText(`VISUAL CONCEPT: ${visualItem.type.toUpperCase()}`, {
          x: rightColX + 0.2,
          y: rightBoxY + 0.15,
          w: rightColW - 0.4,
          h: 0.25,
          fontSize: 9,
          bold: true,
          color: palette.accentSecondary,
        });

        slide.addText(visualItem.title || "Visual Element", {
          x: rightColX + 0.2,
          y: rightBoxY + 0.4,
          w: rightColW - 0.4,
          h: 0.3,
          fontSize: 11,
          bold: true,
          color: palette.textPrimary,
        });

        const desc = visualItem.description || visualItem.purpose || visualItem.imagePrompt || "";
        slide.addText(desc, {
          x: rightColX + 0.2,
          y: rightBoxY + 0.75,
          w: rightColW - 0.4,
          h: 1.5,
          fontSize: 9.5,
          color: palette.textSecondary,
          wrap: true,
        });
      }
    }

    // Footer on content slide
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 5.0,
      w: 8.4,
      h: 0,
      line: { color: palette.border, width: 0.5 },
    });

    slide.addText(`${title} • AgentFlow AI`, {
      x: 0.8,
      y: 5.1,
      w: 6.0,
      h: 0.3,
      fontSize: 8.5,
      color: palette.textSecondary,
    });

    slide.addText(`Slide ${slideNumber} of ${totalSlides}`, {
      x: 7.2,
      y: 5.1,
      w: 2.0,
      h: 0.3,
      fontSize: 8.5,
      color: palette.textSecondary,
      align: "right",
    });
  });

  // -------------------------------------------------------------
  // SLIDE: CONCLUSION & NEXT STEPS (if provided)
  // -------------------------------------------------------------
  if (presentation.conclusion) {
    const conclusionSlide = pres.addSlide();
    conclusionSlide.background = { color: palette.bg };

    conclusionSlide.addText("CONCLUSION", {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: palette.accentSecondary,
      charSpacing: 2,
    });

    conclusionSlide.addText(
      sanitizeText(presentation.conclusion.heading, "Summary & Key Takeaways"),
      {
        x: 0.8,
        y: 0.75,
        w: 8.4,
        h: 0.45,
        fontSize: 24,
        bold: true,
        color: palette.textPrimary,
      },
    );

    conclusionSlide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.3,
      w: 8.4,
      h: 0,
      line: { color: palette.border, width: 1 },
    });

    if (presentation.conclusion.summary) {
      conclusionSlide.addText(presentation.conclusion.summary, {
        x: 0.8,
        y: 1.5,
        w: 8.4,
        h: 0.6,
        fontSize: 12,
        color: palette.textPrimary,
        wrap: true,
      });
    }

    const takeaways = Array.isArray(presentation.conclusion.keyTakeaways)
      ? presentation.conclusion.keyTakeaways
      : [];

    const startY = presentation.conclusion.summary ? 2.2 : 1.6;
    takeaways.slice(0, 4).forEach((tw, idx) => {
      const cardY = startY + idx * 0.65;
      conclusionSlide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: cardY,
        w: 8.4,
        h: 0.55,
        rectRadius: 0.08,
        fill: { color: palette.surface },
        line: { color: palette.border, width: 1 },
      });

      conclusionSlide.addText(`✓  ${sanitizeText(tw)}`, {
        x: 1.0,
        y: cardY + 0.1,
        w: 8.0,
        h: 0.35,
        fontSize: 11,
        bold: true,
        color: palette.textPrimary,
        valign: "middle",
      });
    });

    if (presentation.conclusion.callToAction) {
      const ctaY = startY + Math.min(takeaways.length, 4) * 0.65 + 0.15;
      if (ctaY <= 4.4) {
        conclusionSlide.addShape(pres.ShapeType.roundRect, {
          x: 0.8,
          y: ctaY,
          w: 8.4,
          h: 0.55,
          rectRadius: 0.08,
          fill: { color: palette.accent },
        });

        conclusionSlide.addText(`🚀 ${presentation.conclusion.callToAction}`, {
          x: 1.0,
          y: ctaY + 0.1,
          w: 8.0,
          h: 0.35,
          fontSize: 11.5,
          bold: true,
          color: palette.white,
          valign: "middle",
        });
      }
    }
  }

  // Return generated PowerPoint as Node.js Buffer
  const buffer = await pres.write({ outputType: "nodebuffer" });
  return buffer;
};

export default generatePPT;
