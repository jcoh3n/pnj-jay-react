export interface Theme {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
