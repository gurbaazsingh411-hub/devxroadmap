import type { RoadmapResult } from "@/types/roadmap";
import jsPDF from "jspdf";

export function exportAsMarkdown(result: RoadmapResult): string {
  let md = `# ${result.projectName}\n\n`;
  md += `**Difficulty:** ${result.difficulty}  \n`;
  md += `**Estimated Time:** ${result.estimatedTime}\n\n`;

  md += `## Required Skills\n\n`;
  md += result.skills.map((s) => `- ${s}`).join("\n") + "\n\n";

  md += `## Learning Roadmap\n\n`;
  result.roadmap.forEach((step) => {
    md += `### ${step.step}. ${step.title}\n\n${step.description}\n`;
    if (step.resources?.length) {
      md += "\n**Resources:**\n" + step.resources.map((r) => `- ${r}`).join("\n") + "\n";
    }
    md += "\n";
  });

  md += `## Tech Stack Options\n\n`;
  result.techStack.forEach((stack, i) => {
    md += `**Option ${i + 1}: ${stack.name}**  \n`;
    md += stack.tools.join(", ") + "\n\n";
  });

  md += `## Architecture\n\n`;
  md += result.architecture.map((l) => `- ${l}`).join("\n") + "\n";

  return md;
}

export function downloadMarkdown(result: RoadmapResult) {
  const md = exportAsMarkdown(result);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${result.projectName.replace(/\s+/g, "-").toLowerCase()}-roadmap.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPDF(result: RoadmapResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(result.projectName, margin, y);
  y += 10;

  // Difficulty & Time
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${result.difficulty}  •  ${result.estimatedTime}`, margin, y);
  y += 12;
  doc.setTextColor(0);

  // Skills
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Required Skills", margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const skillText = result.skills.join("  •  ");
  const skillLines = doc.splitTextToSize(skillText, maxWidth);
  checkPage(skillLines.length * 5 + 5);
  doc.text(skillLines, margin, y);
  y += skillLines.length * 5 + 8;

  // Roadmap
  checkPage(12);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Learning Roadmap", margin, y);
  y += 8;

  result.roadmap.forEach((step) => {
    checkPage(20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${step.step}. ${step.title}`, margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const descLines = doc.splitTextToSize(step.description, maxWidth - 5);
    checkPage(descLines.length * 4 + 4);
    doc.text(descLines, margin + 5, y);
    y += descLines.length * 4 + 2;

    if (step.resources?.length) {
      doc.setTextColor(60, 60, 200);
      step.resources.forEach((r) => {
        checkPage(5);
        doc.text(`→ ${r}`, margin + 5, y);
        y += 4;
      });
    }
    doc.setTextColor(0);
    y += 4;
  });

  // Tech Stack
  checkPage(12);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Tech Stack", margin, y);
  y += 8;

  result.techStack.forEach((stack, i) => {
    checkPage(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Option ${i + 1}: ${stack.name}`, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const toolLines = doc.splitTextToSize(stack.tools.join(", "), maxWidth);
    checkPage(toolLines.length * 4 + 4);
    doc.text(toolLines, margin + 5, y);
    y += toolLines.length * 4 + 6;
  });

  // Architecture
  checkPage(12);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Architecture", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.architecture.forEach((layer) => {
    checkPage(6);
    doc.text(`•  ${layer}`, margin, y);
    y += 5;
  });

  doc.save(`${result.projectName.replace(/\s+/g, "-").toLowerCase()}-roadmap.pdf`);
}
