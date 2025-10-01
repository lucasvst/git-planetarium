import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  ListRepositories,
  Repository,
} from "./../../core/api/GitManager";

import useSettings from './../settings';

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

  const handleRowClick = (repoName: string) => {
    navigate(`/repositories/${repoName}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {repositories.length > 0 && (
        <div>
          <h2>Repositórios no Diretório</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Nome do Repositório</th>
                <th>Última Atualização</th>
                <th>Branches</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo, index) => (
                <tr key={index} onClick={() => handleRowClick(repo.name)} style={{ cursor: 'pointer' }}>
                  <td>{repo.name}</td>
                  <td>{repo.last_commit_date}</td>
                  <td>{repo.branch_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
