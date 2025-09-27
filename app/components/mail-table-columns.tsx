"use client"

import { EmailData } from "@/lib/mail"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<EmailData>[] = [
  {
    accessorKey: "From",
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