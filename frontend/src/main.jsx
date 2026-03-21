import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { GroupProvider } from './context/GroupContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <GroupProvider>
            <App />
          </GroupProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
