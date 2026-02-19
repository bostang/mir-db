import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AppsPage from './pages/AppsPage';
import AppSearch from './components/AppSearch';
import PeopleSearch from './components/PeopleSearch';
import PeoplePage from './pages/PeoplePage';
import AppPeoplePage from './pages/AppPeoplePage';
import DownloadPage from './pages/DownloadPage';
import LinksPage from './pages/LinksPage'; 
import ValidatePICPage from './pages/validatePICPage'; 
import BulkActionPage from './pages/BulkActionPage';

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/search/people" element={<AppSearch />} />
          <Route path="/search/apps" element={<PeopleSearch />} />
          <Route path="/map-pic" element={<AppPeoplePage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/validate-pic" element={<ValidatePICPage />} />
          <Route path="/bulk-action-people" element={<BulkActionPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;