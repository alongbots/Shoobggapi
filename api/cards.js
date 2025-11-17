// pages/api/cards.js
import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { tier, series, name } = req.query;

    // Fetch the shoob cards page
    const { data } = await axios.get("https://shoob.gg/cards");
    
    // Load HTML into cheerio
    const $ = cheerio.load(data);
    const cards = [];

    // Loop through each card element (adjust selectors based on actual site)
    $(".card-list .card").each((i, el) => {
      const cardName = $(el).find(".card-name").text().trim();
      const cardSeries = $(el).find(".card-series").text().trim();
      const cardTier = $(el).find(".card-tier").text().trim();

      cards.push({
        name: cardName,
        series: cardSeries,
        tier: cardTier
      });
    });

    // Apply filters if query parameters exist
    let filtered = cards;
    if (tier) filtered = filtered.filter(c => c.tier.toLowerCase() === tier.toLowerCase());
    if (series) filtered = filtered.filter(c => c.series.toLowerCase() === series.toLowerCase());
    if (name) filtered = filtered.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));

    res.status(200).json({ success: true, total: filtered.length, cards: filtered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch cards" });
  }
}
