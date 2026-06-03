export interface SettingsInput {
  editorTheme: string;
  fontSize: number;
  wordWrap: "on" | "off";
  minimap: boolean;
  lineNumbers: "on" | "off";
  tabSize: number;
}

export function validateSettings(data: SettingsInput) {
  const errors: Record<string, string[]> = {};
  if (data.fontSize < 8 || data.fontSize > 32) {
    errors.fontSize = ["Font size must be between 8 and 32."];
  }
  if (![1, 2, 4, 8].includes(data.tabSize)) {
    errors.tabSize = ["Tab size must be 1, 2, 4, or 8."];
  }
  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}
