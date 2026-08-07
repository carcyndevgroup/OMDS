type SatCatalogOption = {
  label: string;
  value: string;
};

const codeLabel = (code: string, description: string): SatCatalogOption => ({
  label: `${code} - ${description}`,
  value: code,
});

export const DEFAULT_CFDI_USE = "G03";
export const DEFAULT_PAYMENT_FORM = "99";
export const DEFAULT_PAYMENT_METHOD = "PPD";
export const DEFAULT_RECIPIENT_TAX_REGIME = "601";
export const DEFAULT_EMITTER_TAX_REGIME = "612";
export const DEFAULT_TAX_OBJECT = "02";

export const cfdiUseOptions = [
  codeLabel("G01", "Adquisicion de mercancias"),
  codeLabel("G02", "Devoluciones, descuentos o bonificaciones"),
  codeLabel("G03", "Gastos en general"),
  codeLabel("D01", "Honorarios medicos, dentales y gastos hospitalarios"),
  codeLabel("D02", "Gastos medicos por incapacidad o discapacidad"),
  codeLabel("D03", "Gastos funerales"),
  codeLabel("D04", "Donativos"),
  codeLabel("D05", "Intereses reales pagados por creditos hipotecarios"),
  codeLabel("D06", "Aportaciones voluntarias al SAR"),
  codeLabel("D07", "Primas por seguros de gastos medicos"),
  codeLabel("D08", "Gastos de transportacion escolar obligatoria"),
  codeLabel("D09", "Depositos para ahorro o planes de pensiones"),
  codeLabel("D10", "Pagos por servicios educativos"),
  codeLabel("S01", "Sin efectos fiscales"),
  codeLabel("CP01", "Pagos"),
  codeLabel("CN01", "Nomina"),
];

export const paymentFormOptions = [
  codeLabel("01", "Efectivo"),
  codeLabel("02", "Cheque nominativo"),
  codeLabel("03", "Transferencia electronica de fondos"),
  codeLabel("04", "Tarjeta de credito"),
  codeLabel("05", "Monedero electronico"),
  codeLabel("06", "Dinero electronico"),
  codeLabel("08", "Vales de despensa"),
  codeLabel("12", "Dacion en pago"),
  codeLabel("13", "Pago por subrogacion"),
  codeLabel("14", "Pago por consignacion"),
  codeLabel("15", "Condonacion"),
  codeLabel("17", "Compensacion"),
  codeLabel("23", "Novacion"),
  codeLabel("24", "Confusion"),
  codeLabel("25", "Remision de deuda"),
  codeLabel("26", "Prescripcion o caducidad"),
  codeLabel("27", "A satisfaccion del acreedor"),
  codeLabel("28", "Tarjeta de debito"),
  codeLabel("29", "Tarjeta de servicios"),
  codeLabel("30", "Aplicacion de anticipos"),
  codeLabel("31", "Intermediario pagos"),
  codeLabel("99", "Por definir"),
];

export const paymentMethodOptions = [
  codeLabel("PUE", "Pago en una sola exhibicion"),
  codeLabel("PPD", "Pago en parcialidades o diferido"),
];

export const taxRegimeOptions = [
  codeLabel("601", "General de Ley Personas Morales"),
  codeLabel("603", "Personas Morales con Fines no Lucrativos"),
  codeLabel("605", "Sueldos y Salarios e Ingresos Asimilados a Salarios"),
  codeLabel("606", "Arrendamiento"),
  codeLabel("607", "Regimen de Enajenacion o Adquisicion de Bienes"),
  codeLabel("608", "Demas ingresos"),
  codeLabel("610", "Residentes en el Extranjero sin Establecimiento Permanente"),
  codeLabel("611", "Ingresos por Dividendos"),
  codeLabel("612", "Personas Fisicas con Actividades Empresariales"),
  codeLabel("614", "Ingresos por intereses"),
  codeLabel("615", "Ingresos por obtencion de premios"),
  codeLabel("616", "Sin obligaciones fiscales"),
  codeLabel("620", "Sociedades Cooperativas de Produccion"),
  codeLabel("621", "Incorporacion Fiscal"),
  codeLabel("622", "Actividades Agricolas, Ganaderas, Silvicolas y Pesqueras"),
  codeLabel("623", "Opcional para Grupos de Sociedades"),
  codeLabel("624", "Coordinados"),
  codeLabel("625", "Plataformas Tecnologicas"),
  codeLabel("626", "Regimen Simplificado de Confianza"),
];

export const taxObjectOptions = [
  codeLabel("01", "No objeto de impuesto"),
  codeLabel("02", "Si objeto de impuesto"),
  codeLabel("03", "Si objeto del impuesto y no obligado al desglose"),
  codeLabel("04", "Si objeto del impuesto y no causa impuesto"),
  codeLabel("05", "Si objeto del impuesto, IVA credito PODEBI"),
  codeLabel("06", "Si objeto del IVA, No traslado IVA"),
  codeLabel("07", "No traslado del IVA, Si desglose IEPS"),
  codeLabel("08", "No traslado del IVA, No desglose IEPS"),
];
