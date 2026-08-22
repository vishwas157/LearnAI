const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extracts raw and formatted text from uploaded PDF buffer or file path
 * @param {string|Buffer} source 
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
const extractTextFromPDF = async (source) => {
  try {
    let dataBuffer;
    if (typeof source === 'string') {
      dataBuffer = fs.readFileSync(source);
    } else {
      dataBuffer = source;
    }

    const data = await pdfParse(dataBuffer);
    
    // Clean up extracted text (normalize whitespace, trim empty lines)
    const cleanedText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      text: cleanedText,
      numPages: data.numpages || 1,
      info: data.info || {},
    };
  } catch (error) {
    console.error('PDF Parse Error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

module.exports = { extractTextFromPDF };
