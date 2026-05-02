# Guia de aceptacion de cambios - Reservas Monkey

## Objetivo de esta etapa
Implementar la experiencia de reservas con mayor puesta en escena y personalizacion, manteniendo el ADN actual del sistema:
- Validacion de datos y capacidad
- Flujo de QR
- Correo al cliente
- Notificacion al equipo admin

## Requerimientos cerrados desde la conversacion del cliente
- Existira un link maestro de reservas para todas las publicaciones.
- El link maestro debe mostrar 3 caminos claros y sin confusion:
- Reserva fin de semana (mesa normal).
- Reserva show (evento puntual, por ejemplo Selena o La Gran Magia).
- Reserva cumpleanos.
- Cada flyer/publicacion tambien puede abrir un link directo con tipo y evento preseleccionado.
- En todos los formularios se debe enfatizar el tipo de reserva para evitar uso incorrecto.
- Regla visible obligatoria: tolerancia maxima de 15 minutos, luego se pierde la reserva.
- En reservas pagadas debe existir comprobante y revision administrativa.
- En shows pagados no se debe permitir que un cumpleanos de monto fijo evite el cobro por persona del evento.
- Debe mantenerse la operacion actual: validaciones, correo, QR y trazabilidad de estados.

## Decisiones funcionales para la etapa 1 (lo que se construye primero)
- Construir y aprobar la pantalla link maestro con 3 botoneras.
- Definir copy y etiquetas comerciales exactas por boton.
- Agregar deep-link por flyer con preseleccion de tipo y slug de evento.
- Estandarizar campos base minimos solicitados por cliente:
- Nombre.
- Apellido.
- Cantidad de personas.
- Hora de llegada.
- Mantener email y telefono como obligatorios para notificaciones y operacion.
- Publicar texto de tolerancia de 15 minutos antes de enviar.

## Estado base actual (confirmado en codigo)
- Front de reservas principal en [app/reservas/page.tsx](app/reservas/page.tsx)
- Formulario base en [app/reservas/ReservaForm.tsx](app/reservas/ReservaForm.tsx)
- API de creacion en [app/api/reservas/route.ts](app/api/reservas/route.ts)

## Metodo de trabajo y aprobacion
Cada bloque se entrega con demo + checklist de aceptacion. No se pasa al siguiente bloque sin aprobacion explicita.

## Bloque 1 - Direccion de experiencia (puesta en escena)
### Alcance
- Definir concepto visual de Reservas alineado al ADN Monkey actual.
- Elevar narrativa visual sin romper identidad existente.
- Ajustar microcopy comercial por tipo de reserva (normal, show, cumpleanos).

### Criterios de aceptacion
- La pagina de reservas comunica claramente los 3 caminos de reserva en menos de 5 segundos.
- La experiencia en mobile se siente premium y legible (sin saltos, sin saturacion).
- Se mantiene coherencia visual con Home y flujo de eventos.

### Evidencia requerida
- Video corto (30-60 s) de navegacion mobile y desktop.
- Lista de cambios de copy.

## Bloque 2 - Personalizacion funcional
### Alcance
- Preguntas dinamicas segun tipo de reserva.
- Reglas de negocio visibles al usuario antes de enviar.
- Mensajeria contextual de precio, cupos, requerimientos y tiempos de confirmacion.
- Separar explicitamente reglas de cobro entre cumpleanos y show pagado.

### Criterios de aceptacion
- El formulario solo pide campos relevantes segun el tipo de reserva.
- Los errores son accionables y no bloquean sin explicacion.
- El usuario entiende si su estado queda aprobada, pendiente o comprobante_subido.
- Si el show tiene precio por persona, el sistema bloquea bypass por reserva de cumpleanos.
- El texto de tolerancia de 15 minutos aparece en normal y cumpleanos.

### Evidencia requerida
- Matriz de campos por tipo.
- 5 casos de prueba manual con resultado esperado.
- Casos de fraude simulado (cumpleanos intentando cubrir grupo de show pagado).

## Bloque 3 - ADN operativo (correo, QR, validacion)
### Alcance
- Verificar que el flujo de estados no se rompa.
- Mantener correo al cliente y notificacion al admin.
- Garantizar validaciones de capacidad para show.
- Preparar base para pasarela de pago (si se activa despues).

### Criterios de aceptacion
- Reserva tipo terraza: estado aprobada + correo exitoso.
- Reserva tipo show con cupos: respeta limites y mensajes de conflicto.
- Reserva con pago: exige comprobante cuando corresponda.
- No aparecen errores 500 en flujo feliz ni en errores esperados.
- Cuando corresponda QR, se mantiene validacion en scanner sin regresiones.

### Evidencia requerida
- Capturas de respuestas API por tipo.
- Confirmacion de envio de correos en logs.
- Prueba de punta a punta: crear reserva, emitir QR, validar QR.

## Bloque 3.5 - Modelo de mesas y capacidad (layout operativo)
### Alcance
- Levantar numeracion y capacidad real por salon junto a administracion.
- Definir convencion de rangos por zona (ejemplo: 100-199 terraza, 200-299 salon, etc.).
- Diseñar seleccion de mesas tipo cine para mostrar disponibilidad real por capacidad.
- Permitir sugerencia de mesa alternativa cuando no exista capacidad exacta (ejemplo: quedan mesas de 4 para reserva de 2).

### Criterios de aceptacion
- El sistema propone solo mesas compatibles con el tamano del grupo o combinacion permitida.
- Si no hay mesa exacta, muestra alternativa comercialmente util (upsell de capacidad).
- Admin puede entender rapidamente por que una mesa aparece disponible u ocupada.

### Evidencia requerida
- Plano inicial con IDs de mesa y capacidad por mesa.
- Demo navegable de seleccion de mesa.
- 10 escenarios de asignacion (2, 4, 6, 10 personas; cumpleanos y show).

## Bloque 4 - Valor agregado (nueva capa)
### Alcance
Seleccionar e implementar solo 1 o 2 mejoras de alto impacto en esta etapa:
- Confirmacion por WhatsApp con resumen de reserva en 1 click.
- Recomendador simple de horario o sector segun demanda.
- Upsell contextual (cumpleanos/show) sin friccion.
- Recordatorio previo al evento con CTA de cambios.
- Bloqueo inteligente de combinaciones de reserva que afecten margen del evento pagado.

### Criterios de aceptacion
- La mejora aporta conversion o claridad, no solo estetica.
- No aumenta friccion del formulario principal.
- Se puede medir con metricas basicas.

### Evidencia requerida
- Hipotesis de impacto + metrica.
- Resultado del primer test interno.

## Bloque 5 - QA y salida controlada
### Alcance
- QA funcional mobile/desktop.
- Prueba de regresion en rutas de reservas.
- Validacion de performance basica y errores.

### Criterios de aceptacion
- Cero bloqueantes P0/P1.
- Sin regresion en creacion de reserva ni estados.
- Tiempo de respuesta aceptable en flujo principal.

### Evidencia requerida
- Checklist QA firmado.
- Registro de incidencias y resolucion.

## Checklist de aprobacion por reunion
- Objetivo del bloque cumplido.
- Criterios de aceptacion cumplidos.
- Evidencia presentada.
- Riesgos detectados y plan de mitigacion.
- Decision del cliente: Aprobar / Ajustar / Rechazar.
- Fecha y responsable de siguiente entrega.

## Gate de aprobacion inmediata (orden sugerido)
- Gate A: Link maestro + 3 botoneras + copies + tolerancia de 15 minutos.
- Gate B: Formularios por tipo y reglas anti-confusion/anti-bypass.
- Gate C: Operacion completa (correo, QR, validaciones, comprobantes).
- Gate D: Layout de mesas y logica de disponibilidad tipo cine.
- Gate E: Valor agregado y medicion.

## Riesgos que deben quedar controlados
- Confundir cumpleanos con show pagado y perder ingresos por persona.
- No mostrar reglas de tolerancia y generar reclamos en puerta.
- No contar con numeracion/capacidad real de mesas para el layout operativo.
- Sobrecargar UX en mobile con demasiadas decisiones en un solo paso.
