
/**
 * Converts a hex color string to an HSL string 'h s% l%'.
 * @param {string} hex The hex color string (e.g., "#RRGGBB").
 * @returns {string} The HSL color string.
 */
export function hexToHsl(hex: string): string {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    // Return a default or transparent color for invalid input
    return '0 0% 0%'; 
  }

  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}


/**
 * Determines if a given hex color is "dark".
 * Useful for deciding whether foreground text should be light or dark.
 * @param {string} hex The hex color string.
 * @returns {boolean} True if the color is dark, false otherwise.
 */
export function isColorDark(hex: string): boolean {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return false;
  
  const color = (hex.charAt(0) === '#') ? hex.substring(1, 7) : hex;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Using the YIQ formula to determine brightness
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128;
}

/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex The hex color string.
 * @returns {{r: number, g: number, b: number} | null} An object with r, g, b values, or null if invalid.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates the relative luminance of an RGB color.
 * @param {number} r The red value (0-255).
 * @param {number} g The green value (0-255).
 * @param {number} b The blue value (0-255).
 * @returns {number} The relative luminance (0-1).
 */
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates the contrast ratio between two hex colors.
 * @param {string} hex1 The first hex color.
 * @param {string} hex2 The second hex color.
 * @returns {number} The contrast ratio.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}
