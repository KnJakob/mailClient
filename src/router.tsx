import { createRouter as createTanStackRouter, Link } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ErrorComponent,
  })

  return router
}

export function ErrorComponent({ error }: { error?: Error }) {
  return (
    <div className="flex items-center justify-center h-screen p-4">
      <Card className="w-full max-w-md border-red-500 bg-red-50 text-center">
        <CardHeader>
          <CardTitle className="text-red-600">Ein Fehler ist aufgetreten!</CardTitle>
          {error && (
            <CardDescription>
              <pre className="bg-red-100 text-red-800 p-3 rounded-lg overflow-x-auto">
                {error.message}
              </pre>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Link to="/mails">Zurück zum Mail-Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}