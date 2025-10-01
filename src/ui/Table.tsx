interface TableColumn<T> {
  key: keyof T;
  header: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function Table<T extends { [key: string]: any }>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} onClick={() => onRowClick && onRowClick(item)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
            {columns.map((col) => (
              <td key={String(col.key)}>{item[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
