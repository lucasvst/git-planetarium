import React from 'react';
import { Button } from '@/components/ui/button';
import RepositoryTable from './ui/RepositoryTable';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <RepositoryTable />
      <Button>Clone repository</Button>
    </div>
  );
}

export default DashboardPage;
