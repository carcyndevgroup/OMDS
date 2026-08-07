alter table public.staff_members
add column if not exists address text not null default '',
add column if not exists date_of_birth date,
add column if not exists id_type text not null default '',
add column if not exists id_number text not null default '',
add column if not exists id_expiration_date date,
add column if not exists id_front_file_url text not null default '',
add column if not exists id_back_file_url text not null default '',
add column if not exists bank_name text not null default '',
add column if not exists bank_card_number text not null default '',
add column if not exists bank_clabe text not null default '',
add column if not exists bank_account_number text not null default '',
add column if not exists bank_beneficiary text not null default '';
