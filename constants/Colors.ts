/**
 * Aperioesca Color Palette
 * Pink-cyan gradient, glassmorphism, calm aesthetic
 */

const tintColorLight = '#FF6B9D'; // Pink
const tintColorDark = '#6FEDD6'; // Cyan

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1A2E', // Deep purple-navy (matches logo)
    tint: tintColorDark,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorDark,

    // Aperioesca Brand Colors
    cardBackground: '#1E1E1E',

    // Primary Gradient (Pink to Cyan)
    primary: '#FF6B9D', // Pink - Energy/Action
    secondary: '#6FEDD6', // Cyan - Calm/Awareness

    // Energy Bands
    energyLight: '#6FEDD6', // Cyan - Light meals
    energyModerate: '#A78BFA', // Purple - Moderate meals
    energyHeavy: '#FF6B9D', // Pink - Heavy meals

    // Semantic Colors
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    danger: '#EF4444', // Red
    info: '#3B82F6', // Blue

    gray: '#2C2C2C',
    grayLight: '#3A3A3A',
  },
};
