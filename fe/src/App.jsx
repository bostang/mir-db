import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AppsPage from './pages/AppsPage';
import AppSearch from './components/AppSearch';
import PicSearch from './components/PicSearch';

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/search/pics" element={<AppSearch />} />
          <Route path="/search/apps" element={<PicSearch />} />
        </Routes>
      </div>
    </>
  );
}

export default App;