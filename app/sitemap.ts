import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/planificacion-docente-ia",
    "/evaluaciones-con-ia",
    "/material-educativo-ia",
    "/planificaciones-mineduc",
    "/objetivos-aprendizaje-mineduc",
    "/recursos-docentes",
    "/recursos-docentes/planificacion-docente",
    "/recursos-docentes/dua-planificacion-docente",
    "/recursos-docentes/evaluacion-formativa",
    "/recursos-docentes/rubricas-evaluacion",
    "/recursos-docentes/objetivos-de-aprendizaje-planificacion",
    "/recursos-docentes/planificacion-docente-educacion-basica",
    "/recursos-docentes/planificacion-docente-ensenanza-media",
    "/recursos-docentes/lista-de-cotejo",
    "/recursos-docentes/guia-de-aprendizaje",
    "/recursos-docentes/instrumentos-de-evaluacion",
  ];
  return routes.map((route,index)=>({
    url: `https://educantay.cl${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: index===0 ? 1 : 0.9,
  }));
}
