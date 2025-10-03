import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { GetCommitDetails } from './../../core/api/GitManager';

import useSettings from './../settings';

const CommitPage: React.FC = () => {
  const { repositoryName, commitHash } = useParams<{ repositoryName: string, commitHash: string }>();
  const [commit, setCommit] = useState<any>();
  const [message, setMessage] = useState('');
  const [settings] = useSettings();

  useEffect(() => {
    handleGetCommit();
  }, []);

  const handleGetCommit = async () => {
    setMessage('');
    try {
      const result = await GetCommitDetails(repositoryName!, commitHash!, settings.directoryPath!);
      setCommit(result);
    } catch (error) {
      setMessage(`Erro: ${error}`);
      setCommit(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Commit {commitHash}</h2>
      {message && <p>{message}</p>}
      <pre>{JSON.stringify(commit, null, 2)}</pre>
    </div>
  );
};

export default CommitPage;
