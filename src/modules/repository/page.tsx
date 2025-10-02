import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { GetRepositoryCommits } from './../../core/api/GitManager';

import useSettings from './../settings';

import BranchDropdown from './ui/BranchDropdown';
import { EasyTable } from '@/components/ui/table';

const RepositoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [commits, setCommits] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [settings] = useSettings();

  useEffect(() => {
    if (name && settings.directoryPath) {
      handleGetRepositoryCommits();
    }
  }, [name, settings.directoryPath]);

  const handleGetRepositoryCommits = async () => {
    setMessage('');
    try {
      const result = await GetRepositoryCommits(name!, settings.directoryPath!);
      setCommits(result);
    } catch (error) {
      setMessage(`Erro: ${error}`);
      setCommits([]);
    }
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
        repositoryName={name!}
        directoryPath={settings.directoryPath!}
      />
      <h2>Commits for {name}</h2>
      {message && <p>{message}</p>}
      {commits.length > 0 && (
        <EasyTable columns={columns} data={commits} />
      )}
    </div>
  );
};

export default RepositoryPage;
