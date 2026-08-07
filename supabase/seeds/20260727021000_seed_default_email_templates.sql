insert into public.email_templates (template_key, title, description, document_kind, subject, body, is_default)
values
  (
    'questionnaire_invite_standard',
    'Questionnaire Invite - Standard',
    'Default first-send message for questionnaire invites.',
    'questionnaire',
    'Questionnaire: Please Complete',
    'Please review and complete your booking questionnaire. Reply here if you have questions.',
    true
  ),
  (
    'questionnaire_reminder_followup',
    'Questionnaire Reminder - Follow Up',
    'Follow-up reminder for pending questionnaires.',
    'questionnaire',
    'Questionnaire Reminder',
    'Friendly reminder to complete your questionnaire at your earliest convenience.',
    false
  ),
  (
    'contract_send_standard',
    'Contract Send - Standard',
    'Default first-send message for contracts.',
    'contract',
    'Contract: Signature Requested',
    'Please review and sign your contract. Reply here if you need any clarifications.',
    true
  ),
  (
    'contract_reminder_followup',
    'Contract Reminder - Follow Up',
    'Follow-up reminder for pending contract signatures.',
    'contract',
    'Contract Reminder',
    'Friendly reminder to review and sign your contract. Let us know if you have questions.',
    false
  )
on conflict (template_key) do update
set
  title = excluded.title,
  description = excluded.description,
  document_kind = excluded.document_kind,
  subject = excluded.subject,
  body = excluded.body,
  is_default = excluded.is_default,
  is_active = true;
