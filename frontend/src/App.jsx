import { useState } from 'react';
import './App.css';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

function App() {
  // Track if auth modal is open
  const [isAuthOpen, setIsAuthOpen] = useState(false); 
  // Track if user clicked 'login' or 'signup'
  const [authMode, setAuthMode] = useState('login'); 

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <Landing onAuthClick={openAuth} />
      
      {isAuthOpen && (
        <Auth 
          mode={authMode} 
          onClose={() => setIsAuthOpen(false)} 
        />
      )}
    </>
  );
}

export default App;
