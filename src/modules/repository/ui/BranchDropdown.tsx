import { memo, Suspense, useEffect, useState } from "react";

import { GetRepositoryBranches } from "./../../../core/api/GitManager";
import { EasySelect } from "@/components/ui/select";

interface BranchDropdown {
    repositoryName: string
    directoryPath: string
}

function BranchDropdownImpl (props: BranchDropdown) {

    const [branches, setBranches] = useState<any[]>([])

    const handleGetRepositoryBranches = async () => {
        try {
            const result = await GetRepositoryBranches(props.repositoryName, props.directoryPath)
            setBranches(result)
        } catch (error) {
            setBranches([])
        }
    }

    useEffect(() => {
        if (props.repositoryName && props.directoryPath) {
            handleGetRepositoryBranches()
        }
    }, [])

    return (
        <EasySelect
            options={branches.map(branch => ({
                label: branch.name,
                value: branch.name,
            }))}
            onChange={console.log}
            placeholder="Branches"
        />
    )
}

function BranchDropdown (props: BranchDropdown) {
    return (
        <Suspense fallback={<div>Loading data...</div>}>
          <BranchDropdownImpl {...props}/>
        </Suspense>
    )
}

export default memo(BranchDropdown)