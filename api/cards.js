// pages/api/cards.js
import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { tier, series, name } = req.query;

    const { data } = await axios.get("https://shoob.gg/cards", {
      headers: {
        "User‑Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml"
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const cards = [];

    // Example structure — adjust selectors as needed.
    $(".card").each((i, el) => {
      const cardName = $(el).find(".card‑name").text().trim();
      const cardSeries = $(el).find(".card‑series").text().trim();
      const cardTier = $(el).find(".card‑tier").text().trim();

      if (cardName && cardSeries && cardTier) {
        cards.push({ name: cardName, series: cardSeries, tier: cardTier });
      }
    });

    if (cards.length === 0) {
      console.warn("No cards found. The site may use JS to render content.");
    }

    let filtered = cards;
    if (tier) filtered = filtered.filter(c => c.tier.toLowerCase() === tier.toLowerCase());
    if (series) filtered = filtered.filter(c => c.series.toLowerCase() === series.toLowerCase());
    if (name) filtered = filtered.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));

    res.status(200).json({ success: true, total: filtered.length, cards: filtered });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch or parse cards" });
  }
}
