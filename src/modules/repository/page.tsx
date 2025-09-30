import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { GetRepositoryCommits } from './../api/GitManager';
import useSettings from './../settings';

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

  return (
    <div className="flex flex-col gap-4">
      <h2>Commits for {name}</h2>
      {message && <p>{message}</p>}
      {commits.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Hash</th>
              <th>Author</th>
              <th>Date</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {commits.map((commit, index) => (
              <tr key={index}>
                <td>{commit.hash}</td>
                <td>{commit.author}</td>
                <td>{commit.date}</td>
                <td>{commit.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RepositoryPage;
