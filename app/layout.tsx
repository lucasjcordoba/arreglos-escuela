import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arreglos de la Escuela',
  description: 'Listado de tareas de mantenimiento y reparaciones',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            }
          } catch(e) {}
        `}} />
      </head>
      <body className="bg-slate-50 dark:bg-[#0F1117] text-slate-800 dark:text-slate-200 transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}
