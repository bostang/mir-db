import { Routes, Route, Navigate } from 'react-router-dom';
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
import BulkActionPeople from './pages/BulkActionPeople';
import BulkActionRelations from './pages/BulkActionRelations';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';

function App() {
  // Ambil role dan bersihkan dari spasi atau tanda kutip sisa JSON.stringify
  const userRole = localStorage.getItem('role')?.replace(/["']/g, "").trim().toLowerCase();
  const isAdmin = userRole === 'admin';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <div className="container">
                <Routes>
                  {/* Rute Umum */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/apps" element={<AppsPage />} />
                  <Route path="/people" element={<PeoplePage />} />
                  <Route path="/links" element={<LinksPage />} />
                  <Route path="/search/people" element={<AppSearch />} />
                  <Route path="/search/apps" element={<PeopleSearch />} />
                  <Route path="/map-pic" element={<AppPeoplePage />} />
                  <Route path="/download" element={<DownloadPage />} />
                  <Route path="/validate-pic" element={<ValidatePICPage />} />

                  {/* Rute Khusus Admin */}
                  {isAdmin && (
                    <>
                      <Route path="/bulk-action-people" element={<BulkActionPeople />} />
                      <Route path="/bulk-action-relations" element={<BulkActionRelations />} />
                    </>
                  )}

                  {/* Catch-all: Jika tidak cocok ke mana pun (termasuk admin route bagi viewer) */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </>
          }
        />
      </Route>
    </Routes>
  );
}
export default App;