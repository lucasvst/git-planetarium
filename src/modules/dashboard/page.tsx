import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  ListRepositories,
  Repository,
} from "./../../core/api/GitManager";

import useSettings from './../settings';
import { Button } from '@/components/ui/button';
import { EasyTable } from '@/components/ui/table';

const DashboardPage: React.FC = () => {

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const navigate = useNavigate();
  const [settings] = useSettings()

  const handleListRepositories = async (directoryPath: string) => {
    try {
      setRepositories(await ListRepositories(directoryPath));
    } catch (error) {
      setRepositories([]);
    }
  };

  useEffect(() => {
    if (settings.directoryPath) {
      handleListRepositories(settings.directoryPath);
    }
  }, [settings.directoryPath]);

  const handleRowClick = (repo: Repository) => {
    navigate(`/repositories/${repo.name}`);
  };

  const columns = [
    { header: 'Nome do Repositório', key: 'name' as const },
    { header: 'Última Atualização', key: 'last_commit_date' as const },
    { header: 'Branches', key: 'branch_count' as const },
    { header: 'Current Branch', key: 'current_branch' as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      {repositories.length > 0 && (
        <div>
          <h2>Repositórios no Diretório</h2>
          <EasyTable columns={columns} data={repositories} onRowClick={handleRowClick} />
        </div>
      )}
      <Button>Clone repository</Button>
    </div>
  );
}

export default DashboardPage;
