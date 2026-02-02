import ResultsPage from './pages/ResultsPage';
import StoryPage from './pages/StoryPage';
import QuizPage from './pages/QuizPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';


function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Placeholder Routes for later days */}
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
