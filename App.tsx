import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import SeriesPage from './pages/SeriesPage';

const StudiesPage = () => <div className="pt-24 px-8 text-white">Studies — coming soon</div>;
const LoosePage = () => <div className="pt-24 px-8 text-white">Loose — coming soon</div>;
const ContactPage = () => <div className="pt-24 px-8 text-white">Contact — coming soon</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:slug" element={<SeriesPage />} />
        <Route path="/studies" element={<StudiesPage />} />
        <Route path="/loose" element={<LoosePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}
