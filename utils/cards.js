const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'D', 'R', 'A'];

function buildDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const fmt = (c) => `${c.rank}${c.suit}`;
const fmtHand = (hand) => hand.map(fmt).join(' ');

function blackjackValue(hand) {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === 'A') {
      aces++;
      total += 11;
    } else if (['V', 'D', 'R'].includes(c.rank)) {
      total += 10;
    } else {
      total += parseInt(c.rank, 10);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

const RANK_ORDER = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, V: 11, D: 12, R: 13, A: 14 };
const HAND_NAMES = [
  'Carte haute', 'Paire', 'Double paire', 'Brelan', 'Suite', 'Couleur', 'Full', 'Carré', 'Quinte flush',
];

function evaluateHand(hand) {
  const values = hand.map((c) => RANK_ORDER[c.rank]).sort((a, b) => b - a);
  const isFlush = hand.every((c) => c.suit === hand[0].suit);

  const unique = [...new Set(values)];
  let isStraight = false;
  let straightHigh = values[0];
  if (unique.length === 5) {
    if (values[0] - values[4] === 4) isStraight = true;
    else if (values.join(',') === '14,5,4,3,2') {
      isStraight = true;
      straightHigh = 5;
    }
  }

  const counts = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([v, c]) => [Number(v), c])
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  const kickers = groups.map(([v]) => v);

  if (isStraight && isFlush) return { category: 8, tiebreak: [straightHigh] };
  if (groups[0][1] === 4) return { category: 7, tiebreak: kickers };
  if (groups[0][1] === 3 && groups[1]?.[1] === 2) return { category: 6, tiebreak: kickers };
  if (isFlush) return { category: 5, tiebreak: values };
  if (isStraight) return { category: 4, tiebreak: [straightHigh] };
  if (groups[0][1] === 3) return { category: 3, tiebreak: kickers };
  if (groups[0][1] === 2 && groups[1]?.[1] === 2) return { category: 2, tiebreak: kickers };
  if (groups[0][1] === 2) return { category: 1, tiebreak: kickers };
  return { category: 0, tiebreak: values };
}

function compareHands(hand1, hand2) {
  const e1 = evaluateHand(hand1);
  const e2 = evaluateHand(hand2);
  if (e1.category !== e2.category) return e1.category - e2.category;
  for (let i = 0; i < Math.max(e1.tiebreak.length, e2.tiebreak.length); i++) {
    const diff = (e1.tiebreak[i] || 0) - (e2.tiebreak[i] || 0);
    if (diff) return diff;
  }
  return 0;
}

module.exports = { buildDeck, fmt, fmtHand, blackjackValue, evaluateHand, compareHands, HAND_NAMES };
