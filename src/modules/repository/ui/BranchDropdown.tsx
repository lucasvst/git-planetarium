import { memo, Suspense, useEffect, useState } from "react";

import Dropdown from "./../../../ui/Dropdown";
import { GetRepositoryBranches } from "./../../../core/api/GitManager";

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
        <Dropdown
            label="Branches"
            items={branches.map(branch => ({
                label: branch.name,
                onClick: console.log,
            }))}
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