import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Repository {
  name: string;
}

const GitManager: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [targetDirectory, setTargetDirectory] = useState('');
  const [repositories, setRepositories] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  // Carrega a lista de repositórios ao montar o componente
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
      const result = await invoke<string>('git_clone', { repoUrl: repoUrl, targetDir: targetDirectory });
      setMessage(result);
      // Recarrega a lista de repositórios após o clone
      await handleListRepositories();
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
  };

  return (
    <div>
      <h1>Gerenciador de Repositórios Git</h1>

      <div>
        <h2>Configuração e Listagem</h2>
        <div>
          <label>
            Caminho do Diretório:
            <input
              type="text"
              value={directoryPath}
              onChange={(e) => setDirectoryPath(e.target.value)}
              placeholder="/Users/seu_usuario/projetos"
            />
          </label>
          <button onClick={handleSetup}>Criar Diretório</button>
          <button onClick={handleListRepositories}>Listar Repositórios</button>
        </div>
      </div>

      <div>
        <h2>Clonar Repositório</h2>
        <div>
          <label>
            URL do Repositório:
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/repo.git"
            />
          </label>
          <label>
            Diretório de Destino:
            <input
              type="text"
              value={targetDirectory}
              onChange={(e) => setTargetDirectory(e.target.value)}
              placeholder="/Users/seu_usuario/projetos/novo-repo"
            />
          </label>
          <button onClick={handleGitClone}>Clonar</button>
        </div>
      </div>

      {message && <p>{message}</p>}

      {repositories.length > 0 && (
        <div>
          <h2>Repositórios no Diretório</h2>
          <table>
            <thead>
              <tr>
                <th>Nome do Repositório</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo, index) => (
                <tr key={index}>
                  <td>{repo}</td>
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
