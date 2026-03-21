import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(
    localStorage.getItem("chat-theme") || "coffee"
  );
  const [fontSize, setFontSizeState] = useState(
    localStorage.getItem("chat-font-size") || "medium"
  );

  const setTheme = (newTheme) => {
    localStorage.setItem("chat-theme", newTheme);
    setThemeState(newTheme);
  };

  const setFontSize = (newFontSize) => {
    localStorage.setItem("chat-font-size", newFontSize);
    document.documentElement.setAttribute('data-font-size', newFontSize);
    setFontSizeState(newFontSize);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  const value = {
    theme,
    fontSize,
    setTheme,
    setFontSize
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
