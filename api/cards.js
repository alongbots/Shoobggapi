import axios from "axios";

export default async function handler(req, res) {
  try {
    const { id, name, page = 1, pageSize = 20 } = req.query;

    let url = "https://api.pokemontcg.io/v2/cards";
    const params = { page, pageSize };

    // If an ID is provided, fetch a single card
    if (id) {
      url = `https://api.pokemontcg.io/v2/cards/${id}`;
    } else if (name) {
      // Search cards by name
      params.q = `name:${name}`;
    }

    const headers = {};
    // Optional: use API key if you have one
    if (process.env.POKEMON_TCG_API_KEY) {
      headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
    }

    const resp = await axios.get(url, { params, headers });
    const data = resp.data.data;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ success: false, error: "No cards found" });
    }

    // Transform cards to only return necessary fields
    const cards = (Array.isArray(data) ? data : [data]).map(c => ({
      id: c.id,
      name: c.name,
      hp: c.hp,
      types: c.types,
      abilities: c.abilities?.map(a => ({ name: a.name, text: a.text, type: a.type })) || [],
      attacks: c.attacks?.map(a => ({ name: a.name, damage: a.damage, cost: a.cost, text: a.text })) || [],
      image: c.images?.large || c.images?.small || null,
      rarity: c.rarity,
      set: c.set?.name || null
    }));

    res.status(200).json({ success: true, total: cards.length, cards });
  } catch (error) {
    console.error("Error fetching Pokémon cards:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to fetch cards from PTCG API" });
  }
}
