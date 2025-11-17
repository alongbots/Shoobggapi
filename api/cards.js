// pages/api/cards.js
import chromium from 'chrome-aws-lambda';

export default async function handler(req, res) {
  let browser = null;

  try {
    // Launch headless Chrome
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto('https://shoob.gg/cards', { waitUntil: 'networkidle0' });

    // Wait for card elements to render
    await page.waitForSelector('.card'); // adjust selector based on actual app

    // Extract data from page
    const cards = await page.$$eval('.card', cardEls => {
      return cardEls.map(el => {
        const name = el.querySelector('.card-name')?.textContent.trim() || '';
        const series = el.querySelector('.card-series')?.textContent.trim() || '';
        const tier = el.querySelector('.card-tier')?.textContent.trim() || '';
        return { name, series, tier };
      });
    });

    // Filter if needed
    const { tier, series, name } = req.query;
    let filtered = cards;

    if (tier) filtered = filtered.filter(c => c.tier.toLowerCase() === tier.toLowerCase());
    if (series) filtered = filtered.filter(c => c.series.toLowerCase() === series.toLowerCase());
    if (name) filtered = filtered.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));

    await browser.close();
    return res.status(200).json({ success: true, total: filtered.length, cards: filtered });

  } catch (error) {
    console.error('Error in Puppeteer scrape:', error);
    if (browser) await browser.close();
    return res.status(500).json({ success: false, error: 'Failed to fetch/parse cards via Puppeteer' });
  }
}
