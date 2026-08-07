insert into public.questionnaire_templates (
  template_key,
  title,
  description,
  booking_type,
  event_type,
  definition,
  is_default,
  is_active
)
values
(
  'new_booking',
  'New Booking Questionnaire',
  'Default intake template for direct bookings.',
  'direct',
  null,
  $$
  {
    "sections": [
      {
        "description": { "en": "Client details and contact fields.", "es": "Datos del cliente y campos de contacto." },
        "questions": [
          { "fieldKey": "client.legalFirstName", "helper": { "en": "", "es": "" }, "label": { "en": "Legal First Name", "es": "Nombre Legal" }, "required": true, "type": "text" },
          { "fieldKey": "client.legalLastName", "helper": { "en": "", "es": "" }, "label": { "en": "Legal Last Name", "es": "Apellido Legal" }, "required": true, "type": "text" },
          { "fieldKey": "client.address", "helper": { "en": "", "es": "" }, "label": { "en": "Address", "es": "Dirección" }, "required": false, "type": "textarea" },
          { "fieldKey": "client.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Phone", "es": "Teléfono" }, "required": false, "type": "text" },
          { "fieldKey": "client.instagram", "helper": { "en": "", "es": "" }, "label": { "en": "Instagram", "es": "Instagram" }, "required": false, "type": "text" },
          { "fieldKey": "client.facebook", "helper": { "en": "", "es": "" }, "label": { "en": "Facebook", "es": "Facebook" }, "required": false, "type": "text" },
          { "fieldKey": "client.preferredCommunicationMethod", "helper": { "en": "", "es": "" }, "label": { "en": "Preferred Communication", "es": "Comunicación Preferida" }, "required": false, "type": "select" },
          { "fieldKey": "client.additionalClients", "helper": { "en": "", "es": "" }, "label": { "en": "Additional Clients", "es": "Clientes Adicionales" }, "required": false, "type": "repeatable" }
        ],
        "title": { "en": "Client", "es": "Cliente" }
      },
      {
        "description": { "en": "Event timing and service details.", "es": "Horario y detalles del servicio." },
        "questions": [
          { "fieldKey": "event.eventName", "helper": { "en": "", "es": "" }, "label": { "en": "Event Name", "es": "Nombre del Evento" }, "required": false, "type": "text" },
          { "fieldKey": "event.serviceStartTime", "helper": { "en": "", "es": "" }, "label": { "en": "Service Start Time", "es": "Hora de Inicio del Servicio" }, "required": false, "type": "time" },
          { "fieldKey": "event.serviceEndTime", "helper": { "en": "", "es": "" }, "label": { "en": "Service End Time", "es": "Hora de Fin del Servicio" }, "required": false, "type": "time" },
          { "fieldKey": "event.marqueeNames", "helper": { "en": "", "es": "" }, "label": { "en": "Marquee Names", "es": "Nombres para Marquee" }, "required": false, "type": "text" },
          { "fieldKey": "event.eventHashtags", "helper": { "en": "", "es": "" }, "label": { "en": "Event Hashtags", "es": "Hashtags del Evento" }, "required": false, "type": "text" },
          { "fieldKey": "event.serviceLocationDescription", "helper": { "en": "", "es": "" }, "label": { "en": "Service Location", "es": "Ubicación del Servicio" }, "required": false, "type": "textarea" }
        ],
        "title": { "en": "Event", "es": "Evento" }
      },
      {
        "description": { "en": "Venue and contact coordination.", "es": "Coordinación de venue y contacto." },
        "questions": [
          { "fieldKey": "venue.name", "helper": { "en": "", "es": "" }, "label": { "en": "Venue Name", "es": "Nombre del Venue" }, "required": false, "type": "text" },
          { "fieldKey": "venue.address", "helper": { "en": "", "es": "" }, "label": { "en": "Venue Address", "es": "Dirección del Venue" }, "required": false, "type": "textarea" },
          { "fieldKey": "venue.assignedContact.name", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Name", "es": "Nombre del Contacto" }, "required": false, "type": "text" },
          { "fieldKey": "venue.assignedContact.role", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Role", "es": "Rol del Contacto" }, "required": false, "type": "text" },
          { "fieldKey": "venue.assignedContact.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Phone", "es": "Teléfono del Contacto" }, "required": false, "type": "text" },
          { "fieldKey": "venue.assignedContact.email", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Email", "es": "Correo del Contacto" }, "required": false, "type": "email" },
          { "fieldKey": "venue.powerSupplyAccess", "helper": { "en": "", "es": "" }, "label": { "en": "Power Supply", "es": "Acceso a Corriente" }, "required": false, "type": "select" },
          { "fieldKey": "venue.powerSupplyNotes", "helper": { "en": "", "es": "" }, "label": { "en": "Power Notes", "es": "Notas de Corriente" }, "required": false, "type": "textarea" }
        ],
        "title": { "en": "Venue", "es": "Venue" }
      },
      {
        "description": { "en": "Primary planner details.", "es": "Datos del planner principal." },
        "questions": [
          { "fieldKey": "planner.company", "helper": { "en": "", "es": "" }, "label": { "en": "Company", "es": "Empresa" }, "required": false, "type": "text" },
          { "fieldKey": "planner.firstName", "helper": { "en": "", "es": "" }, "label": { "en": "First Name", "es": "Nombre" }, "required": false, "type": "text" },
          { "fieldKey": "planner.lastName", "helper": { "en": "", "es": "" }, "label": { "en": "Last Name", "es": "Apellido" }, "required": false, "type": "text" },
          { "fieldKey": "planner.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Phone", "es": "Teléfono" }, "required": false, "type": "text" },
          { "fieldKey": "planner.email", "helper": { "en": "", "es": "" }, "label": { "en": "Email", "es": "Correo" }, "required": false, "type": "email" },
          { "fieldKey": "planner.instagram", "helper": { "en": "", "es": "" }, "label": { "en": "Instagram", "es": "Instagram" }, "required": false, "type": "text" },
          { "fieldKey": "planner.facebook", "helper": { "en": "", "es": "" }, "label": { "en": "Facebook", "es": "Facebook" }, "required": false, "type": "text" },
          { "fieldKey": "planner.primaryEventContact", "helper": { "en": "", "es": "" }, "label": { "en": "Primary Contact", "es": "Contacto Principal" }, "required": false, "type": "select" }
        ],
        "title": { "en": "Planner", "es": "Planner" }
      },
      {
        "description": { "en": "Day-of coordinator details.", "es": "Datos del coordinador del evento." },
        "questions": [
          { "fieldKey": "coordinator.company", "helper": { "en": "", "es": "" }, "label": { "en": "Company", "es": "Empresa" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.firstName", "helper": { "en": "", "es": "" }, "label": { "en": "First Name", "es": "Nombre" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.lastName", "helper": { "en": "", "es": "" }, "label": { "en": "Last Name", "es": "Apellido" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Phone", "es": "Teléfono" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.email", "helper": { "en": "", "es": "" }, "label": { "en": "Email", "es": "Correo" }, "required": false, "type": "email" },
          { "fieldKey": "coordinator.instagram", "helper": { "en": "", "es": "" }, "label": { "en": "Instagram", "es": "Instagram" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.facebook", "helper": { "en": "", "es": "" }, "label": { "en": "Facebook", "es": "Facebook" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.primaryEventContact", "helper": { "en": "", "es": "" }, "label": { "en": "Primary Contact", "es": "Contacto Principal" }, "required": false, "type": "select" }
        ],
        "title": { "en": "Coordinator", "es": "Coordinador" }
      },
      {
        "description": { "en": "Additional booking notes.", "es": "Notas adicionales de la reserva." },
        "questions": [
          { "fieldKey": "additional.specialRequests", "helper": { "en": "", "es": "" }, "label": { "en": "Special Requests", "es": "Solicitudes Especiales" }, "required": false, "type": "textarea" },
          { "fieldKey": "additional.operationalNotes", "helper": { "en": "", "es": "" }, "label": { "en": "Operational Notes", "es": "Notas Operativas" }, "required": false, "type": "textarea" }
        ],
        "title": { "en": "Additional", "es": "Adicional" }
      }
    ]
  }
  $$::jsonb,
  true,
  true
),
(
  'pv_new_booking',
  'PV New Booking Questionnaire',
  'Default intake template for preferred vendor bookings.',
  'preferred_vendor',
  null,
  $$
  {
    "sections": [
      {
        "description": { "en": "Client details and contact fields.", "es": "Datos del cliente y campos de contacto." },
        "questions": [
          { "fieldKey": "client.legalFirstName", "helper": { "en": "", "es": "" }, "label": { "en": "Legal First Name", "es": "Nombre Legal" }, "required": true, "type": "text" },
          { "fieldKey": "client.legalLastName", "helper": { "en": "", "es": "" }, "label": { "en": "Legal Last Name", "es": "Apellido Legal" }, "required": true, "type": "text" },
          { "fieldKey": "client.address", "helper": { "en": "", "es": "" }, "label": { "en": "Address", "es": "Dirección" }, "required": false, "type": "textarea" },
          { "fieldKey": "client.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Phone", "es": "Teléfono" }, "required": false, "type": "text" },
          { "fieldKey": "client.instagram", "helper": { "en": "", "es": "" }, "label": { "en": "Instagram", "es": "Instagram" }, "required": false, "type": "text" },
          { "fieldKey": "client.facebook", "helper": { "en": "", "es": "" }, "label": { "en": "Facebook", "es": "Facebook" }, "required": false, "type": "text" },
          { "fieldKey": "client.preferredCommunicationMethod", "helper": { "en": "", "es": "" }, "label": { "en": "Preferred Communication", "es": "Comunicación Preferida" }, "required": false, "type": "select" },
          { "fieldKey": "client.additionalClients", "helper": { "en": "", "es": "" }, "label": { "en": "Additional Clients", "es": "Clientes Adicionales" }, "required": false, "type": "repeatable" }
        ],
        "title": { "en": "Client", "es": "Cliente" }
      },
      {
        "description": { "en": "Event timing and service details.", "es": "Horario y detalles del servicio." },
        "questions": [
          { "fieldKey": "event.eventName", "helper": { "en": "", "es": "" }, "label": { "en": "Event Name", "es": "Nombre del Evento" }, "required": false, "type": "text" },
          { "fieldKey": "event.serviceStartTime", "helper": { "en": "", "es": "" }, "label": { "en": "Service Start Time", "es": "Hora de Inicio del Servicio" }, "required": false, "type": "time" },
          { "fieldKey": "event.serviceEndTime", "helper": { "en": "", "es": "" }, "label": { "en": "Service End Time", "es": "Hora de Fin del Servicio" }, "required": false, "type": "time" },
          { "fieldKey": "event.marqueeNames", "helper": { "en": "", "es": "" }, "label": { "en": "Marquee Names", "es": "Nombres para Marquee" }, "required": false, "type": "text" },
          { "fieldKey": "event.eventHashtags", "helper": { "en": "", "es": "" }, "label": { "en": "Event Hashtags", "es": "Hashtags del Evento" }, "required": false, "type": "text" },
          { "fieldKey": "event.serviceLocationDescription", "helper": { "en": "", "es": "" }, "label": { "en": "Service Location", "es": "Ubicación del Servicio" }, "required": false, "type": "textarea" }
        ],
        "title": { "en": "Event", "es": "Evento" }
      },
      {
        "description": { "en": "Venue and contact coordination.", "es": "Coordinación de venue y contacto." },
        "questions": [
          { "fieldKey": "venue.name", "helper": { "en": "", "es": "" }, "label": { "en": "Venue Name", "es": "Nombre del Venue" }, "required": false, "type": "text" },
          { "fieldKey": "venue.address", "helper": { "en": "", "es": "" }, "label": { "en": "Venue Address", "es": "Dirección del Venue" }, "required": false, "type": "textarea" },
          { "fieldKey": "venue.assignedContact.name", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Name", "es": "Nombre del Contacto" }, "required": false, "type": "text" },
          { "fieldKey": "venue.assignedContact.role", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Role", "es": "Rol del Contacto" }, "required": false, "type": "text" },
          { "fieldKey": "venue.assignedContact.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Phone", "es": "Teléfono del Contacto" }, "required": false, "type": "text" },
          { "fieldKey": "venue.assignedContact.email", "helper": { "en": "", "es": "" }, "label": { "en": "Contact Email", "es": "Correo del Contacto" }, "required": false, "type": "email" },
          { "fieldKey": "venue.powerSupplyAccess", "helper": { "en": "", "es": "" }, "label": { "en": "Power Supply", "es": "Acceso a Corriente" }, "required": false, "type": "select" },
          { "fieldKey": "venue.powerSupplyNotes", "helper": { "en": "", "es": "" }, "label": { "en": "Power Notes", "es": "Notas de Corriente" }, "required": false, "type": "textarea" }
        ],
        "title": { "en": "Venue", "es": "Venue" }
      },
      {
        "description": { "en": "Primary planner details.", "es": "Datos del planner principal." },
        "questions": [
          { "fieldKey": "planner.company", "helper": { "en": "", "es": "" }, "label": { "en": "Company", "es": "Empresa" }, "required": false, "type": "text" },
          { "fieldKey": "planner.firstName", "helper": { "en": "", "es": "" }, "label": { "en": "First Name", "es": "Nombre" }, "required": false, "type": "text" },
          { "fieldKey": "planner.lastName", "helper": { "en": "", "es": "" }, "label": { "en": "Last Name", "es": "Apellido" }, "required": false, "type": "text" },
          { "fieldKey": "planner.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Phone", "es": "Teléfono" }, "required": false, "type": "text" },
          { "fieldKey": "planner.email", "helper": { "en": "", "es": "" }, "label": { "en": "Email", "es": "Correo" }, "required": false, "type": "email" },
          { "fieldKey": "planner.instagram", "helper": { "en": "", "es": "" }, "label": { "en": "Instagram", "es": "Instagram" }, "required": false, "type": "text" },
          { "fieldKey": "planner.facebook", "helper": { "en": "", "es": "" }, "label": { "en": "Facebook", "es": "Facebook" }, "required": false, "type": "text" },
          { "fieldKey": "planner.primaryEventContact", "helper": { "en": "", "es": "" }, "label": { "en": "Primary Contact", "es": "Contacto Principal" }, "required": false, "type": "select" }
        ],
        "title": { "en": "Planner", "es": "Planner" }
      },
      {
        "description": { "en": "Day-of coordinator details.", "es": "Datos del coordinador del evento." },
        "questions": [
          { "fieldKey": "coordinator.company", "helper": { "en": "", "es": "" }, "label": { "en": "Company", "es": "Empresa" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.firstName", "helper": { "en": "", "es": "" }, "label": { "en": "First Name", "es": "Nombre" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.lastName", "helper": { "en": "", "es": "" }, "label": { "en": "Last Name", "es": "Apellido" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.phone", "helper": { "en": "", "es": "" }, "label": { "en": "Phone", "es": "Teléfono" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.email", "helper": { "en": "", "es": "" }, "label": { "en": "Email", "es": "Correo" }, "required": false, "type": "email" },
          { "fieldKey": "coordinator.instagram", "helper": { "en": "", "es": "" }, "label": { "en": "Instagram", "es": "Instagram" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.facebook", "helper": { "en": "", "es": "" }, "label": { "en": "Facebook", "es": "Facebook" }, "required": false, "type": "text" },
          { "fieldKey": "coordinator.primaryEventContact", "helper": { "en": "", "es": "" }, "label": { "en": "Primary Contact", "es": "Contacto Principal" }, "required": false, "type": "select" }
        ],
        "title": { "en": "Coordinator", "es": "Coordinador" }
      },
      {
        "description": { "en": "Additional booking notes.", "es": "Notas adicionales de la reserva." },
        "questions": [
          { "fieldKey": "additional.specialRequests", "helper": { "en": "", "es": "" }, "label": { "en": "Special Requests", "es": "Solicitudes Especiales" }, "required": false, "type": "textarea" },
          { "fieldKey": "additional.operationalNotes", "helper": { "en": "", "es": "" }, "label": { "en": "Operational Notes", "es": "Notas Operativas" }, "required": false, "type": "textarea" }
        ],
        "title": { "en": "Additional", "es": "Adicional" }
      }
    ]
  }
  $$::jsonb,
  false,
  true
)
on conflict (template_key) do update
set
  title = excluded.title,
  description = excluded.description,
  booking_type = excluded.booking_type,
  event_type = excluded.event_type,
  definition = excluded.definition,
  is_default = excluded.is_default,
  is_active = excluded.is_active;
