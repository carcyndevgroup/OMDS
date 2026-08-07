delete from public.contract_templates
where template_key in ('direct_contract', 'pv_service_terms');

insert into public.contract_templates (
  template_key,
  title,
  description,
  booking_type,
  event_type,
  body,
  is_default,
  is_active
)
values (
  'direct_contract',
  'Direct Contract',
  'Default contract for direct bookings.',
  'direct',
  null,
  $$<h2>QUOTED LINE ITEMS TABLE</h2>
<p>The following table reflects the specific services, quantities, and pricing structures locked into this Contract snapshot:</p>
<table>
  <thead>
    <tr>
      <th>Item / Package</th>
      <th>Description</th>
      <th>Qty</th>
      <th>Unit Price (MXN)</th>
      <th>Total (MXN)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{{item.name_1}}</td>
      <td>{{item.desc_1}}</td>
      <td>{{item.qty_1}}</td>
      <td>${{item.unit_1}}</td>
      <td>${{item.total_1}}</td>
    </tr>
    <tr>
      <td>{{item.name_2}}</td>
      <td>{{item.desc_2}}</td>
      <td>{{item.qty_2}}</td>
      <td>${{item.unit_2}}</td>
      <td>${{item.total_2}}</td>
    </tr>
    <tr>
      <td colspan="4"><strong>Subtotal:</strong></td>
      <td>${{financials.subtotal}}</td>
    </tr>
    <tr>
      <td colspan="4"><strong>TAX / IVA (16%):</strong></td>
      <td>${{financials.tax}}</td>
    </tr>
    <tr>
      <td colspan="4"><strong>TOTAL PRICE:</strong></td>
      <td>${{financials.total}}</td>
    </tr>
  </tbody>
</table>

<h2>DYNAMIC PAYMENT SCHEDULE TABLE</h2>
<p>The OMDS booking system has automatically calculated the following milestone due dates and amounts based on your scheduled Event Date:</p>
<table>
  <thead>
    <tr>
      <th>Milestone</th>
      <th>Due Date</th>
      <th>%</th>
      <th>Amount Due (MXN)</th>
      <th>Est. USD Ref.*</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>01. Retainer</td>
      <td>Due Upon Signing</td>
      <td>35%</td>
      <td>${{financials.retainer_mxn}}</td>
      <td>*${{financials.retainer_usd}}*</td>
      <td>Pending</td>
    </tr>
    <tr>
      <td>02. Final Balance</td>
      <td>{{financials.balance_due_date}}</td>
      <td>65%</td>
      <td>${{financials.balance_mxn}}</td>
      <td>*${{financials.balance_usd}}*</td>
      <td>Pending</td>
    </tr>
  </tbody>
</table>
<p><em>*USD values are strictly digital reference estimates for client convenience. Final USD payments recalculate via the gateway using the Banco de México FIX exchange rate on the exact calendar date of transaction.</em></p>

<h2>TERMS &amp; CONDITIONS</h2>

<h3>1. PARTIES AND PURPOSE</h3>
<ol>
  <li>The individual(s) listed above, or any third party acting as purchaser of the services described herein, shall collectively be referred to as the "Client."</li>
  <li>OMDS is in the business of providing live dessert and snack catering services for events. The Client wishes to retain OMDS's services for the event, date, time, and location set forth in the Client's approved quote (the "Event"), which forms part of this Contract by reference.</li>
</ol>

<h3>2. CONTRACTED SERVICES</h3>
<ol>
  <li>OMDS shall provide the services and food items included in the package selected by the Client (the "Package"), as described in the Client's approved quote.</li>
  <li>The Client agrees to retain OMDS and to purchase the selected Package on the terms set forth in this Contract.</li>
</ol>

<h3>3. TOTAL PRICE AND CURRENCY OPERATIONAL LOGIC</h3>
<ol>
  <li>The total price for the Package (the "Total Price") is quoted primarily in Mexican Pesos (MXN), with an approximate US Dollar (USD) reference value shown in the Quoted Line Items Table on Page 2 for convenience only.</li>
  <li>For each digital invoice paid through the Client Portal, the applicable MXN/USD conversion shall be calculated automatically by the platform based on the official FIX exchange rate published by Banco de México on the exact calendar date the payment transaction is completed.</li>
  <li>The Client acknowledges that due to currency market fluctuations, the final USD equivalent paid for the remaining balance may vary from the initial estimate. OMDS reserves the right to lock a static conversion rate for the remaining balance if mutually agreed upon in writing via the portal.</li>
</ol>

<h3>4. RETAINER / INITIAL PAYMENT</h3>
<ol>
  <li>The Client agrees to pay a retainer of thirty-five percent (35%) of the Total Price (the "Retainer") immediately upon executing this Contract through the portal.</li>
  <li>The Retainer is strictly non-refundable under all circumstances, including cancellation, except where OMDS agrees in writing to a discretionary waiver under Section 7.5.</li>
</ol>

<h3>5. PAYMENT SCHEDULE &amp; AUTOMATED BILLING</h3>
<ol>
  <li>The Client shall be bound by the specific due dates and values calculated automatically and displayed in the Dynamic Payment Schedule Table on Page 2 of this Contract.</li>
  <li>Full Payment Track: The entire Total Price is paid in full within three (3) days of contract execution; or</li>
  <li>Two-Payment Track: The 35% Retainer is paid immediately upon booking, and a remaining 65% balance invoice is automatically generated by the portal, due no later than fifteen (15) days prior to the Event.</li>
  <li>Urgent Bookings: If the Event is booked within fifteen (15) days of the Event date, the platform will generate a single invoice for 100% of the Total Price, due immediately upon signing.</li>
</ol>

<h3>6. CHANGE OF EVENT DATE</h3>
<ol>
  <li>If the Client requests an Event date change, OMDS will apply prior payments to the new date, subject to operational availability. Pricing will auto-adjust to OMDS's current platform rates for that period.</li>
  <li>If OMDS cannot accommodate the requested new date, the rescheduling request shall be treated as a standard cancellation under Section 7.</li>
</ol>

<h3>7. CANCELLATION BY CLIENT</h3>
<ol>
  <li>If the Client cancels the Event for any reason, the following automated forfeiture schedule applies as liquidated damages:</li>
  <li>Cancellation &gt; 30 days before Event: Client forfeits the 35% Retainer only; any additional funds paid are refunded.</li>
  <li>Cancellation 15–30 days before Event: Client forfeits seventy percent (70%) of the Total Price.</li>
  <li>Cancellation &lt; 15 days before Event: Client forfeits one hundred percent (100%) of the Total Price.</li>
  <li>Administrative Exception: OMDS management may, at its sole discretion, manually override forfeiture amounts for serious extenuating circumstances communicated formally by the Client.</li>
</ol>

<h3>8. GUEST COUNT, DEADLINES, AND BALANCE ADJUSTMENTS</h3>
<ol>
  <li>Exactly twenty (20) days before the Event date, the OMDS booking system will issue an automated notification prompting the Client to input their final guest count.</li>
  <li>The Client must lock in their final guest count via the portal no later than fifteen (15) days before the Event date.</li>
  <li>If the Client misses the fifteen (15)-day deadline, the platform will automatically lock the originally estimated guest count to generate the final balance invoice.</li>
  <li>Guest Count Increases: If the updated count is higher than contracted, the platform will dynamically recalculate and append the overage to the balance invoice.</li>
  <li>Guest Count Decreases: Reductions up to 10% of the original count are permitted. Reductions beyond 10% will be ignored and the balance invoice will reflect the original count minus the 10% cap.</li>
  <li>Minimum Coverage Rule: Final billing must account for at least ninety percent (90%) of total actual attendees. Undocumented attendees found consuming catering beyond the portal-locked count will trigger a post-event invoice at no less than $100.00 MXN per person.</li>
</ol>

<h3>9. LEFTOVERS</h3>
<ol>
  <li>OMDS reserves the right to safely discard, donate, or retain any leftover food remaining after the contracted service conclusion time.</li>
</ol>

<h3>10. SCHEDULE DELAYS AND OVERTIME BILLING</h3>
<ol>
  <li>If the Event runs past the agreed end time for reasons outside OMDS's control, the platform will generate an overtime invoice at $1,000.00 MXN per hour, computed in fifteen (15)-minute increments.</li>
  <li>If OMDS experiences transit or setup delays, the team will send a status update and, where feasible, will extend service time to match the delay window at no added cost.</li>
</ol>

<h3>11. CANCELLATION BY OMDS</h3>
<ol>
  <li>If OMDS cannot fulfill its obligations due to internal operational failure, OMDS may match the client with an equivalent local replacement service provider at no added charge, or initiate a 100% refund of all processed portal payments.</li>
  <li>OMDS's financial liability is strictly capped at the remedies listed in this section.</li>
</ol>

<h3>12. FORCE MAJEURE</h3>
<ol>
  <li>OMDS shall not be held liable for service failures resulting from acts of God, extreme weather events (including hurricanes, tropical storms, or flash flooding), civil unrest, government-ordered closures, regional infrastructure failures, or any event outside reasonable corporate control.</li>
</ol>

<h3>13. LIMITATION OF LIABILITY</h3>
<ol>
  <li>OMDS's total maximum liability for any structural service failure is strictly limited to the total monetary amount successfully processed from the Client through the OMDS booking system platform.</li>
  <li>This cap does not apply to scenarios involving proven gross negligence or willful misconduct by OMDS personnel.</li>
</ol>

<h3>14. MODIFICATIONS OF THE CONTRACT</h3>
<ol>
  <li>No oral agreements shall stand. This Contract may only be altered through digital addendums signed electronically by both Parties within the Client Portal.</li>
</ol>

<h3>15. APPLICABLE LAW, JURISDICTION, AND VENUE</h3>
<ol>
  <li>This Contract shall be governed by the laws of the State of Quintana Roo, Mexico.</li>
  <li>The Parties expressly consent to the exclusive jurisdiction of the state and federal courts located in the State of Quintana Roo, Mexico.</li>
</ol>

<h3>16. PORTAL EXECUTION AND ELECTRONIC SIGNATURES</h3>
<ol>
  <li>This Contract may be executed in any number of digital counterparts, each deemed an original.</li>
  <li>Execution via the Client Portal by clicking "I Accept," executing a digital signature, or completing the checkout sequence constitutes a legally binding expression of consent. Per Article 89 bis of the Mexican Commercial Code, this digital execution matches the full validity and evidentiary weight of a traditional handwritten signature.</li>
</ol>
$$::text,
  true,
  true
);

insert into public.contract_templates (
  template_key,
  title,
  description,
  booking_type,
  event_type,
  body,
  is_default,
  is_active
)
values (
  'pv_service_terms',
  'PV Service Terms',
  'Preferred vendor service terms for venue-managed events.',
  'preferred_vendor',
  null,
  $$<h2>EVENT SERVICE TERMS</h2>
<ol>
  <li>OMDS shall provide the services and food items included in the package selected by the Client, as described in the signed proposal/quote.</li>
  <li>All charges for OMDS's services under these Terms are coordinated with the venue and billed through the approved event account.</li>
  <li>If the Client requests a change of date or cancellation, the venue and OMDS will coordinate the operational and financial outcome through the booking system.</li>
</ol>
$$::text,
  false,
  true
);
