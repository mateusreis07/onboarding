import { Sidebar } from "@/components/main-layout/sidebar"
import { Header } from "@/components/main-layout/header"
import { AIAssistantWidget } from "@/components/ai-assistant/chat-widget"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <AIAssistantWidget />
    </div>
  )
}
