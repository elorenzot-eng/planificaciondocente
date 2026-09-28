import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://educantay.cl"),
  title: {
    default: "Educantay | Tu espacio de trabajo docente",
    template: "%s | Educantay",
  },
  description: "Planifica, evalúa y crea materiales educativos con IA, alineados al Currículum Nacional de Chile. Planificaciones, evaluaciones, rúbricas, guías y recursos en un solo lugar.",
  keywords: ["planificación docente","planificaciones docentes Chile","IA para docentes","evaluaciones docentes","material educativo","currículum nacional Chile","objetivos de aprendizaje","Educantay"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Educantay | Tu espacio de trabajo docente",
    description: "Planifica, evalúa y crea materiales educativos en minutos, alineados al Currículum Nacional de Chile.",
    url: "https://educantay.cl",
    siteName: "Educantay",
    locale: "es_CL",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="es-CL"><body>{children}</body></html>
}