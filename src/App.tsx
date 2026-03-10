import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SigninPage from './pages/SigninPage';
import SignUpPage from './pages/SignUpPage';
import CreateQuizPage from './pages/CreateQuizPage';
import MyQuizzesPage from './pages/MyQuizzesPage';
import QuizRulesPage from './pages/QuizRulesPage';
import QuizTakePage from './pages/QuizTakePage';

import ProfilePage from './pages/ProfilePage';

import QuizResponsesPage from './pages/QuizResponsesPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<SigninPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
                <Route path="/create-quiz" element={<CreateQuizPage />} />
                <Route path="/my-quizzes" element={<MyQuizzesPage />} />
                <Route path="/quiz/:id/responses" element={<QuizResponsesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/quiz-rules/:id" element={<QuizRulesPage />} />
                <Route path="/quiz/take/:id" element={<QuizTakePage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
