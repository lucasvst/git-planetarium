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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Gerenciador de Repositórios Git</h1>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Configuração e Listagem</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            Caminho do Diretório:
            <input
              type="text"
              value={directoryPath}
              onChange={(e) => setDirectoryPath(e.target.value)}
              placeholder="/Users/seu_usuario/projetos"
              style={{ padding: '8px', flex: '1', minWidth: '300px' }}
            />
          </label>
          <button onClick={handleSetup} style={{ padding: '8px 16px' }}>Criar Diretório</button>
          <button onClick={handleListRepositories} style={{ padding: '8px 16px' }}>Listar Repositórios</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Clonar Repositório</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            URL do Repositório:
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/repo.git"
              style={{ padding: '8px', width: '100%' }}
            />
          </label>
          <label>
            Diretório de Destino:
            <input
              type="text"
              value={targetDirectory}
              onChange={(e) => setTargetDirectory(e.target.value)}
              placeholder="/Users/seu_usuario/projetos/novo-repo"
              style={{ padding: '8px', width: '100%' }}
            />
          </label>
          <button onClick={handleGitClone} style={{ padding: '8px 16px', alignSelf: 'flex-start' }}>Clonar</button>
        </div>
      </div>

      {message && <p style={{ color: message.startsWith('Erro') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</p>}

      {repositories.length > 0 && (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h2>Repositórios no Diretório</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Nome do Repositório</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{repo}</td>
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