import fetch from "node-fetch";

export default async function handler(req, res) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Please provide a Pokémon name." });
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    
    if (!response.ok) {
      return res.status(404).json({ error: "Pokémon not found." });
    }

    const data = await response.json();

    // Extract first 4 attacks (moves)
    const attacks = data.moves.slice(0, 4).map(move => move.move.name);

    res.status(200).json({
      name: data.name,
      attacks,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
}
