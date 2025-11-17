// pages/api/pokemon-cards.js
import axios from "axios";

const PTCG_API_BASE = "https://api.pokemontcg.io/v2";
const API_KEY = process.env.POKEMON_TCG_API_KEY; // set in Vercel env

export default async function handler(req, res) {
  try {
    const { id, name, page = 1, pageSize = 20 } = req.query;

    // If ID is provided, fetch single card
    if (id) {
      const resp = await axios.get(`${PTCG_API_BASE}/cards/${id}`, {
        headers: { "X-Api-Key": API_KEY }
      });
      const c = resp.data.data;
      const card = {
        id: c.id,
        name: c.name,
        hp: c.hp,
        types: c.types,
        abilities: c.abilities?.map(a => ({ name: a.name, text: a.text, type: a.type })) || [],
        attacks: c.attacks?.map(a => ({ name: a.name, damage: a.damage, cost: a.cost, text: a.text })) || [],
        weaknesses: c.weaknesses,
        resistances: c.resistances,
        retreatCost: c.retreatCost,
        set: c.set,
        artist: c.artist,
        rarity: c.rarity
      };
      return res.status(200).json({ success: true, card });
    }

    // Otherwise, fetch list of cards
    const params = { page, pageSize };
    if (name) params.q = `name:${name}`;

    const resp = await axios.get(`${PTCG_API_BASE}/cards`, {
      headers: { "X-Api-Key": API_KEY },
      params
    });

    const cards = resp.data.data.map(c => ({
      id: c.id,
      name: c.name,
      hp: c.hp,
      types: c.types,
      abilities: c.abilities?.map(a => ({ name: a.name, text: a.text, type: a.type })) || [],
      attacks: c.attacks?.map(a => ({ name: a.name, damage: a.damage, cost: a.cost, text: a.text })) || [],
      set: c.set,
      rarity: c.rarity
    }));

    res.status(200).json({ success: true, total: cards.length, cards });
  } catch (error) {
    console.error("Pokemon API Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to fetch Pokémon cards" });
  }
}
