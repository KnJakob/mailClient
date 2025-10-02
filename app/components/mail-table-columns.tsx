"use client"

import { EmailData } from "@/lib/mail"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<EmailData>[] = [
  {
    accessorKey: "from",
    header: "Absender",
  },
  {
    accessorKey: "subject",
    header: "Betreff",
  },
  {
    accessorKey: "date",
    header: "Datum",
  },
]

export const columnsSent: ColumnDef<EmailData>[] = [
  {
    accessorKey: "to",
    header: "Empfänger",
  },
  {
    accessorKey: "subject",
    header: "Betreff",
  },
  {
    accessorKey: "date",
    header: "Datum",
  },
]