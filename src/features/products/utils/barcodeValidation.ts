export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateBarcode(code: string, format: string): ValidationResult {
  // Remove any whitespace
  code = code.trim();

  // Basic format-specific validation
  switch (format) {
    case 'EAN13':
      if (!/^\d{13}$/.test(code)) {
        return { isValid: false, error: 'EAN-13 must be exactly 13 digits' };
      }
      return { isValid: validateEAN13Checksum(code), error: 'Invalid EAN-13 checksum' };

    case 'UPCA':
      if (!/^\d{12}$/.test(code)) {
        return { isValid: false, error: 'UPC-A must be exactly 12 digits' };
      }
      return { isValid: validateUPCAChecksum(code), error: 'Invalid UPC-A checksum' };

    case 'CODE39':
      if (!/^[A-Z0-9-. $/+%]*$/.test(code)) {
        return { isValid: false, error: 'Invalid characters in Code 39' };
      }
      if (code.length < 1 || code.length > 43) {
        return { isValid: false, error: 'Code 39 length must be between 1 and 43 characters' };
      }
      return { isValid: true };

    case 'CODE128':
      if (code.length < 1) {
        return { isValid: false, error: 'Code 128 must not be empty' };
      }
      if (code.length > 48) {
        return { isValid: false, error: 'Code 128 length must not exceed 48 characters' };
      }
      // Check for valid ASCII characters (0-127)
      if (!/^[\x00-\x7F]*$/.test(code)) {
        return { isValid: false, error: 'Code 128 must only contain ASCII characters' };
      }
      return { isValid: true };

    case 'QR':
      if (code.length < 1) {
        return { isValid: false, error: 'QR Code must not be empty' };
      }
      if (code.length > 2953) {
        return { isValid: false, error: 'QR Code content too long' };
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

// EAN-13 checksum validation
function validateEAN13Checksum(code: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(code[12]);
}

// UPC-A checksum validation
function validateUPCAChecksum(code: string): boolean {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(code[11]);
}

// Generate checksum for various formats
export function generateChecksum(code: string, format: string): string {
  switch (format) {
    case 'EAN13':
      if (code.length === 12 && /^\d+$/.test(code)) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checksum = (10 - (sum % 10)) % 10;
        return code + checksum;
      }
      return code;

    case 'UPCA':
      if (code.length === 11 && /^\d+$/.test(code)) {
        let sum = 0;
        for (let i = 0; i < 11; i++) {
          sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
        }
        const checksum = (10 - (sum % 10)) % 10;
        return code + checksum;
      }
      return code;

    default:
      return code;
  }
}

/**
 * Generate a barcode based on the provided prefix, format, and options
 * @param prefix The prefix to use for the barcode (e.g., product SKU)
 * @param format The barcode format (EAN13, UPCA, CODE39, CODE128, QR)
 * @param options Additional options for barcode generation
 * @returns The generated barcode string
 */
export function generateBarcode(
  prefix: string,
  format: string,
  options: {
    sequence?: number;
    addChecksum?: boolean;
    randomize?: boolean;
    length?: number;
  } = {}
): string {
  const {
    sequence = 1,
    addChecksum = true,
    randomize = false,
    length = 12
  } = options;

  // Format the sequence number with leading zeros
  const sequenceStr = sequence.toString().padStart(4, '0');
  
  // Create the base code
  let code = `${prefix}${randomize ? Math.floor(Math.random() * 10000).toString().padStart(4, '0') : sequenceStr}`;
  
  // Adjust length based on format requirements
  switch (format) {
    case 'EAN13':
      // EAN13 needs to be exactly 13 digits (or 12 before checksum)
      if (addChecksum) {
        code = code.padEnd(12, '0').substring(0, 12);
        return generateChecksum(code, format);
      } else {
        return code.padEnd(13, '0').substring(0, 13);
      }
      
    case 'UPCA':
      // UPCA needs to be exactly 12 digits (or 11 before checksum)
      if (addChecksum) {
        code = code.padEnd(11, '0').substring(0, 11);
        return generateChecksum(code, format);
      } else {
        return code.padEnd(12, '0').substring(0, 12);
      }
      
    case 'CODE39':
      // CODE39 can be variable length but we'll cap it
      return code.substring(0, Math.min(code.length, 43));
      
    case 'CODE128':
      // CODE128 can be variable length but we'll cap it
      return code.substring(0, Math.min(code.length, 48));
      
    case 'QR':
      // QR can handle much more data, so we'll just return as is
      return code;
      
    default:
      // For other formats, just ensure it meets the requested length
      if (code.length < length) {
        code = code.padEnd(length, '0');
      } else if (code.length > length) {
        code = code.substring(0, length);
      }
      
      // Add checksum if requested
      return addChecksum ? generateChecksum(code, format) : code;
  }
}
