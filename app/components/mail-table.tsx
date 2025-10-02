"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@tanstack/react-router"
import { EmailData } from "@/lib/mail"

interface DataTableProps {
  data: EmailData[]
  sent: boolean
}

export function MailTable({ data, sent }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {sent ? (
            <TableHead>Empfänger</TableHead>
            ) : (
            <TableHead>Absender</TableHead>
            )}
            <TableHead>Betreff</TableHead>
            <TableHead>Datum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length ? (
            data.map((email, index) => (
                <TableRow key={index}>
                  {sent ? (
                  <TableCell>{email.to}</TableCell>
                  ) : (
                  <TableCell>{email.from}</TableCell>
                  )}
                  <TableCell className="text-semibold">
                    <Link to="/mails/$uid" params={{uid: email.id.toString()}} className="text-semibold">
                      {email.subject}
                    </Link>
                  </TableCell>
                  <TableCell>{email.id}</TableCell>
                </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}