import "./globals.css";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://educantay.cl/#website",
      url: "https://educantay.cl/",
      name: "Educantay",
      inLanguage: "es-CL",
      description: "Espacio de trabajo docente para planificar, evaluar y crear materiales educativos con IA, alineados al Currículum Nacional de Chile."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://educantay.cl/#software",
      name: "Educantay",
      url: "https://educantay.cl/",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "es-CL",
      description: "Plataforma para docentes de Chile con planificación, evaluaciones, rúbricas y material educativo asistido por inteligencia artificial.",
      offers: {
        "@type": "Offer",
        price: "20000",
        priceCurrency: "CLP",
        category: "subscription"
      }
    }
  ]
};

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
  return <html lang="es-CL"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}} />{children}</body></html>
}