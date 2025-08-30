import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportSnapshot(element, {
  fileName = "monitoring.pdf",
  orientation = "p", // 'p' | 'l'
  scale = 2,
} = {}) {
  if (!element) throw new Error("Element to export is missing");

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: getComputedStyle(document.body).getPropertyValue("--tw-bg-opacity") ? undefined : "#ffffff",
    windowWidth: document.documentElement.scrollWidth,
  });
  const imgData = canvas.toDataURL("image/png");

  const pageOrientation = orientation;
  const pdf = new jsPDF({ orientation: pageOrientation, unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
  } else {
    // Slice canvas into pages
    const pageHeightPx = Math.floor((canvas.width * pageHeight) / pageWidth); // page height in original px
    let rendered = 0;
    while (rendered < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - rendered);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        rendered,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );
      const sliceImg = sliceCanvas.toDataURL("image/png");
      const sliceHeightPt = (sliceHeight * imgWidth) / canvas.width;
      if (rendered === 0) {
        pdf.addImage(sliceImg, "PNG", 0, 0, imgWidth, sliceHeightPt, undefined, "FAST");
      } else {
        pdf.addPage();
        pdf.addImage(sliceImg, "PNG", 0, 0, imgWidth, sliceHeightPt, undefined, "FAST");
      }
      rendered += sliceHeight;
    }
  }

  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}

