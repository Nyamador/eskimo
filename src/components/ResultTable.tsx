import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResultTableProps {
  data: any[]
}

export default function ResultTable({ data }: ResultTableProps) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-4 text-zinc-400 bg-zinc-900 rounded-lg border border-zinc-700">
        No results found
      </div>
    )
  }

  const columns = Object.keys(data[0] || {})

  return (
    <div className="overflow-x-auto bg-zinc-900 rounded-lg border border-zinc-700">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-700">
            {columns.map((column) => (
              <TableHead
                key={column}
                className="text-zinc-300 font-medium py-3 px-4"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className="border-b border-zinc-800 last:border-b-0"
            >
              {columns.map((column) => (
                <TableCell key={column} className="py-2 px-4 text-zinc-300">
                  {JSON.stringify(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
