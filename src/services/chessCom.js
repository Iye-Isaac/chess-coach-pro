const API = 'https://api.chess.com/pub';
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

export async function fetchRecentGames(rawUsername) {
  const username = rawUsername.trim();
  if (!/^[a-zA-Z0-9_-]{2,25}$/.test(username)) {
    throw new Error('Enter a valid Chess.com username.');
  }

  const response = await fetch(`${API}/player/${encodeURIComponent(username)}/games/archives`);
  if (response.status === 404) throw new Error('That Chess.com username was not found.');
  if (!response.ok) throw new Error('Chess.com could not be reached. Try again in a moment.');
  const { archives = [] } = await response.json();
  const cutoff = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthKeys = new Set([
    `${previous.getFullYear()}/${MONTHS[previous.getMonth()]}`,
    `${now.getFullYear()}/${MONTHS[now.getMonth()]}`,
  ]);
  const recentArchives = archives.filter((url) => {
    const match = url.match(/\/(\d{4})\/(\d{2})$/);
    return match && monthKeys.has(`${match[1]}/${match[2]}`);
  });
  const batches = await Promise.all(recentArchives.map(async (url) => {
    const result = await fetch(url);
    if (!result.ok) return [];
    const data = await result.json();
    return (data.games || []).filter((game) => game.end_time >= cutoff);
  }));
  return batches.flat().sort((a, b) => b.end_time - a.end_time).slice(0, 12);
}

export function opponentName(game, username) {
  const normalized = username.toLowerCase();
  return game.white?.username?.toLowerCase() === normalized
    ? game.black?.username || 'Opponent'
    : game.white?.username || 'Opponent';
}

export function resultLabel(game, username) {
  const normalized = username.toLowerCase();
  const own = game.white?.username?.toLowerCase() === normalized ? game.white : game.black;
  if (own?.result === 'win') return 'Win';
  if (own?.result === 'agreed' || own?.result === 'repetition' || own?.result === 'stalemate' || own?.result === 'insufficient') return 'Draw';
  return 'Loss';
}

export function recentPlayerRating(games = [], username = '') {
  if (!username) return null;
  const normalized = username.toLowerCase();
  const ratings = games.slice(0, 12).map((game) => {
    const player = game.white?.username?.toLowerCase() === normalized ? game.white
      : game.black?.username?.toLowerCase() === normalized ? game.black : null;
    const rating = Number(player?.rating);
    return Number.isFinite(rating) && rating >= 100 && rating <= 4000 ? rating : null;
  }).filter((rating) => rating !== null).sort((a, b) => a - b);
  if (!ratings.length) return null;
  const middle = Math.floor(ratings.length / 2);
  return Math.round(ratings.length % 2 ? ratings[middle] : (ratings[middle - 1] + ratings[middle]) / 2);
}

export function gameDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
