import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/planificacion-docente-ia",
    "/evaluaciones-con-ia",
    "/material-educativo-ia",
    "/planificaciones-mineduc",
    "/objetivos-aprendizaje-mineduc",
  ];
  return routes.map((route,index)=>({
    url: `https://educantay.cl${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: index===0 ? 1 : 0.9,
  }));
}
