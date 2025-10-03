import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import { GetRepositoryCommits } from './../../core/api/GitManager';

import useSettings from './../settings';

import BranchDropdown from './ui/BranchDropdown';
import { EasyTable } from '@/components/ui/table';

const RepositoryPage: React.FC = () => {
  const { repositoryName } = useParams<{ repositoryName: string }>();
  const [commits, setCommits] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [settings] = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (repositoryName && settings.directoryPath) {
      handleGetRepositoryCommits();
    }
  }, [repositoryName, settings.directoryPath]);

  const handleGetRepositoryCommits = async () => {
    setMessage('');
    try {
      const result = await GetRepositoryCommits(repositoryName!, settings.directoryPath!);
      setCommits(result);
    } catch (error) {
      setMessage(`Erro: ${error}`);
      setCommits([]);
    }
  };

  const handleRowClick = (commit: any) => {
    navigate(`/repositories/${repositoryName}/commits/${commit.hash}`);
  };

  const columns = [
    { header: 'Hash', key: 'hash' as const },
    { header: 'Author', key: 'author' as const },
    { header: 'Date', key: 'date' as const },
    { header: 'Message', key: 'message' as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <BranchDropdown
        repositoryName={repositoryName!}
        directoryPath={settings.directoryPath!}
      />
      <h2>Commits for {repositoryName}</h2>
      {message && <p>{message}</p>}
      {commits.length > 0 && (
        <EasyTable columns={columns} data={commits} onRowClick={handleRowClick} />
      )}
    </div>
  );
};

export default RepositoryPage;
