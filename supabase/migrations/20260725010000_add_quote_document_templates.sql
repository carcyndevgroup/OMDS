alter table public.quote_versions
add column if not exists questionnaire_template_key text not null default 'new_booking',
add column if not exists contract_template_key text not null default 'service_contract';

create index if not exists quote_versions_questionnaire_template_idx
on public.quote_versions(questionnaire_template_key);

create index if not exists quote_versions_contract_template_idx
on public.quote_versions(contract_template_key);
