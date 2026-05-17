# Plan de Implementación — Picaflor Ink

## Phase 0: Project Foundation

- [x] 1. Inicializar la aplicación Next.js con TypeScript
  - Crear estructura base con App Router.
  - Configurar linting, formatting y scripts de desarrollo.
  - Definir estructura de carpetas para `app`, `components`, `lib`, `server`, `styles` y `tests`.
  - _Requirements: 1, 9, 10_

- [x] 2. Configurar sistema visual base de Picaflor Ink
  - Definir tokens de color, tipografía, spacing y estados interactivos.
  - Implementar layout público con header, footer, logo y enlaces sociales.
  - Implementar dark mode como tema predeterminado.
  - _Requirements: 7, 9_

- [x] 3. Configurar PostgreSQL y ORM
  - Instalar ORM seleccionado.
  - Crear migraciones iniciales para usuarios, productos, variantes, diseños, carrito, órdenes, cupones, envío y settings.
  - Crear seed inicial con camisetas de algodón, camisetas de tela fría y mugs.
  - _Requirements: 1, 2, 4, 5, 6, 8, 12_

## Phase 1: Public Catalog

- [x] 4. Implementar modelo y APIs de catálogo de productos
  - Crear consultas para productos activos, categorías y variantes.
  - Agregar filtros por categoría, orden por precio y fecha.
  - Preparar paginación para más de 20 productos.
  - _Requirements: 1_

- [x] 5. Construir galería pública de productos
  - Mostrar imagen, nombre, precio COP y variantes disponibles.
  - Implementar filtros, ordenamiento y paginación/carga incremental.
  - Asegurar SSR/SSG/ISR para indexación.
  - _Requirements: 1, 10_

- [x] 6. Construir página de detalle de producto
  - Mostrar descripción, precio, variantes, mockups base y CTA para personalizar.
  - Generar metadata SEO por producto.
  - _Requirements: 1, 10_

- [x] 7. Implementar páginas de categoría
  - Crear rutas indexables por categoría.
  - Generar metadata y listados filtrados.
  - _Requirements: 1, 10_

## Phase 2: Design Catalog

- [x] 8. Implementar modelo y APIs del catálogo de diseños
  - Consultar diseños activos por nombre y categoría.
  - Soportar al menos 200 diseños activos con paginación o virtualización.
  - _Requirements: 2_

- [x] 9. Construir selector público de diseños
  - Mostrar preview, nombre y categoría.
  - Agregar búsqueda y filtros.
  - Integrarlo al flujo del personalizador.
  - _Requirements: 2, 3_

## Phase 3: Mockup Generator

- [x] 10. Elegir e integrar motor de edición visual
  - Instalar Fabric.js, Konva o alternativa equivalente.
  - Crear componente cliente aislado para evitar cargarlo en páginas públicas que no lo usan.
  - _Requirements: 3, 10_

- [x] 11. Renderizar producto y variantes en el personalizador
  - Mostrar mockup base del producto seleccionado.
  - Cambiar color/variant en menos de 500ms sin recargar página.
  - Respetar áreas imprimibles por posición.
  - _Requirements: 3_

- [x] 12. Integrar diseños predefinidos como capas
  - Cargar diseño seleccionado sobre el producto.
  - Permitir mover, escalar y eliminar la capa dentro del área imprimible.
  - _Requirements: 2, 3_

- [x] 13. Implementar upload de PNG personalizado
  - Validar MIME/extensión PNG.
  - Rechazar archivos mayores a 10 MB.
  - Subir asset al storage.
  - Mostrar errores descriptivos.
  - _Requirements: 3_

- [x] 14. Implementar texto personalizado
  - Agregar capa de texto editable.
  - Ofrecer mínimo 8 fuentes.
  - Permitir color, tamaño, escala y posición.
  - _Requirements: 3_

- [x] 15. Exportar preview final del mockup
  - Serializar `customizationJson`.
  - Generar imagen de previsualización final.
  - Adjuntar preview y configuración al item del carrito.
  - _Requirements: 3, 4_

## Phase 4: Cart And Checkout

- [x] 16. Implementar carrito persistente
  - Crear estado de carrito por sesión.
  - Persistir items al recargar.
  - Sincronizar con cuenta cuando el usuario inicia sesión.
  - _Requirements: 4, 6_

- [x] 17. Construir pantalla de carrito
  - Mostrar preview, producto, variante, cantidad, precio unitario, subtotales y total COP.
  - Permitir actualizar cantidad y eliminar items.
  - Mostrar estado vacío con enlace para continuar comprando.
  - _Requirements: 4_

- [x] 18. Implementar cupones
  - Crear validación server-side de activo, expiración y límite de uso.
  - Aplicar descuento al resumen del carrito.
  - _Requirements: 8_

- [x] 19. Implementar cálculo de envío
  - Crear tarifas fijas o por zona.
  - Mostrar costo separado en carrito/checkout.
  - Soportar estado “Por confirmar”.
  - _Requirements: 12_

- [x] 20. Construir formulario de checkout
  - Recopilar nombre, correo, teléfono y dirección.
  - Validar campos requeridos y formatos.
  - Mantener datos si ocurre error de pago.
  - _Requirements: 5, 12_

## Phase 5: Payments And Orders

- [x] 21. Integrar Wompi
  - Configurar llaves por ambiente.
  - Crear sesión o referencia de pago por HTTPS.
  - Recalcular totales en servidor.
  - _Requirements: 5_

- [x] 22. Implementar webhook de Wompi
  - Verificar firma del evento.
  - Confirmar órdenes pagadas.
  - Registrar referencia de pago y fecha.
  - _Requirements: 5_

- [x] 23. Crear confirmación de orden
  - Mostrar número de orden y resumen.
  - Enviar email de confirmación.
  - Limpiar carrito tras pago confirmado.
  - _Requirements: 5_

- [x] 24. Implementar historial de pedidos del cliente
  - Permitir compra como invitado.
  - Mostrar órdenes de usuarios autenticados.
  - _Requirements: 6_

## Phase 6: Authentication

- [x] 25. Implementar registro e inicio de sesión
  - Soportar email/password.
  - Enviar correo de verificación.
  - Validar correo duplicado.
  - _Requirements: 6_

- [x] 26. Implementar login con Google
  - Configurar OAuth.
  - Vincular usuario con historial y carrito.
  - _Requirements: 6_

- [x] 27. Implementar roles y protección de rutas
  - Crear rol `ADMIN`.
  - Redirigir usuarios no autenticados fuera de `/admin`.
  - Bloquear clientes sin permisos.
  - _Requirements: 8_

## Phase 7: Admin Panel

- [x] 28. Construir layout y dashboard admin
  - Mostrar ventas del período, órdenes por estado y productos más vendidos.
  - Crear navegación operativa.
  - _Requirements: 8_

- [x] 29. Implementar CRUD de productos
  - Crear, editar y desactivar productos.
  - Gestionar categoría, descripción, precio COP, técnica DTF, mockups y variantes.
  - _Requirements: 8_

- [x] 30. Implementar CRUD de diseños
  - Crear, editar y desactivar diseños.
  - Subir PNG sin fondo.
  - Evitar mostrar diseños desactivados sin borrar referencias históricas.
  - _Requirements: 2, 8_

- [x] 31. Implementar gestión de órdenes
  - Listar y filtrar por estado.
  - Actualizar estado.
  - Enviar email al cliente cuando cambia el estado.
  - _Requirements: 8_

- [x] 32. Implementar gestión de clientes
  - Listar clientes registrados.
  - Mostrar contacto e historial de pedidos.
  - _Requirements: 8_

- [x] 33. Implementar gestión de cupones
  - Crear, editar y desactivar cupones.
  - Configurar porcentaje, valor fijo, expiración y límite.
  - _Requirements: 8_

- [x] 34. Implementar configuración de envíos
  - Crear tarifas por zona o tarifa fija.
  - Permitir precio pendiente por confirmar.
  - _Requirements: 8, 12_

- [x] 35. Implementar configuración del CTA WhatsApp
  - Configurar número y mensaje.
  - Renderizar botón flotante en todas las páginas.
  - _Requirements: 7, 8_

## Phase 8: SEO, Social And Performance

- [x] 36. Implementar SEO module
  - Metadata por producto y categoría.
  - `sitemap.xml` dinámico.
  - `robots.txt` con bloqueo de `/admin`.
  - Datos estructurados.
  - _Requirements: 10_

- [x] 37. Implementar social feed
  - Mostrar publicaciones recientes de Instagram.
  - Cachear contenido y refrescar cada 24 horas.
  - Mostrar fallback si la API falla.
  - Incluir Facebook en footer.
  - _Requirements: 11_

- [x] 38. Optimizar imágenes y carga
  - Usar lazy loading en galería, catálogo y mockup.
  - Servir WebP con fallback PNG.
  - Revisar bundle splitting del editor.
  - _Requirements: 10_

- [x] 39. Validar responsive y experiencia de marca
  - Probar desde 320px hasta 2560px.
  - Verificar que CTA no obstruya contenido.
  - Ajustar splashes, logo y contraste.
  - _Requirements: 7, 9_

## Phase 9: Testing And Release

- [x] 40. Agregar pruebas unitarias
  - Validar cálculos de totales, cupones, envío y serialización del mockup.
  - Validar reglas de upload PNG.
  - _Requirements: 3, 4, 8, 12_

- [x] 41. Agregar pruebas de integración
  - Cubrir APIs de catálogo, diseños, carrito, checkout, órdenes y admin.
  - Simular webhooks Wompi.
  - _Requirements: 1, 2, 4, 5, 8_

- [ ] 42. Agregar pruebas E2E críticas
  - Flujo catálogo → personalización → carrito → checkout.
  - Flujo login/registro.
  - Flujo admin para producto, diseño y cambio de estado de orden.
  - _Requirements: 1, 2, 3, 4, 5, 6, 8_

- [ ] 43. Ejecutar auditoría Lighthouse
  - Medir home y página de producto en móvil.
  - Ajustar hasta alcanzar 85+ en producto.
  - _Requirements: 10_

- [x] 44. Preparar despliegue
  - Configurar variables de entorno.
  - Preparar migraciones production.
  - Configurar storage, dominio, CDN y email.
  - _Requirements: 5, 10_

- [x] 45. Hacer checklist de lanzamiento
  - Verificar pagos Wompi en ambiente correspondiente.
  - Verificar correos.
  - Verificar robots/sitemap.
  - Verificar WhatsApp, redes y datos de contacto.
  - _Requirements: 5, 7, 10, 11_
