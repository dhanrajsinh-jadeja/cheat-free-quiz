import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId="your_google_client_id_here.apps.googleusercontent.com">
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
