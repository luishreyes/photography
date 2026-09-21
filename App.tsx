import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { I18nProvider } from './context/i18n';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import SeriesPage from './pages/SeriesPage';
import StudiesPage from './pages/StudiesPage';
import StudyPage from './pages/StudyPage';
import LoosePage from './pages/LoosePage';
import LooseYearPage from './pages/LooseYearPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Always start a freshly navigated page at the top — React Router otherwise
// keeps the previous scroll position, which left long pages (mobile gallery)
// mid-page on entry. `instant` es explícito: si alguien vuelve a poner
// scroll-behavior smooth en el html, este salto no debe animarse.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// `published.site_url` del catálogo usó /study/<slug> (singular) durante 181
// fotos, y esas direcciones ya salieron en leyendas de Instagram. La ruta real
// es /studies/<slug>, así que las viejas se redirigen en vez de morir.
function LegacyStudy() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/studies/${slug ?? ''}`} replace />;
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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/study/:slug" element={<LegacyStudy />} />
          <Route path="/study" element={<Navigate to="/studies" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
