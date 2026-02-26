"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@tanstack/react-router"
import { EmailMetaData } from "@/lib/mail"
import { Button } from "@/components/ui/button"

interface DataTableProps {
  data: EmailMetaData[]
  sent: boolean
  onMagicClick?: (email: EmailMetaData) => void | Promise<void>
  detailMailbox?: string
}

export function MailTable({ data, sent, onMagicClick, detailMailbox }: DataTableProps) {
  const hasMagicAction = typeof onMagicClick === "function"
  const [magicInProgressId, setMagicInProgressId] = useState<number | null>(null)

  async function handleMagicClick(email: EmailMetaData) {
    if (!onMagicClick) {
      return
    }

    try {
      setMagicInProgressId(email.id)
      await onMagicClick(email)
    } catch (error) {
      console.error("Magic Aktion fehlgeschlagen:", error)
    } finally {
      setMagicInProgressId(null)
    }
  }

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
            {hasMagicAction ? <TableHead className="text-right">Aktion</TableHead> : null}
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
                    <Link
                      to="/mails/$uid"
                      params={{uid: email.id.toString()}}
                      search={detailMailbox ? { mailbox: detailMailbox } : {}}
                      className="text-semibold"
                    >
                      {email.subject}
                    </Link>
                  </TableCell>
                  {hasMagicAction ? (
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={magicInProgressId === email.id}
                          onClick={() => void handleMagicClick(email)}
                        >
                          {magicInProgressId === email.id ? "Magic..." : "Magic"}
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                  <TableCell>{email.date}</TableCell>
                </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={hasMagicAction ? 4 : 3} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
