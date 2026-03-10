/* ═══════════════════════════════════════════════
   word-icons.js — Emoji icon map for vocabulary cards
   Maps translationEn (lowercased) → emoji
   ═══════════════════════════════════════════════ */

const WORD_ICONS = {
    // ── Food & Drink ─────────────────────────────
    'food': '🍽️',
    'restaurant': '🍴',
    'café': '☕',
    'bar': '🍺',
    'menu': '📋',
    'starter': '🥗',
    'main course': '🥩',
    'dessert': '🍰',
    'bill': '🧾',
    'vegetarian': '🥦',
    'vegan': '🌱',
    'gluten-free': '🚫',
    'fish': '🐟',
    'meat': '🥩',
    'salad': '🥗',
    'milk': '🥛',
    'cheese': '🧀',
    'fruits': '🍎',
    'vegetables': '🥕',
    'nuts': '🥜',
    'coffee': '☕',
    'tea': '🍵',
    'water': '💧',
    'wine': '🍷',
    'beer': '🍺',
    'non-alcoholic': '🧃',
    'cheers!': '🥂',

    // ── Colors ───────────────────────────────────
    'color': '🎨',
    'white': '⬜',
    'black': '⬛',
    'red': '🔴',
    'blue': '🔵',
    'green': '🟢',
    'yellow': '🟡',
    'colorful': '🌈',

    // ── Numbers ──────────────────────────────────
    'one': '1️⃣',
    'two': '2️⃣',
    'three': '3️⃣',
    'four': '4️⃣',
    'five': '5️⃣',
    'six': '6️⃣',
    'seven': '7️⃣',
    'eight': '8️⃣',
    'nine': '9️⃣',
    'ten': '🔟',
    'twenty': '🔢',
    'fifty': '🔢',
    'hundred': '💯',
    'thousand': '🔢',

    // ── Adjectives ───────────────────────────────
    'good': '👍',
    'bad': '👎',
    'new': '✨',
    'old': '🏺',
    'young': '🌱',
    'big': '🐘',
    'small': '🐭',
    'beautiful': '🌺',
    'cheap': '🏷️',
    'expensive': '💎',
    'dark': '🌑',
    'bright': '☀️',
    'together': '🤝',
    'separate': '✂️',
    'important': '⭐',
    'tired': '😴',

    // ── Shopping ─────────────────────────────────
    'supermarket': '🛒',
    'cash': '💵',
    'bank card': '💳',
    'bag': '👜',
    'tampon': '🩸',
    'pad': '🩹',
    'condom': '🛡️',
    'toothbrush': '🪥',
    'help': '🆘',
    'police': '🚔',

    // ── Health ───────────────────────────────────
    'doctor': '👨‍⚕️',
    'hospital': '🏥',
    'pharmacy': '💊',
    'painkiller': '💊',
    'medicine': '💊',
    'pain': '🤕',
    'back': '🦵',
    'foot': '🦶',
    'stomach': '🤢',
    'leg': '🦵',
    'head': '🧠',
    'hand': '🖐️',
    'arm': '💪',

    // ── Orientation ──────────────────────────────
    'direction': '🧭',
    'entrance': '🚪',
    'exit': '🚪',
    'street': '🛣️',
    'way': '🛤️',
    'square': '🏛️',
    'right': '➡️',
    'left': '⬅️',
    'straight ahead': '⬆️',

    // ── Surrounding ──────────────────────────────
    'house': '🏠',
    'apartment': '🏢',
    'hotel': '🏨',
    'museum': '🏛️',
    'beach': '🏖️',
    'forest': '🌲',
    'mountain': '⛰️',
    'park': '🌳',
    'river': '🏞️',
    'sea': '🌊',
    'lake': '🏞️',
    'weather': '🌤️',
    'sun': '☀️',
    'rain': '🌧️',
    'snow': '❄️',
    'thunderstorm': '⛈️',

    // ── Communication ────────────────────────────
    'hi!': '👋',
    'hello!': '👋',
    'goodbye!': '👋',
    'thank you!': '🙏',
    'please!': '🫶',
    'sorry!': '😔',
    'stop!': '🛑',
    'caution!': '⚠️',
    'yes': '✅',
    'no': '❌',

    // ── Transport ────────────────────────────────
    'train': '🚂',
    'bus': '🚌',
    'car': '🚗',
    'tram': '🚋',
    'taxi': '🚕',
    'bicycle': '🚲',
    'on foot': '🚶',
    'train station': '🏣',
    'bus station': '🚏',
    'stop': '🛑',

    // ── Time ─────────────────────────────────────
    'time': '⏰',
    'day': '📅',
    'week': '📆',
    'month': '🗓️',
    'year': '📅',
    'monday': '📅',
    'tuesday': '📅',
    'wednesday': '📅',
    'thursday': '📅',
    'friday': '📅',
    'saturday': '🎉',
    'sunday': '😴',
    'in the morning': '🌅',
    'in the afternoon': '🌞',
    'in the evening': '🌆',
    'at night': '🌙',
    'earlier': '⏪',
    'later': '⏩',
    'on time': '✅',
    'delayed': '⏳',

    // ── Technology ───────────────────────────────
    'internet': '🌐',
    'password': '🔒',
    'computer': '💻',
    'socket': '🔌',
    'to recharge': '🔋',

    // ── Verbs ────────────────────────────────────
    'to work': '💼',
    'to visit': '🗺️',
    'to stay': '🏠',
    'to need': '🤲',
    'to ask': '❓',
    'to give': '🎁',
    'to go': '🚶',
    'to have': '🤲',
    'to buy': '🛍️',
    'can': '💪',
    'to learn': '📚',
    'to make': '🔨',
    'to take': '✋',
    'to say': '💬',
    'to write': '✍️',
    'to see': '👁️',
    'to be': '🌟',
    'to search': '🔍',
    'to call': '📞',
    'to drink': '🥤',
    'to know': '🧠',
    'to want': '💭',
    'to pay': '💳',

    // ── Personal ─────────────────────────────────
    'first name': '🏷️',
    'last name': '🪪',
    'address': '📍',
    'country': '🌍',
    'place of birth': '📌',
    'date of birth': '🎂',
    'profession': '💼',
    'man': '👨',
    'woman': '👩',
    'adult': '🧑',
    'child': '👶',

    // ── Sentences / Phrases ──────────────────────
    'what is it?': '❓',
    'where is it?': '📍',
    'how?': '🤔',
    'how much is it?': '💰',
    'how long does it take?': '⏱️',
    'is there …?': '🔎',
    'i would like…': '🙋',
    'i need…': '🙏',
    'no problem!': '👌',
};

/**
 * Get the emoji icon for a word data object.
 * Tries translationEn → word → falls back to category icon.
 */
function getWordIcon(word) {
    const key = (word.translationEn || '').toLowerCase().trim();
    if (key && WORD_ICONS[key]) return WORD_ICONS[key];

    // Fallback: category-level emoji
    const catFallbacks = {
        food: '🍽️',
        color: '🎨',
        numbers: '🔢',
        adjective: '📝',
        shopping: '🛍️',
        health: '❤️',
        orientation: '🧭',
        surrounding: '🌍',
        communication: '💬',
        transport: '🚀',
        time: '⏰',
        technology: '💻',
        verb: '⚡',
        personal: '👤',
        sentences: '📖',
    };
    return catFallbacks[word.category] || '📝';
}

/**
 * Generate a consistent, unique emoji for a word if no predefined icon exists.
 */
function getDeterministicEmoji(wordStr) {
    if (!wordStr) return '📝';
    const fallbackEmojis = [
        '🌟', '🚀', '🎈', '🎨', '🧩', '💎', '💡', '🔥', '🌊', '🍀',
        '☀️', '🌙', '⭐', '🌈', '⚡', '⛄', '🍎', '🍒', '🌻', '🌺',
        '🍁', '🍄', '🌍', '🏠', '🏰', '🗺️', '⚓', '🔔', '🎵', '📺',
        '📸', '📚', '✏️', '🖌️', '🔍', '🔑', '🎁', '🧸', '🧿', '🔮',
        '🪐', '🦖', '🐉', '🦋', '🐢', '🐙', '🦜', '🦄', '🎭', '🎪',
        '🎯', '🎣', '🎳', '🎲', '🧩', '🪄', '💎', '👑', '👒', '🧣',
        '🧤', '👟', '☂️', '😎', '🤠', '👽', '👻', '🤖', '👾', '🎃'
    ];
    let hash = 0;
    for (let i = 0; i < wordStr.length; i++) {
        hash = wordStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return fallbackEmojis[hash % fallbackEmojis.length];
}
