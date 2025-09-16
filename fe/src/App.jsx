import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AppsPage from './pages/AppsPage';
import AppSearch from './components/AppSearch';
import PicSearch from './components/PicSearch';
import PicsPage from './pages/PicsPage';
import AppPicPage from './pages/AppPicPage';
import DownloadPage from './pages/DownloadPage';

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
          <Route path="/map-pic" element={<AppPicPage />} />
          <Route path="/download" element={<DownloadPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;