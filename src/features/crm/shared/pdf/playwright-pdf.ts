export async function renderHtmlToPdf(html: string, options?: { footerHtml?: string }) {
  let chromium: { launch: (options: { headless: boolean }) => Promise<any> };

  try {
    const playwright = require("playwright") as { chromium: { launch: (options: { headless: boolean }) => Promise<any> } };
    chromium = playwright.chromium;
  } catch {
    throw new Error("Playwright is not installed in this environment. Install it to enable browser-based PDF export.");
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { height: 1100, width: 850 } });

  await page.setContent(html, { waitUntil: "networkidle" });
  const pdfBuffer = await page.pdf({
    format: "Letter",
    printBackground: true,
    ...(options?.footerHtml
      ? {
          displayHeaderFooter: true,
          headerTemplate: "<span></span>",
          footerTemplate: options.footerHtml,
          margin: {
            bottom: "0.72in",
            left: "0.45in",
            right: "0.45in",
            top: "0.45in",
          },
        }
      : {}),
  });

  await browser.close();
  return Uint8Array.from(pdfBuffer);
}
