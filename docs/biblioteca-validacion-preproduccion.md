# Validación previa a producción — Biblioteca EducAntay (PR #145)

## 1. Comprobación de base de datos (solo lectura)
En una **copia aislada** de la base PostgreSQL de producción, comprobar:
- Existencia y definición de las tablas `User`, `School`, `Organization`, `Planning`, `Assessment` y `SupportMaterial`.
- Si `SharedLibraryResource`, `PedagogicalModuleLicense` e `IndividualPedagogicalLicense` ya existen y, en ese caso, comparar columnas, índices y restricciones.
- Aplicar únicamente la migración `20261028003000_biblioteca_educantay` en esa copia. No ejecutar `prisma migrate deploy` sobre toda la cadena histórica: hay migraciones anteriores no reproducibles desde cero.
- Ejecutar `npx prisma validate`, una compilación con el esquema final y una consulta de lectura/escritura de prueba dentro de una transacción revertida.
- Verificar respaldo y plan de reversión antes de cualquier cambio en producción.

Consulta de inventario (solo lectura):
```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('User','School','Organization','Planning','Assessment','SupportMaterial',
                     'SharedLibraryResource','PedagogicalModuleLicense','IndividualPedagogicalLicense')
ORDER BY table_name, ordinal_position;
```

## 2. Matriz de usuarios de prueba (datos ficticios)
| Perfil | Licencia/estado | Resultado esperado |
|---|---|---|
| Docente individual | ACTIVE vigente + licencia pedagógica individual vigente | Puede importar sus propios recursos, ver y publicar |
| Docente individual | ACTIVE vigente sin licencia pedagógica | 403 |
| Docente individual | Solo licencia SIMCE/PAES | 403 |
| Docente individual | TRIAL vigente + licencia pedagógica individual vigente | Puede usar Biblioteca durante prueba |
| Docente individual | Vencida o cancelada | 403 |
| Docente institucional | Licencia PLANIFICACION vigente | Acceso permitido |
| Docente institucional | Solo SIMCE o PAES | 403 |
| Docente institucional | Colegio de otra organización | 403 |
| Docente institucional | Colegio u organización inactiva | 403 |
| Sostenedor | Colegio licenciado en su organización | Acceso según alcance de licencia |
| Sostenedor | Sin colegios licenciados | 403 |
| Superadministrador activo | Independiente de institución | Acceso administrativo |
| Usuario inactivo | Cualquier licencia | 403 |

## 3. Casos funcionales obligatorios
1. Importar recurso propio: inicialmente `published=false`.
2. Intentar importar recurso ajeno: 404, sin exposición del contenido.
3. Intentar importar evaluación SIMCE/PAES: denegado.
4. Intentar publicar texto con RUT, correo, teléfono o diagnóstico: denegado.
5. Publicar recurso limpio: aparece en listado compartido.
6. Retirar publicación: desaparece del listado compartido; autor conserva recurso privado.
7. Retirar un recurso cuyo contenido haya quedado restringido: operación permitida.
8. Intentar cambiar publicación de recurso ajeno: denegado.
9. Repetir importación del mismo origen: 409, sin duplicación.
10. Otorgar/reactivar licencia en colegio inactivo: 409.
11. Otorgar dos licencias superpuestas: 409; permitir períodos contiguos.
12. Confirmar que no se modifica la portada pública.
13. Asignar, desactivar y reactivar licencias individuales desde el panel de superadministrador; impedir solapamientos.
14. Verificar que cuentas individuales existentes sin licencia pedagógica explícita no obtengan acceso por su sola suscripción.
15. Antes del despliegue, definir asignación controlada a suscriptores pedagógicos existentes, sin incluir productos exclusivamente SIMCE/PAES.

## 4. Criterios de liberación
- Todos los checks de GitHub Actions en verde **para el HEAD exacto** del PR.
- Matriz de perfiles ejecutada en ambiente aislado y resultados registrados.
- Migración probada contra copia compatible de la base existente.
- Respaldo, reversión y responsable de despliegue definidos.
- Solo entonces evaluar fusionar y desplegar. **Este documento no autoriza el despliegue.**
