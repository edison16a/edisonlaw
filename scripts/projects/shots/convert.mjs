/**
 * Convert: a batch of mixed files converted in the browser, with a download button on every row
 * and Download all at the top, in the dark theme.
 * Source: the live app at https://freeconvert.vercel.app. The files are made here (two images, a
 * spreadsheet, a Markdown note and a CSV), so nothing private is shown.
 */
const SITE = 'https://freeconvert.vercel.app';

/** A flat color image made in the page, so no image library is needed. */
async function colorImage(page, from, to) {
  const dataUrl = await page.evaluate(
    ([a, b]) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1000;
      const context = canvas.getContext('2d');
      const gradient = context.createLinearGradient(0, 0, 1600, 1000);
      gradient.addColorStop(0, a);
      gradient.addColorStop(1, b);
      context.fillStyle = gradient;
      context.fillRect(0, 0, 1600, 1000);
      return canvas.toDataURL('image/png');
    },
    [from, to],
  );
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
}

export async function capture({ openPage }) {
  // 16:10 like a card, small enough that the interface fills it at a readable size.
  const page = await openPage({ width: 960, height: 600, scale: 2, colorScheme: 'dark' });
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.getByRole('button', { name: 'Choose files' }).waitFor({ timeout: 60_000 });

  const text = (name, mimeType, body) => ({ name, mimeType, buffer: Buffer.from(body) });
  const files = [
    { name: 'IMG_4021.png', mimeType: 'image/png', buffer: await colorImage(page, '#f59e0b', '#ef4444') },
    { name: 'headshot.png', mimeType: 'image/png', buffer: await colorImage(page, '#38bdf8', '#6366f1') },
    text('budget.csv', 'text/csv', 'item,amount\nRent,1450\nFood,420\nTransit,95\nBooks,60\n'),
    text('launch-notes.md', 'text/markdown', '# Launch notes\n\n- Ship Friday\n- Write the changelog\n- Tell the team\n'),
    text('signups.csv', 'text/csv', 'name,email\nAda,ada@example.com\nLin,lin@example.com\nSam,sam@example.com\n'),
  ];
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose files' }).click();
  await (await chooser).setFiles(files);

  await page.getByRole('button', { name: /^Convert \d+ files?$/ }).click();
  await page.getByRole('button', { name: /Download all/i }).waitFor({ timeout: 180_000 });
  // The check marks and sizes settle after the last file lands.
  await page.waitForTimeout(1_500);
  return { png: await page.screenshot(), quality: 0.92 };
}
