/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import appCss from "@/styles/app.css?url"
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Mail Client - Clubs',
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/mailIcon.webp',
    },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
     <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col w-full mt-4">
          {/* Header mit Sidebar Trigger */}
          <header className="flex mb-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
            <SidebarTrigger className="-ml-1 mb-4" />
            <div className="flex-1">
              <p className="text-xl font-semibold mb-4">Mail Client</p>
            </div>
          </header>
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>

    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}