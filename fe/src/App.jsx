import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AppsPage from './pages/AppsPage';
import AppSearch from './components/AppSearch';
import PicSearch from './components/PicSearch';
import PicsPage from './pages/PicsPage';

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/pics" element={<PicsPage />} />
          <Route path="/search/pics" element={<AppSearch />} />
          <Route path="/search/apps" element={<PicSearch />} />
        </Routes>
      </div>
    </>
  );
}

export default App;