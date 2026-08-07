update public.contract_templates
set body = replace(
  replace(body, '<td>35%</td>', '<td>{{financials.retainer_percent}}%</td>'),
  '<td>65%</td>',
  '<td>{{financials.final_payment_percent}}%</td>'
),
updated_at = now()
where body like '%<td>35%</td>%'
   or body like '%<td>65%</td>%';
