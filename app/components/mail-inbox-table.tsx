"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmailMetaData } from "@/lib/mail"
import { Link } from "@tanstack/react-router"
import { Button } from "./ui/button"


export const columns: ColumnDef<EmailMetaData>[] = [
  {
    accessorKey: "from",
    header: "Absender",
    cell: ({ row }) => {
      const fromString: String = row.getValue("from")
      const match = fromString.match(/^(.*?)\s*<(.+?)>$/)

      if (match) {
        let name = match[1].trim().replace(/^"|"$/g, "")
        return <div className="font-medium">{name}</div>
      }
      return <div className="font-medium">{fromString.trim()}</div>
    }
  },
  {
    accessorKey: "subject",
    header: "Betreff",
    cell: ({ row }) => {
      let content: String = row.getValue("subject")
      if(content.length > 60){
        content = content.slice(0, 60)
        content = content.concat("..")
      }
        return (
          <Link to="/mails/$uid" params={{uid: row.original.id.toString()}}>
            <div className="font-medium">{content}</div>
          </Link>
        )
    }
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">Datum</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0") // months are 0-based
      const year = date.getFullYear()
      const formatted = `${day}.${month}.${year}`
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  }
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  return (
    <div>
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
    </div>
  )
}