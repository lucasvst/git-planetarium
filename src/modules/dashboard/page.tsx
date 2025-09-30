import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  Setup,
  ListRepositories,
  GitClone,
  Repository,
} from "./../api/GitManager";

import useSettings from './../settings';

const GitManager: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [settings, setSettings] = useSettings()

  useEffect(() => {
    setDirectoryPath(settings.directoryPath||"")
  }, [settings])


  useEffect(() => {
    if (directoryPath) {
      handleListRepositories();
    }
  }, [directoryPath]);

  const handleSetup = async () => {
    setMessage('');
    try {
      const result = await Setup(directoryPath);
      setMessage(result);
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
  };

  const handleListRepositories = async () => {
    setMessage('');
    try {
      const result = await ListRepositories(directoryPath);
      setRepositories(result);
      setMessage(`Encontrados ${result.length} repositórios.`);
    } catch (error) {
      setMessage(`Erro: ${error}`);
      setRepositories([]);
    }
  };

  const handleGitClone = async () => {
    setMessage('');
    try {
      const result = await GitClone(repoUrl, directoryPath);
      setMessage(result);
      // Recarrega a lista de repositórios após o clone
      await handleListRepositories();
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
  };

  const handleRowClick = (repoName: string) => {
    navigate(`/repositories/${repoName}`);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* DIRECTORY */}
      <div className="flex flex-col gap-2">
        <label className="floating-label">
          <span>Caminho do Diretório:</span>
          <input
            className="input input-md"
            type="text"
            value={directoryPath}
            onChange={async (e) => {
              setDirectoryPath(e.target.value)
              setSettings({ directoryPath: e.target.value })
            }}
            placeholder="/Users/seu_usuario/projetos"
          />
        </label>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={handleSetup}
          >
            Criar Diretório
          </button>
          <button
            className="btn"
            onClick={handleListRepositories}
          >
            Listar Repositórios
          </button>
        </div>
      </div>

      {/* REPOSITORY */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <label className="floating-label">
            <span>URL do Repositório:</span>
            <input
              className="input input-md"
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/repo.git"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={handleGitClone}
          >
            Clonar
          </button>
        </div>
      </div>

      {message && <p>{message}</p>}

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

export default GitManager;
