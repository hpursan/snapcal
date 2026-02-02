/**
 * SnapCal Color Palette
 * minimalist, dark mode, premium aesthetic
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#4D96FF'; // Neon Blue

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
    background: '#121212', // Deep matte charcoal/black
    tint: tintColorDark,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorDark,

    // Custom App Colors
    cardBackground: '#1E1E1E',
    primary: '#4D96FF', // Blue - Protein/Action
    secondary: '#76E4F7', // Cyan - Progress
    accent: '#A469FF', // Purple - Fat/Vibe
    success: '#6BCB77', // Green - Carbs/Success
    warning: '#FFD93D', // Yellow/Orange
    danger: '#FF6B6B', // Red
    surplus: '#FF8C00', // Dark Orange - Surplus Energy

    gray: '#2C2C2C',
    grayLight: '#3A3A3A',
  },
};
