import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(
    localStorage.getItem("chat-theme") || "dark"
  );
  const [fontSize, setFontSizeState] = useState(
    localStorage.getItem("chat-font-size") || "16"
  );
  const [accentColor, setAccentColorState] = useState(
    localStorage.getItem("chat-accent-color") || null
  );

  const setTheme = (newTheme) => {
    localStorage.setItem("chat-theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setThemeState(newTheme);
  };

  const setFontSize = (newFontSize) => {
    localStorage.setItem("chat-font-size", newFontSize);
    document.documentElement.setAttribute('data-font-size', newFontSize);
    document.documentElement.style.fontSize = `${newFontSize}px`;
    setFontSizeState(newFontSize);
  };

  const setAccentColor = (newColor, focusColor) => {
    localStorage.setItem("chat-accent-color", newColor);
    setAccentColorState(newColor);
    if (newColor) {
      document.documentElement.style.setProperty('--p', newColor);
      if (focusColor) document.documentElement.style.setProperty('--pf', focusColor);
    } else {
      document.documentElement.style.removeProperty('--p');
      document.documentElement.style.removeProperty('--pf');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.style.fontSize = `${fontSize}px`;
    if (accentColor) {
      document.documentElement.style.setProperty('--p', accentColor);
    }
  }, [theme, fontSize, accentColor]);

  const value = {
    theme,
    fontSize,
    accentColor,
    setTheme,
    setFontSize,
    setAccentColor
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
