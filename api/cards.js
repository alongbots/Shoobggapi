export default async function handler(req, res) {
  const { name, series, tier } = req.query;

  if (!name && !series && !tier) {
    return res.status(400).json({ error: "Provide at least one query: name, series, or tier." });
  }

  try {
    // Build query
    let queryParts = [];
    if (name) queryParts.push(`name:${name}`);
    if (series) queryParts.push(`set.name:${series}`);
    if (tier) queryParts.push(`rarity:${tier}`);

    const query = queryParts.join(" ");

    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      return res.status(404).json({ error: "No cards found." });
    }

    const data = await response.json();

    const cards = data.data.map(card => ({
      name: card.name,
      series: card.set?.name || null,
      tier: card.rarity || null,
      attacks: card.attacks ? card.attacks.map(a => a.name) : [],
      image: card.images?.small || null
    }));

    res.status(200).json({ count: cards.length, cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
