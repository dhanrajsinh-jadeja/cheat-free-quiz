import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SigninPage from './pages/SigninPage';
import SignUpPage from './pages/SignUpPage';
import CreateQuizPage from './pages/CreateQuizPage';
import MyQuizzesPage from './pages/MyQuizzesPage';
import QuizRulesPage from './pages/QuizRulesPage';
import QuizTakePage from './pages/QuizTakePage';

import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import QuizResponsesPage from './pages/QuizResponsesPage';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PublicRoute from './components/PublicRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes - Protected from authenticated users */}
                <Route path="/login" element={<PublicRoute><SigninPage /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Protected Routes (Require Authentication) */}
                <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/profile" replace /></ProtectedRoute>} />
                <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
                <Route path="/my-quizzes" element={<ProtectedRoute><MyQuizzesPage /></ProtectedRoute>} />
                <Route path="/quiz/:id/responses" element={<ProtectedRoute><QuizResponsesPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                
                {/* Quiz Taking/Rules Routes (Can be public depending on requirements, but usually protected for students) */}
                <Route path="/quiz-rules/:id" element={<ProtectedRoute><QuizRulesPage /></ProtectedRoute>} />
                <Route path="/quiz/take/:id" element={<ProtectedRoute><QuizTakePage /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
