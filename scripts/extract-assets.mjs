// Extract the inline base64 PNG assets from the source HTML and write them as
// real files into public/. The original embeds these as data: URIs inside
// renderShell + navButtons; pulling them out shrinks the bundle and lets
// the browser cache them properly.
//
//   npm run extract-assets

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_HTML = resolve(
  __dirname,
  '..',
  '..',
  'legal-office-v229-client-detail-mobile-fixed-button-shape.html',
);
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

const html = readFileSync(SOURCE_HTML, 'utf8');

function findAfter(label, start) {
  const idx = html.indexOf(label, start);
  if (idx < 0) return null;
  const dataIdx = html.indexOf('data:image/png;base64,', idx);
  if (dataIdx < 0) return null;
  // Read until whichever quote ends the URI first. The office logo is in
  // a double-quoted src="...", the mobile icons are in single-quoted JS
  // literals.
  const singleIdx = html.indexOf("'", dataIdx);
  const doubleIdx = html.indexOf('"', dataIdx);
  const closeIdx =
    singleIdx === -1
      ? doubleIdx
      : doubleIdx === -1
        ? singleIdx
        : Math.min(singleIdx, doubleIdx);
  return { start: dataIdx, end: closeIdx };
}

function extractDataUri(start, end) {
  const uri = html.slice(start, end);
  const m = uri.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  return Buffer.from(m[1], 'base64');
}

function writePng(name, range) {
  if (!range) {
    console.warn(`! could not locate ${name}`);
    return;
  }
  const buf = extractDataUri(range.start, range.end);
  if (!buf) {
    console.warn(`! invalid base64 for ${name}`);
    return;
  }
  const dst = resolve(PUBLIC_DIR, name);
  writeFileSync(dst, buf);
  console.log(`✓ ${name} (${buf.length} bytes)`);
}

// Office logo is inside renderShell sidebar.innerHTML (around source line 3873).
// The CSS rule `.office-logo-mark` appears earlier (line ~472), so anchor on
// the longer JS-only marker `mark office-logo-mark`.
const officeAnchor = html.indexOf('mark office-logo-mark');
const officeLogoRange = officeAnchor < 0 ? null : findAfter('mark office-logo-mark', officeAnchor);
writePng('office-logo.png', officeLogoRange);

// Mobile nav PNG icons are inside navButtons (around source line 3841).
const mobileAnchor = html.indexOf('mobileHomeIcon');
if (mobileAnchor >= 0) {
  const homeRange = findAfter("mobileHomeIcon='", mobileAnchor);
  writePng('mobile-home.png', homeRange);
  const contactsRange = findAfter("mobileContactsIcon='", mobileAnchor);
  writePng('mobile-contacts.png', contactsRange);
  const casesRange = findAfter("mobileCasesIcon='", mobileAnchor);
  writePng('mobile-cases.png', casesRange);
  const calendarRange = findAfter("mobileCalendarIcon='", mobileAnchor);
  writePng('mobile-calendar.png', calendarRange);
}
