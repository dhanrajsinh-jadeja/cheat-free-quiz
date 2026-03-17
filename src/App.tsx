import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Specialized components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Lazy load all page components
const SigninPage = lazy(() => import('./pages/SigninPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const CreateQuizPage = lazy(() => import('./pages/CreateQuizPage'));
const MyQuizzesPage = lazy(() => import('./pages/MyQuizzesPage'));
const QuizRulesPage = lazy(() => import('./pages/QuizRulesPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const QuizResponsesPage = lazy(() => import('./pages/QuizResponsesPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ResultDetailsPage = lazy(() => import('./pages/ResultDetailsPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-4 text-text-white">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-text-muted animate-pulse">Loading...</p>
    </div>
);

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
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
                    
                    {/* Quiz Taking/Rules Routes */}
                    <Route path="/quiz-rules/:id" element={<ProtectedRoute><QuizRulesPage /></ProtectedRoute>} />
                    <Route path="/quiz/take/:id" element={<ProtectedRoute><QuizTakePage /></ProtectedRoute>} />
                    <Route path="/quiz/result/:attemptId" element={<ProtectedRoute><ResultDetailsPage /></ProtectedRoute>} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
