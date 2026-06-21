import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Pass the mode directly via route definition */}
        <Route path="/login" element={<Auth passmode="login" />} />
        <Route path="/signup" element={<Auth passmode="signup" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
