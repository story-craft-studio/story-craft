/**
 * Generates a random pastel color in HSL format.
 * Pastel colors have high lightness (75-85%) and moderate saturation (40-60%).
 */
export function generateRandomPastelColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20 + 40); // 40-60%
    const lightness = Math.floor(Math.random() * 10 + 75); // 75-85%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Predefined set of beautiful pastel colors.
 */
export const pastelColors = [
    'hsl(350, 50%, 80%)', // Soft pink
    'hsl(220, 50%, 80%)', // Soft blue
    'hsl(120, 50%, 80%)', // Soft green
    'hsl(280, 50%, 80%)', // Soft purple
    'hsl(30, 50%, 80%)',  // Soft orange
    'hsl(190, 50%, 80%)', // Soft cyan
    'hsl(60, 50%, 80%)',  // Soft yellow
    'hsl(320, 50%, 80%)', // Soft magenta
    'hsl(90, 50%, 80%)',  // Soft lime
    'hsl(170, 50%, 80%)', // Soft teal
    'hsl(250, 50%, 80%)', // Soft indigo
    'hsl(15, 50%, 80%)',  // Soft coral
];

/**
 * Gets a random pastel color from the predefined set.
 */
export function getRandomPastelColor(): string {
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

/**
 * Converts HSL color to a darker version for borders/connections.
 */
export function darkenColor(hslColor: string, darkenAmount: number = 20): string {
    const hslMatch = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!hslMatch) return hslColor;
    
    const [, hue, saturation, lightness] = hslMatch;
    const newLightness = Math.max(0, parseInt(lightness) - darkenAmount);
    
    return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
} 