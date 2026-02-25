import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { fetchEmailsFromImap } from '@/lib/mail'
import { columns, DataTable } from '@/components/mail-inbox-table'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await fetchEmailsFromImap({data: {beginFetch: 1, endFetch: 50}}),
})

function Home() {
  const router = useRouter()
  const data = Route.useLoaderData()

  return (
    <>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  )
}