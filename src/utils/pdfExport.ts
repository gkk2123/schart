// src/utils/pdfExport.ts
import type { Guest, Table } from '../types';

// Declare globals provided by the script tags in index.html
declare const PDFLib: any;
declare const fontkit: any;

export const generateSeatingChartPDF = async (
  tables: Table[], 
  guestsById: Map<number, Guest>,
  onProgress?: (progress: number, message: string) => void
): Promise<Uint8Array> => {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  
  // Register fontkit instance to handle custom fonts.
  pdfDoc.registerFontkit(fontkit);

  // Report initial progress
  onProgress?.(10, 'Loading fonts...');

  // Fetch fonts that support a wide range of characters, including Korean.
  // Using Pretendard font from the jsDelivr NPM CDN, which is generally more reliable than the raw GitHub source.
  const fontUrl = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.6/dist/web/static/woff/Pretendard-Regular.woff';
  const fontBoldUrl = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.6/dist/web/static/woff/Pretendard-Bold.woff';
  
  let customFont, customBoldFont;
  let usingFallbackFont = false;

  try {
    const fontBytes = await fetch(fontUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
      return res.arrayBuffer();
    });
    const fontBoldBytes = await fetch(fontBoldUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch bold font: ${res.statusText}`);
      return res.arrayBuffer();
    });
    
    // Embed the fonts with subsetting to keep the file size small.
    customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    customBoldFont = await pdfDoc.embedFont(fontBoldBytes, { subset: true });
    onProgress?.(20, 'Fonts loaded successfully');
  } catch(e) {
    console.warn("Could not fetch custom fonts, falling back to standard fonts.", e);
    // Fallback to standard fonts if custom fonts fail to load
    try {
      customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      customBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      usingFallbackFont = true;
      onProgress?.(20, 'Using standard fonts');
    } catch(fallbackError) {
      console.error("Failed to load fallback fonts.", fallbackError);
      throw new Error("Failed to load fonts for PDF generation. Please try again.");
    }
  }
  
  const pageMargin = 50;
  const guestNameSize = 8;
  const seatNumberSize = 10;
  const seatRadius = 20;

  for (const table of tables) {
    const page = pdfDoc.addPage();
    const { width: pageWidth, height: pageHeight } = page.getSize();
    let y = pageHeight - pageMargin;

    // Draw Table Name using the embedded bold font
    page.drawText(table.name, {
      x: pageMargin,
      y: y,
      font: customBoldFont,
      size: 24,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    y -= 50;

    const layoutCenterX = pageWidth / 2;
    const layoutCenterY = y - 250;

    // --- Draw Table Layout ---

    if (table.shape === 'Circle') {
      const tableRadius = Math.max(60, table.capacity * 9);
      
      // Draw central table
      page.drawCircle({
        x: layoutCenterX,
        y: layoutCenterY,
        size: tableRadius,
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 2,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Draw seats
      table.seats.forEach((seat, index) => {
        const angle = (index / table.capacity) * 2 * Math.PI - Math.PI / 2;
        const seatX = layoutCenterX + (tableRadius + seatRadius + 5) * Math.cos(angle);
        const seatY = layoutCenterY + (tableRadius + seatRadius + 5) * Math.sin(angle);
        
        const guest = seat.guestId ? guestsById.get(seat.guestId) : null;
        
        page.drawCircle({
            x: seatX,
            y: seatY,
            size: seatRadius,
            borderColor: rgb(0.4, 0.4, 0.4),
            borderWidth: 1.5,
            color: guest ? rgb(0.8, 0.9, 1) : rgb(0.9, 0.9, 0.9),
        });
        
        const text = guest ? guest.name : (index + 1).toString();
        // Use the appropriate embedded font
        const font = guest ? customFont : customBoldFont;
        const size = guest ? guestNameSize : seatNumberSize;

        // Truncate long names
        let truncatedText = text;
        let textWidth = font.widthOfTextAtSize(truncatedText, size);
        while (textWidth > (seatRadius * 2 - 8) && truncatedText.length > 5) {
            truncatedText = truncatedText.slice(0, -2) + '…';
            textWidth = font.widthOfTextAtSize(truncatedText, size);
        }

        page.drawText(truncatedText, {
            x: seatX - textWidth / 2,
            y: seatY - size / 2,
            font,
            size,
            color: rgb(0.1, 0.1, 0.1),
        });
      });

    } else { // Rectangle
      const seatsPerSide = Math.ceil(table.capacity / 2);
      const tableWidth = seatsPerSide * (seatRadius * 2 + 10) + 10;
      const tableHeight = seatRadius * 2 + 60;

      // Draw central table
      page.drawRectangle({
        x: layoutCenterX - tableWidth / 2,
        y: layoutCenterY - tableHeight / 2,
        width: tableWidth,
        height: tableHeight,
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 2,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Draw seats
      table.seats.forEach((seat, index) => {
        const isTopRow = index < seatsPerSide;
        const indexInRow = isTopRow ? index : index - seatsPerSide;
        
        const startX = layoutCenterX - tableWidth / 2 + seatRadius + 10;
        const seatX = startX + indexInRow * (seatRadius * 2 + 10);
        const seatY = isTopRow 
            ? layoutCenterY + tableHeight / 2 + seatRadius + 5 
            : layoutCenterY - tableHeight / 2 - seatRadius - 5;
            
        const guest = seat.guestId ? guestsById.get(seat.guestId) : null;

        page.drawCircle({
            x: seatX,
            y: seatY,
            size: seatRadius,
            borderColor: rgb(0.4, 0.4, 0.4),
            borderWidth: 1.5,
            color: guest ? rgb(0.8, 0.9, 1) : rgb(0.9, 0.9, 0.9),
        });

        const text = guest ? guest.name : (index + 1).toString();
        // Use the appropriate embedded font
        const font = guest ? customFont : customBoldFont;
        const size = guest ? guestNameSize : seatNumberSize;
        
        let truncatedText = text;
        let textWidth = font.widthOfTextAtSize(truncatedText, size);
        while (textWidth > (seatRadius * 2 - 8) && truncatedText.length > 5) {
            truncatedText = truncatedText.slice(0, -2) + '…';
            textWidth = font.widthOfTextAtSize(truncatedText, size);
        }

        page.drawText(truncatedText, {
            x: seatX - textWidth / 2,
            y: seatY - size / 2,
            font,
            size,
            color: rgb(0.1, 0.1, 0.1),
        });
      });
    }
  }

  return pdfDoc.save();
};