import { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { FlipNotebook } from '../components/FlipNotebook';
import { RightPanel } from '../components/RightPanel';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export function Dashboard() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <FlipNotebook />
      </main>
      <RightPanel isOpen={rightPanelOpen} />
    </div>
  );
}
