import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  ListRepositories,
  Repository,
} from "@/core/api/GitManager";
import useSettings from '@/modules/settings';
import { EasyTable } from '@/components/ui/table';

const columns = [
    { header: 'Nome do Repositório', key: 'name' as const },
    { header: 'Última Atualização', key: 'last_commit_date' as const },
    { header: 'Branches', key: 'branch_count' as const },
    { header: 'Current Branch', key: 'current_branch' as const },
];

export default function () {

    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>()
    const navigate = useNavigate();
    const [settings] = useSettings()

    useEffect(() => {
        if (settings.directoryPath) {
            handleListRepositories(settings.directoryPath);
        }
    }, []);

    const handleListRepositories = async (directoryPath: string) => {
        try {
            setIsLoading(true)
            setRepositories(await ListRepositories(directoryPath));
        } catch (error) {
            setRepositories([]);
        } finally {
            setIsLoading(false)
        }
    };

    const handleRowClick = (repo: Repository) => {
        navigate(`/repositories/${repo.name}`);
    };

    if (isLoading) {
        return (
            <div>Loading...</div>
        )
    }

    if (!repositories || repositories.length === 0) {
        return (
            <div>Empty list</div>
        )
    }

    return (
        <EasyTable columns={columns} data={repositories} onRowClick={handleRowClick} />
    )
}