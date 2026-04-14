export const THEME_KEY = "theme";
export const DARK_CLASS = "dark";

export type Theme = "light" | "dark" | "system";

export const networkColors: Record<string, { bg: string; text: string }> = {
  MTN: { bg: "#ffcc00", text: "#000000" },
  AIRTEL: { bg: "#e60000", text: "#ffffff" },
  GLO: { bg: "#00a550", text: "#ffffff" },
  NINE_MOBILE: { bg: "#006666", text: "#ffffff" },
  NTEL: { bg: "#4a4a4a", text: "#ffffff" },
  VISAFONE: { bg: "#ff6600", text: "#ffffff" },
  SMILE: { bg: "#00bfff", text: "#ffffff" },
  MAFAB: { bg: "#6b21a8", text: "#ffffff" },
  UNKNOWN: { bg: "#6b7280", text: "#ffffff" },
};
