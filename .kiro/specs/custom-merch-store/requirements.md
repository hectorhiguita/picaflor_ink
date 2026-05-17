# Documento de Requisitos — Picaflor Ink

## Introducción

**Picaflor Ink** (dominio: picaflorink.shop) es una tienda de comercio electrónico para la venta de productos personalizados bajo el modelo print-on-demand, con técnica de impresión DTF (Direct to Film). El catálogo inicial incluye camisetas de algodón ($40.000 COP), camisetas de tela fría ($45.000 COP) y mugs blancos 11oz ($15.000 COP). El público objetivo son fanáticos de anime, videojuegos, programadores y música, con operación inicial en Medellín y el Área Metropolitana (Colombia).

Los clientes pueden elegir diseños del catálogo predefinido (p. ej. Guns N' Roses, Mafalda, Soda Stereo) o subir su propio diseño en PNG sin fondo. También pueden seleccionar color de prenda, talla, posición del diseño y agregar texto con fuentes variadas.

**Identidad visual:** La marca Picaflor Ink se identifica con un logo de colibrí multicolor vibrante con tipografía script "Picaflor" y sans-serif "INK", disponible en versión sobre fondo negro y versión sobre fondo blanco. La paleta de colores es negro, blanco, magenta (#FF0090), cyan (#00CFFF), verde (#00E676) y amarillo (#FFD600), con una estética energética de "splashes de pintura". El sitio usa **dark mode vibrante**: fondo negro/oscuro con acentos de colores neón.

**Canales de contacto:** WhatsApp 3223684981 · Facebook: Picaflor Ink · Instagram: @picaflor.ink

El sitio se construirá con Next.js, TypeScript, PostgreSQL y AWS, priorizando SEO, rendimiento y diseño responsive.

---

## Glosario

- **Store**: El sistema de tienda en línea completo (picaflorink.shop).
- **Customer**: Usuario final que navega, personaliza y compra productos.
- **Admin**: Operador del negocio con acceso al panel de administración.
- **Product**: Artículo físico disponible para personalizar y comprar (camiseta de algodón, camiseta de tela fría, mug, etc.).
- **Variant**: Combinación específica de color y talla de un Product.
- **Mockup_Generator**: Módulo interactivo que permite al Customer previsualizar el diseño sobre el Product.
- **Design_Layer**: Imagen PNG sin fondo o texto que el Customer coloca sobre el Product en el Mockup_Generator.
- **Design_Catalog**: Catálogo de diseños predefinidos gestionado por el Admin, que los Customers pueden seleccionar directamente (p. ej. Guns N' Roses, Mafalda, Soda Stereo).
- **Brand_Identity**: Identidad visual de Picaflor Ink, compuesta por el logo de colibrí multicolor, la paleta de colores neón (magenta, cyan, verde, amarillo) sobre fondo negro, y la estética de "splashes de pintura".
- **Cart**: Contenedor temporal de los ítems seleccionados por el Customer antes de pagar.
- **Order**: Registro de una compra confirmada y pagada.
- **Payment_Gateway**: Servicio externo de procesamiento de pagos (Wompi).
- **CTA_Button**: Botón de llamado a la acción que abre una conversación de WhatsApp con el número 3223684981.
- **Gallery**: Sección pública que muestra el catálogo de Products disponibles.
- **Admin_Panel**: Interfaz privada para que el Admin gestione el Store.
- **SEO_Module**: Conjunto de metadatos, sitemaps y configuraciones para posicionamiento en buscadores.
- **Social_Feed**: Integración que muestra publicaciones de redes sociales (Instagram @picaflor.ink, Facebook Picaflor Ink) dentro del Store.

---

## Requisitos

### Requisito 1: Galería de Productos

**User Story:** Como Customer, quiero explorar el catálogo de productos disponibles con sus variantes de color y talla, para poder elegir el artículo que deseo personalizar.

#### Criterios de Aceptación

1. THE Gallery SHALL mostrar todos los Products activos con imagen representativa, nombre, precio base en COP y variantes disponibles.
2. WHEN el Customer selecciona un Product, THE Store SHALL navegar a la página de detalle del Product con todas sus Variants.
3. THE Gallery SHALL permitir filtrar Products por categoría (camisetas algodón, camisetas tela fría, mugs, otros).
4. THE Gallery SHALL permitir ordenar Products por precio ascendente, precio descendente y más recientes.
5. WHEN la Gallery contiene más de 20 Products, THE Gallery SHALL implementar paginación o carga infinita para no degradar el rendimiento de la página.
6. THE Store SHALL renderizar la Gallery con Server-Side Rendering (SSR) o Static Site Generation (SSG) para garantizar indexación por motores de búsqueda.

---

### Requisito 2: Catálogo de Diseños Predefinidos

**User Story:** Como Customer, quiero elegir un diseño del catálogo de Picaflor Ink, para personalizar mi producto sin necesidad de tener un archivo propio.

#### Criterios de Aceptación

1. THE Store SHALL mostrar el Design_Catalog como una sección navegable dentro del flujo de personalización del Product.
2. THE Design_Catalog SHALL mostrar cada diseño con una imagen de previsualización, nombre y categoría (p. ej. música, caricaturas, cultura pop).
3. WHEN el Customer selecciona un diseño del Design_Catalog, THE Mockup_Generator SHALL cargar ese diseño como Design_Layer sobre el Product seleccionado.
4. THE Design_Catalog SHALL permitir al Customer buscar diseños por nombre o filtrar por categoría.
5. THE Admin_Panel SHALL permitir al Admin agregar, editar y desactivar diseños del Design_Catalog con nombre, categoría e imagen PNG sin fondo.
6. WHEN el Admin desactiva un diseño del Design_Catalog, THE Store SHALL dejar de mostrarlo a los Customers sin eliminar los Orders existentes que lo referencian.
7. THE Design_Catalog SHALL soportar al menos 200 diseños activos simultáneamente sin degradar el rendimiento de la página de personalización.

---

### Requisito 3: Generador de Mockups Interactivo

**User Story:** Como Customer, quiero personalizar visualmente un producto antes de comprarlo, para asegurarme de que el resultado final sea el que deseo.

#### Criterios de Aceptación

1. WHEN el Customer accede a la página de un Product, THE Mockup_Generator SHALL mostrar una previsualización del Product en el color de Variant seleccionado por defecto.
2. WHEN el Customer selecciona una Variant de color diferente, THE Mockup_Generator SHALL actualizar la previsualización del Product en menos de 500ms sin recargar la página.
3. WHEN el Customer selecciona un diseño del Design_Catalog, THE Mockup_Generator SHALL superponer ese diseño como Design_Layer sobre la previsualización del Product.
4. WHEN el Customer sube un archivo PNG sin fondo, THE Mockup_Generator SHALL superponer la imagen como Design_Layer sobre la previsualización del Product.
5. IF el archivo subido no es de tipo PNG, THEN THE Mockup_Generator SHALL mostrar un mensaje de error indicando que solo se aceptan archivos PNG.
6. IF el archivo PNG supera 10 MB, THEN THE Mockup_Generator SHALL mostrar un mensaje de error indicando el límite de tamaño permitido.
7. THE Mockup_Generator SHALL permitir al Customer redimensionar el Design_Layer mediante controles de escala con un rango de 10% a 200% del tamaño original.
8. THE Mockup_Generator SHALL permitir al Customer reposicionar el Design_Layer arrastrándolo (drag-and-drop) dentro del área imprimible del Product.
9. THE Mockup_Generator SHALL permitir al Customer elegir la posición predefinida del diseño: pecho frontal, espalda o manga (donde aplique según el Product).
10. THE Mockup_Generator SHALL ofrecer un campo de texto para que el Customer agregue texto personalizado como Design_Layer adicional.
11. WHEN el Customer agrega texto, THE Mockup_Generator SHALL ofrecer al menos 8 fuentes tipográficas distintas para seleccionar.
12. THE Mockup_Generator SHALL permitir al Customer cambiar el color del texto mediante un selector de color.
13. THE Mockup_Generator SHALL permitir al Customer redimensionar y reposicionar el texto de la misma forma que una imagen Design_Layer.
14. WHEN el Customer confirma el diseño, THE Mockup_Generator SHALL generar una imagen de previsualización final que se adjuntará al ítem del Cart.

---

### Requisito 4: Carrito de Compras

**User Story:** Como Customer, quiero agregar productos personalizados a un carrito y gestionar mi selección antes de pagar, para tener control sobre mi pedido.

#### Criterios de Aceptación

1. WHEN el Customer confirma el diseño en el Mockup_Generator, THE Cart SHALL agregar el ítem con la Variant seleccionada, la imagen de previsualización y el precio correspondiente en COP.
2. THE Cart SHALL permitir al Customer modificar la cantidad de cada ítem con un mínimo de 1 unidad.
3. WHEN el Customer reduce la cantidad de un ítem a 0, THE Cart SHALL eliminar ese ítem del Cart.
4. THE Cart SHALL mostrar el subtotal por ítem y el total acumulado en pesos colombianos (COP).
5. THE Cart SHALL persistir su contenido durante la sesión del navegador, de modo que al recargar la página los ítems no se pierdan.
6. WHEN el Cart está vacío, THE Store SHALL mostrar un mensaje indicando que el Cart no tiene ítems y un enlace para continuar comprando.
7. THE Cart SHALL mostrar un resumen del pedido antes de proceder al pago, incluyendo imagen de previsualización, nombre del Product, Variant, cantidad y precio unitario.

---

### Requisito 5: Proceso de Pago con Wompi

**User Story:** Como Customer, quiero pagar mi pedido de forma segura usando Wompi, para completar mi compra con los métodos de pago disponibles en Colombia.

#### Criterios de Aceptación

1. WHEN el Customer inicia el proceso de pago, THE Store SHALL recopilar nombre completo, correo electrónico, teléfono y dirección de entrega dentro de Medellín y Área Metropolitana.
2. IF algún campo obligatorio del formulario de pago está vacío o tiene formato inválido, THEN THE Store SHALL mostrar un mensaje de error descriptivo junto al campo correspondiente sin enviar el formulario.
3. WHEN el Customer confirma los datos y procede al pago, THE Payment_Gateway SHALL procesar la transacción mediante la API de Wompi.
4. WHEN el Payment_Gateway confirma el pago exitoso, THE Store SHALL crear un Order con estado "confirmado" y enviar un correo de confirmación al Customer con el resumen del pedido.
5. IF el Payment_Gateway retorna un error de pago, THEN THE Store SHALL mostrar un mensaje de error descriptivo al Customer y permitirle reintentar sin perder los datos del Cart.
6. THE Store SHALL mostrar una página de confirmación con el número de Order y el resumen del pedido tras un pago exitoso.
7. THE Store SHALL procesar todos los pagos en pesos colombianos (COP).
8. THE Payment_Gateway SHALL comunicarse con Wompi exclusivamente mediante HTTPS para proteger los datos del Customer.

---

### Requisito 6: Gestión de Cuentas de Cliente

**User Story:** Como Customer, quiero poder crear una cuenta o comprar como invitado, para tener flexibilidad al momento de comprar y poder consultar mis pedidos anteriores.

#### Criterios de Aceptación

1. THE Store SHALL permitir al Customer completar una compra sin crear una cuenta (modo invitado).
2. THE Store SHALL permitir al Customer registrarse con correo electrónico y contraseña.
3. WHEN el Customer se registra, THE Store SHALL enviar un correo de verificación de dirección de email.
4. IF el Customer intenta registrarse con un correo ya existente, THEN THE Store SHALL mostrar un mensaje indicando que el correo ya está en uso.
5. WHEN el Customer inicia sesión, THE Store SHALL mostrar el historial de sus Orders con estado actualizado.
6. THE Store SHALL permitir al Customer iniciar sesión con su cuenta de Google como alternativa al registro por correo.
7. WHILE el Customer tiene sesión activa, THE Store SHALL mantener el Cart sincronizado con su cuenta.

---

### Requisito 7: Botón de Llamado a la Acción (WhatsApp)

**User Story:** Como Customer, quiero poder contactar fácilmente a Picaflor Ink por WhatsApp, para resolver dudas sobre productos, pedidos o personalización.

#### Criterios de Aceptación

1. THE Store SHALL mostrar un CTA_Button flotante de WhatsApp visible en todas las páginas del sitio.
2. WHEN el Customer hace clic en el CTA_Button, THE Store SHALL abrir WhatsApp Web o la aplicación móvil dirigido al número 3223684981 con un mensaje predefinido configurable por el Admin.
3. THE CTA_Button SHALL ser visible en dispositivos móviles y de escritorio sin obstruir el contenido principal de la página.
4. THE Admin_Panel SHALL permitir al Admin configurar el número de teléfono y el mensaje predefinido del CTA_Button.

---

### Requisito 8: Panel de Administración

**User Story:** Como Admin, quiero gestionar productos, diseños del catálogo, pedidos, clientes y configuraciones del sitio desde un panel centralizado, para operar Picaflor Ink de forma eficiente.

#### Criterios de Aceptación

1. THE Admin_Panel SHALL requerir autenticación con credenciales de Admin para acceder.
2. IF un usuario no autenticado intenta acceder al Admin_Panel, THEN THE Store SHALL redirigirlo a la página de inicio de sesión.
3. THE Admin_Panel SHALL permitir al Admin crear, editar y desactivar Products con nombre, descripción, categoría, precio base en COP, técnica de impresión (DTF), imágenes base de mockup y Variants disponibles.
4. THE Admin_Panel SHALL permitir al Admin subir y reemplazar las imágenes base de mockup para cada Product y Variant de color.
5. THE Admin_Panel SHALL permitir al Admin agregar, editar y desactivar diseños del Design_Catalog con nombre, categoría e imagen PNG sin fondo.
6. THE Admin_Panel SHALL mostrar una lista de Orders con filtros por estado (pendiente, en producción, enviado, entregado, cancelado).
7. WHEN el Admin actualiza el estado de un Order, THE Store SHALL enviar una notificación por correo electrónico al Customer con el nuevo estado.
8. THE Admin_Panel SHALL mostrar una lista de Customers registrados con su información de contacto e historial de Orders.
9. THE Admin_Panel SHALL mostrar un dashboard con métricas de ventas: total de ventas del período, número de Orders por estado y productos más vendidos.
10. THE Admin_Panel SHALL permitir al Admin crear, editar y desactivar cupones de descuento con porcentaje o valor fijo, fecha de expiración y límite de usos.
11. WHEN el Customer aplica un cupón en el Cart, THE Store SHALL validar que el cupón esté activo, no haya expirado y no haya superado el límite de usos antes de aplicar el descuento.
12. THE Admin_Panel SHALL permitir al Admin configurar el costo de envío por zona o de forma fija cuando se defina un proveedor de última milla.
13. THE Admin_Panel SHALL permitir al Admin configurar el número de WhatsApp y el mensaje predefinido del CTA_Button.

---

### Requisito 9: Identidad Visual y Experiencia de Marca

**User Story:** Como Admin, quiero que el sitio refleje fielmente la Brand_Identity de Picaflor Ink, para que los Customers reconozcan la marca y vivan una experiencia coherente con su estética.

#### Criterios de Aceptación

1. THE Store SHALL aplicar el modo oscuro (dark mode) como tema predeterminado, usando fondo negro/oscuro con acentos de colores neón (magenta #FF0090, cyan #00CFFF, verde #00E676, amarillo #FFD600).
2. THE Store SHALL mostrar el logo de Picaflor Ink (colibrí multicolor con tipografía script "Picaflor" y sans-serif "INK") en el encabezado de todas las páginas, usando la versión sobre fondo negro.
3. THE Store SHALL incluir elementos visuales de "splashes de pintura" en la paleta de colores de la Brand_Identity en secciones destacadas como el hero de la página de inicio y encabezados de categoría.
4. THE Store SHALL mostrar los enlaces a redes sociales de Picaflor Ink (Instagram @picaflor.ink, Facebook Picaflor Ink) en el pie de página de todas las páginas.
5. THE Store SHALL ser completamente responsive y funcional en resoluciones desde 320px hasta 2560px de ancho, preservando la Brand_Identity en todos los tamaños de pantalla.

---

### Requisito 10: SEO y Rendimiento

**User Story:** Como Admin, quiero que el sitio esté optimizado para motores de búsqueda y cargue rápidamente, para atraer tráfico orgánico y ofrecer una buena experiencia al Customer.

#### Criterios de Aceptación

1. THE SEO_Module SHALL generar metaetiquetas únicas (title, description, og:image) para cada página de Product y categoría, incluyendo el nombre "Picaflor Ink" en los títulos.
2. THE SEO_Module SHALL generar un sitemap.xml actualizado automáticamente cuando se creen o modifiquen Products o diseños del Design_Catalog.
3. THE SEO_Module SHALL generar un archivo robots.txt que permita la indexación de páginas públicas y bloquee el Admin_Panel.
4. THE Store SHALL alcanzar una puntuación de rendimiento de al menos 85 en Google Lighthouse para páginas de Product en dispositivos móviles.
5. THE Store SHALL implementar lazy loading para imágenes de la Gallery, del Design_Catalog y del Mockup_Generator.
6. THE Store SHALL servir imágenes en formato WebP con fallback a PNG para optimizar el tiempo de carga.

---

### Requisito 11: Integración con Redes Sociales

**User Story:** Como Admin, quiero mostrar publicaciones de Instagram dentro del sitio, para generar confianza y mostrar productos reales a los Customers.

#### Criterios de Aceptación

1. THE Social_Feed SHALL mostrar las publicaciones más recientes del perfil de Instagram @picaflor.ink en una sección de la página de inicio.
2. THE Social_Feed SHALL mostrar un enlace al perfil de Facebook "Picaflor Ink" en el pie de página.
3. WHEN las APIs de redes sociales no están disponibles, THE Social_Feed SHALL mostrar el contenido en caché más reciente disponible sin mostrar errores al Customer.
4. THE Social_Feed SHALL actualizarse automáticamente con nuevas publicaciones en un intervalo máximo de 24 horas.

---

### Requisito 12: Gestión de Envíos

**User Story:** Como Admin, quiero gestionar los costos y zonas de envío de forma flexible, para adaptarme a los proveedores de última milla que contrate en el futuro.

#### Criterios de Aceptación

1. THE Admin_Panel SHALL permitir al Admin configurar tarifas de envío fijas o por zona geográfica dentro de Medellín y el Área Metropolitana.
2. WHEN el Customer ingresa su dirección de entrega, THE Store SHALL calcular y mostrar el costo de envío correspondiente antes de confirmar el pago.
3. THE Store SHALL mostrar el costo de envío como ítem separado en el resumen del Cart y en la página de confirmación del Order.
4. WHERE el Admin no haya configurado una tarifa de envío, THE Store SHALL mostrar el costo de envío como "Por confirmar" y notificar al Customer que será contactado para coordinar el envío.
