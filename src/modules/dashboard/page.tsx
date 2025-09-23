import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { load, Store } from '@tauri-apps/plugin-store'

interface Repository {
  name: string;
  last_commit_date: string;
  branch_count: number;
}

const GitManager: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [message, setMessage] = useState('');
  const [store, setStore] = useState<Store>();

  useEffect(() => {
    const loadStore = async () => {
      const _store = await load('my_settings.json');
      setStore(_store)
      const _directoryPath = await _store.get<string>('directoryPath')
      setDirectoryPath(_directoryPath||"")
    }
    loadStore()
  }, [])

  useEffect(() => {
    if (directoryPath) {
      handleListRepositories();
    }
  }, [directoryPath]);

  const handleSetup = async () => {
    setMessage('');
    try {
      const result = await invoke<string>('setup', { path: directoryPath });
      setMessage(result);
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
  };

  const handleListRepositories = async () => {
    setMessage('');
    try {
      const result = await invoke<string[]>('list_repositories', { path: directoryPath });
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
      const result = await invoke<string>('git_clone', { repoUrl: repoUrl, targetDir: directoryPath });
      setMessage(result);
      // Recarrega a lista de repositórios após o clone
      await handleListRepositories();
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
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
              await store?.set('directoryPath', e.target.value)
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
                <tr key={index}>
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
