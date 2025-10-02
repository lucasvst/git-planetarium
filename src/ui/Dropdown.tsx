interface DropdownItemProps {
    label: string
    onClick: () => void
}

interface DropdownProps {
    label: string
    items: DropdownItemProps[]
}

export default function Dropdown (props: DropdownProps) {
    return (
        <div className="dropdown">
            <div
                tabIndex={0}
                role="button"
                className="btn m-1"
            >{props.label}</div>
            <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
            >
                {props.items.map((item, index) => (
                    <li key={index}>
                        <a onClick={item.onClick}>{item.label}</a>
                    </li>
                ))}
            </ul>
        </div>
    )
}