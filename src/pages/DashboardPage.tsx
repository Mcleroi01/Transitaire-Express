import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OverviewPage from './dashboard/OverviewPage';
import ClientsPage from './dashboard/ClientsPage';
import ColisPage from './dashboard/ColisPage';
import NouveauColisPage from './dashboard/NouveauColisPage';

type Page = 'overview' | 'clients' | 'colis' | 'nouveau-colis';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');

  const handleNavigate = (page: Page) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={handleNavigate} />;
      case 'clients':
        return <ClientsPage />;
      case 'colis':
        return <ColisPage />;
      case 'nouveau-colis':
        return <NouveauColisPage onSuccess={() => setCurrentPage('colis')} />;
      default:
        return <OverviewPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </DashboardLayout>
  );
}
