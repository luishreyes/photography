import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { I18nProvider, useI18n } from './context/i18n';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import SeriesPage from './pages/SeriesPage';
import StudiesPage from './pages/StudiesPage';
import StudyPage from './pages/StudyPage';
import LoosePage from './pages/LoosePage';
import LooseYearPage from './pages/LooseYearPage';

// Always start a freshly navigated page at the top — React Router otherwise
// keeps the previous scroll position, which left long pages (mobile gallery)
// mid-page on entry.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Placeholder({ label }: { label: string }) {
  const { t } = useI18n();
  return <div className="pt-24 px-8 text-white">{label} — {t('soon')}</div>;
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<SeriesPage />} />
          <Route path="/studies" element={<StudiesPage />} />
          <Route path="/studies/:slug" element={<StudyPage />} />
          <Route path="/loose" element={<LoosePage />} />
          <Route path="/loose/:year" element={<LooseYearPage />} />
          <Route path="/contact" element={<Placeholder label="Contact" />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
