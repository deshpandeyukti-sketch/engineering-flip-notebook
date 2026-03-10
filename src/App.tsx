import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotebookProvider } from './contexts/NotebookContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading...</p>
      </div>
    );
  }

  return user ? (
    <NotebookProvider>
      <Dashboard />
    </NotebookProvider>
  ) : (
    <Login />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
