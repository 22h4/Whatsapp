import "../styles/globals.css"
import ClientLayout from "@/components/ClientLayout"
import { ThemeProvider } from "@/lib/theme-provider"

export const metadata = {
  title: "WhatsApp Automation",
  description: "Automate your WhatsApp messaging with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="whatsapp-theme"
        >
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
