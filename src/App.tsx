import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SigninPage';
import CreateQuizPage from './pages/CreateQuizPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<SignInPage />} />
                <Route path="/create-quiz" element={<CreateQuizPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
