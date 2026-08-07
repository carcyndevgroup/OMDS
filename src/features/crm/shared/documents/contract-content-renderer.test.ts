import { describe, expect, it } from "vitest";

import { parseContractContentBlocks, renderContractPdfText, renderContractPreviewHtml } from "./contract-content-renderer";

describe("parseContractContentBlocks", () => {
  it("parses headings, paragraphs, and list items into structured blocks", () => {
    const blocks = parseContractContentBlocks(
      "<h1>Wedding Contract</h1><p>Hello <strong>there</strong></p><ul><li>First item</li><li>Second item</li></ul>",
    );

    expect(blocks).toEqual([
      { kind: "heading1", text: "Wedding Contract" },
      { kind: "paragraph", text: "Hello there" },
      { kind: "list", items: ["First item", "Second item"], ordered: false },
    ]);
  });
});

describe("renderContractPreviewHtml", () => {
  it("adds shared preview classes while preserving basic structure", () => {
    const html = renderContractPreviewHtml("<h1>Heading</h1><h2>Section</h2><p>Body</p>");

    expect(html).toContain('class="rounded-[32px] border border-[#d8c8a0] bg-[linear-gradient(180deg,#fefcf9_0%,#f7eee0_100%)] p-6 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.35)] text-slate-800 font-serif"');
    expect(html).toContain('class="mb-8 overflow-hidden rounded-[24px] border border-[#e4ddd6] bg-[linear-gradient(135deg,#fffdf8_0%,#f7eedf_100%)] p-8 text-center shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]"');
    expect(html).toContain('class="text-[24px] font-extrabold uppercase tracking-[0.12em] text-slate-900"');
    expect(html).toContain('class="text-[20px] font-semibold tracking-[0.08em] uppercase text-slate-900 mb-4 mt-8"');
    expect(html).toContain('class="text-[15px] font-semibold tracking-[0.14em] uppercase text-slate-800 mb-3 mt-6"');
    expect(html).toContain('class="mt-8 rounded-[20px] border border-[#e4ddd6] bg-white/80 p-6 shadow-[0_12px_35px_-25px_rgba(15,23,42,0.3)]"');
    expect(html).toContain('class="m-0 leading-7 text-[15px] text-slate-700"');
  });

  it("preserves custom classes and inline styles on supported tags", () => {
    const html = renderContractPreviewHtml('<p class="custom" style="color: red;">Body</p>');

    expect(html).toContain('class="m-0 leading-7 text-[15px] text-slate-700 custom"');
    expect(html).toContain('style="color: red;"');
  });

  it("renders the branded cover layout with the OMDS logo and company profile tokens", () => {
    const html = renderContractPreviewHtml('<h1>Heading</h1><p>Body</p>', {
      'company.dbaName': 'OMDS Catering',
      'company.legalName': 'Oh My Desserts & Snacks MX',
    });

    expect(html).toContain('/branding/ohmydesserts-logo-color.png');
    expect(html).toContain('Oh My Desserts & Snacks MX');
    expect(html).toContain('OMDS Catering');
  });
});

describe("renderContractPdfText", () => {
  it("preserves paragraph and list breaks for PDF output", () => {
    const text = renderContractPdfText("<p>First paragraph</p><ul><li>First item</li></ul><p>Second paragraph</p>");

    expect(text).toContain("First paragraph");
    expect(text).toContain("• First item");
    expect(text).toContain("Second paragraph");
  });

  it("marks headings for structured PDF output", () => {
    const text = renderContractPdfText("<h1>Section Title</h1><p>Body copy</p>");

    expect(text).toContain("## Section Title");
    expect(text).toContain("Body copy");
  });

  it("does not inject extra cover and signature blocks into PDF text output", () => {
    const text = renderContractPdfText("<h1>Section Title</h1><p>Body copy</p>");

    expect(text).not.toContain("OH MY DESSERTS & SNACKS MX");
    expect(text).not.toContain("## Signature");
    expect(text).not.toContain("{{client.legalfullname}}");
    expect(text).not.toContain("{{omds.legalfullname}}");
  });
});
