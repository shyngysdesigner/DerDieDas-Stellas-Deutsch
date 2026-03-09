/* ═══════════════════════════════════════════════════════
   word-scenes.js  —  Animated visual scenes for word modal
   Each scene = layered emoji divs + CSS keyframe classes
   Phrase clicks trigger a ripple/burst effect on the stage
   ═══════════════════════════════════════════════════════ */

const WordScenes = (() => {

    /* ── Per-word overrides (translationEn → scene config) ── */
    const SCENES = {
        // ── Food & Drink ──────────────────────────────────────
        'food': { bg: '#FFF3E0', particles: ['🍽️', '✨', '🥢'], main: '🍽️', anim: 'float' },
        'restaurant': { bg: '#FFF8F0', particles: ['🍴', '🕯️', '🌹'], main: '🍴', anim: 'sway' },
        'café': { bg: '#F5E6D3', particles: ['☕', '💨', '🥐'], main: '☕', anim: 'steam' },
        'bar': { bg: '#FFF0E6', particles: ['🍺', '🍻', '✨'], main: '🍺', anim: 'bounce' },
        'menu': { bg: '#F0F4FF', particles: ['📋', '✏️', '🔖'], main: '📋', anim: 'float' },
        'starter': { bg: '#F0FFF4', particles: ['🥗', '🌿', '✨'], main: '🥗', anim: 'sway' },
        'main course': { bg: '#FFF3E0', particles: ['🥩', '🔥', '🌿'], main: '🥩', anim: 'sizzle' },
        'dessert': { bg: '#FFF0F5', particles: ['🍰', '🍓', '✨'], main: '🍰', anim: 'bounce' },
        'bill': { bg: '#F5F5FF', particles: ['🧾', '💳', '💰'], main: '🧾', anim: 'float' },
        'vegetarian': { bg: '#F0FFF4', particles: ['🥦', '🌿', '💚'], main: '🥦', anim: 'sway' },
        'vegan': { bg: '#EFFFEE', particles: ['🌱', '🌍', '💚'], main: '🌱', anim: 'grow' },
        'gluten-free': { bg: '#FFF5F5', particles: ['🚫', '🌾', '✅'], main: '🚫', anim: 'pulse' },
        'fish': { bg: '#E6F7FF', particles: ['🐟', '🌊', '💧'], main: '🐟', anim: 'swim' },
        'meat': { bg: '#FFF0EB', particles: ['🥩', '🔥', '🫕'], main: '🥩', anim: 'sizzle' },
        'salad': { bg: '#F0FFF4', particles: ['🥗', '🥕', '🌿'], main: '🥗', anim: 'spin' },
        'milk': { bg: '#F5F5FF', particles: ['🥛', '🐄', '💧'], main: '🥛', anim: 'pour' },
        'cheese': { bg: '#FFFBEA', particles: ['🧀', '🐭', '✨'], main: '🧀', anim: 'bounce' },
        'fruits': { bg: '#FFF5F0', particles: ['🍎', '🍊', '🍇'], main: '🍎', anim: 'bounce' },
        'vegetables': { bg: '#EFFFEE', particles: ['🥕', '🥦', '🍅'], main: '🥕', anim: 'sway' },
        'nuts': { bg: '#FFF8F0', particles: ['🥜', '🌰', '🍂'], main: '🥜', anim: 'spin' },
        'coffee': { bg: '#F5E6D3', particles: ['☕', '💨', '🫘'], main: '☕', anim: 'steam' },
        'tea': { bg: '#F0FFF4', particles: ['🍵', '🌿', '💨'], main: '🍵', anim: 'steam' },
        'water': { bg: '#E6F7FF', particles: ['💧', '🌊', '💦'], main: '💧', anim: 'drip' },
        'wine': { bg: '#FFF0F5', particles: ['🍷', '🍇', '✨'], main: '🍷', anim: 'sway' },
        'beer': { bg: '#FFFBEA', particles: ['🍺', '🍻', '🫧'], main: '🍺', anim: 'foam' },
        'non-alcoholic': { bg: '#F0FFF4', particles: ['🧃', '💧', '🌿'], main: '🧃', anim: 'float' },
        'cheers!': { bg: '#FFF8F0', particles: ['🥂', '🎉', '✨'], main: '🥂', anim: 'clink' },

        // ── Colors ────────────────────────────────────────────
        'color': { bg: '#FFF8FF', particles: ['🎨', '🖌️', '🌈'], main: '🎨', anim: 'spin' },
        'white': { bg: '#FAFAFA', particles: ['⬜', '🕊️', '✨'], main: '⬜', anim: 'pulse' },
        'black': { bg: '#F0F0F0', particles: ['⬛', '🌑', '✨'], main: '⬛', anim: 'pulse' },
        'red': { bg: '#FFF0F0', particles: ['🔴', '❤️', '🌹'], main: '🔴', anim: 'pulse' },
        'blue': { bg: '#F0F4FF', particles: ['🔵', '💙', '🌊'], main: '🔵', anim: 'float' },
        'green': { bg: '#EFFFEE', particles: ['🟢', '💚', '🌿'], main: '🟢', anim: 'bounce' },
        'yellow': { bg: '#FFFDE7', particles: ['🟡', '⭐', '☀️'], main: '🟡', anim: 'spin' },
        'colorful': { bg: '#FFF8FF', particles: ['🌈', '🎨', '✨'], main: '🌈', anim: 'arc' },

        // ── Numbers ───────────────────────────────────────────
        'one': { bg: '#F0F4FF', particles: ['1️⃣', '✨', '⭐'], main: '1️⃣', anim: 'bounce' },
        'two': { bg: '#F0F4FF', particles: ['2️⃣', '✨', '⭐'], main: '2️⃣', anim: 'bounce' },
        'three': { bg: '#F0F4FF', particles: ['3️⃣', '✨', '⭐'], main: '3️⃣', anim: 'bounce' },
        'four': { bg: '#F0F4FF', particles: ['4️⃣', '✨', '⭐'], main: '4️⃣', anim: 'bounce' },
        'five': { bg: '#F0F4FF', particles: ['5️⃣', '✨', '⭐'], main: '5️⃣', anim: 'bounce' },
        'six': { bg: '#F0F4FF', particles: ['6️⃣', '✨', '⭐'], main: '6️⃣', anim: 'bounce' },
        'seven': { bg: '#F0F4FF', particles: ['7️⃣', '✨', '⭐'], main: '7️⃣', anim: 'bounce' },
        'eight': { bg: '#F0F4FF', particles: ['8️⃣', '✨', '⭐'], main: '8️⃣', anim: 'bounce' },
        'nine': { bg: '#F0F4FF', particles: ['9️⃣', '✨', '⭐'], main: '9️⃣', anim: 'bounce' },
        'ten': { bg: '#F0F4FF', particles: ['🔟', '✨', '⭐'], main: '🔟', anim: 'bounce' },
        'hundred': { bg: '#FFFDE7', particles: ['💯', '🎯', '✨'], main: '💯', anim: 'spin' },

        // ── Adjectives ────────────────────────────────────────
        'good': { bg: '#EFFFEE', particles: ['👍', '✅', '😊'], main: '👍', anim: 'bounce' },
        'bad': { bg: '#FFF5F5', particles: ['👎', '❌', '😞'], main: '👎', anim: 'shake' },
        'new': { bg: '#F0F4FF', particles: ['✨', '🆕', '💫'], main: '✨', anim: 'sparkle' },
        'old': { bg: '#FFF8F0', particles: ['🏺', '🍂', '🕰️'], main: '🏺', anim: 'sway' },
        'young': { bg: '#F0FFF4', particles: ['🌱', '🌟', '💚'], main: '🌱', anim: 'grow' },
        'big': { bg: '#F5F0FF', particles: ['🐘', '🏔️', '⬆️'], main: '🐘', anim: 'pulse' },
        'small': { bg: '#F0FFF4', particles: ['🐭', '🔍', '⬇️'], main: '🐭', anim: 'bounce' },
        'beautiful': { bg: '#FFF0F5', particles: ['🌺', '✨', '💫'], main: '🌺', anim: 'bloom' },
        'cheap': { bg: '#EFFFEE', particles: ['🏷️', '💚', '😊'], main: '🏷️', anim: 'sway' },
        'expensive': { bg: '#FFF8F0', particles: ['💎', '💸', '👑'], main: '💎', anim: 'sparkle' },
        'dark': { bg: '#F0F0F5', particles: ['🌑', '🌙', '⭐'], main: '🌑', anim: 'float' },
        'bright': { bg: '#FFFDE7', particles: ['☀️', '✨', '💡'], main: '☀️', anim: 'glow' },
        'together': { bg: '#F0FFF4', particles: ['🤝', '💪', '❤️'], main: '🤝', anim: 'pulse' },
        'separate': { bg: '#FFF5F5', particles: ['✂️', '↔️', '🔀'], main: '✂️', anim: 'spin' },
        'important': { bg: '#FFFDE7', particles: ['⭐', '❗', '🎯'], main: '⭐', anim: 'glow' },
        'tired': { bg: '#F5F0FF', particles: ['😴', '💤', '🌙'], main: '😴', anim: 'droop' },

        // ── Shopping ──────────────────────────────────────────
        'supermarket': { bg: '#F0F4FF', particles: ['🛒', '🏪', '💳'], main: '🛒', anim: 'roll' },
        'cash': { bg: '#EFFFEE', particles: ['💵', '💰', '🪙'], main: '💵', anim: 'float' },
        'bank card': { bg: '#F0F4FF', particles: ['💳', '💫', '✅'], main: '💳', anim: 'sway' },
        'bag': { bg: '#FFF8F0', particles: ['👜', '🛍️', '✨'], main: '👜', anim: 'sway' },
        'help': { bg: '#FFF0F5', particles: ['🆘', '🚨', '❤️'], main: '🆘', anim: 'pulse' },
        'police': { bg: '#F0F4FF', particles: ['🚔', '🚔', '🔵'], main: '🚔', anim: 'flash' },
        'toothbrush': { bg: '#F0FFF4', particles: ['🪥', '💧', '✨'], main: '🪥', anim: 'scrub' },

        // ── Health ────────────────────────────────────────────
        'doctor': { bg: '#F0FFF4', particles: ['👨‍⚕️', '❤️', '💊'], main: '👨‍⚕️', anim: 'pulse' },
        'hospital': { bg: '#F0F4FF', particles: ['🏥', '🚑', '❤️'], main: '🏥', anim: 'float' },
        'pharmacy': { bg: '#EFFFEE', particles: ['💊', '🧪', '💚'], main: '💊', anim: 'bounce' },
        'painkiller': { bg: '#FFF5F5', particles: ['💊', '🤕', '✅'], main: '💊', anim: 'pulse' },
        'medicine': { bg: '#F0FFF4', particles: ['💊', '🩺', '❤️'], main: '💊', anim: 'float' },
        'pain': { bg: '#FFF5F5', particles: ['🤕', '❗', '💢'], main: '🤕', anim: 'shake' },
        'back': { bg: '#F5F0FF', particles: ['🦵', '💆', '✨'], main: '💆', anim: 'float' },
        'foot': { bg: '#FFF8F0', particles: ['🦶', '👟', '🌿'], main: '🦶', anim: 'walk' },
        'stomach': { bg: '#FFF0EB', particles: ['🤢', '💊', '😣'], main: '🤢', anim: 'shake' },
        'leg': { bg: '#F5F0FF', particles: ['🦵', '👟', '🚶'], main: '🦵', anim: 'walk' },
        'head': { bg: '#F0F4FF', particles: ['🧠', '💡', '☝️'], main: '🧠', anim: 'pulse' },
        'hand': { bg: '#FFF8F0', particles: ['🖐️', '👐', '✋'], main: '🖐️', anim: 'wave' },
        'arm': { bg: '#FFF5F0', particles: ['💪', '🦾', '✨'], main: '💪', anim: 'flex' },

        // ── Orientation ───────────────────────────────────────
        'direction': { bg: '#F0F4FF', particles: ['🧭', '⬆️', '↗️'], main: '🧭', anim: 'spin' },
        'entrance': { bg: '#EFFFEE', particles: ['🚪', '➡️', '✅'], main: '🚪', anim: 'open' },
        'exit': { bg: '#FFF5F5', particles: ['🚪', '⬅️', '👋'], main: '🚪', anim: 'open' },
        'street': { bg: '#F5F5FF', particles: ['🛣️', '🚗', '🏙️'], main: '🛣️', anim: 'scroll' },
        'way': { bg: '#F0FFF4', particles: ['🛤️', '🚶', '🌿'], main: '🛤️', anim: 'scroll' },
        'square': { bg: '#FFF8F0', particles: ['🏛️', '🕊️', '☀️'], main: '🏛️', anim: 'float' },
        'right': { bg: '#EFFFEE', particles: ['➡️', '👉', '✅'], main: '➡️', anim: 'slide' },
        'left': { bg: '#F0F4FF', particles: ['⬅️', '👈', '💙'], main: '⬅️', anim: 'slide' },
        'straight ahead': { bg: '#F5F5FF', particles: ['⬆️', '🛤️', '🎯'], main: '⬆️', anim: 'rise' },
        'back': { bg: '#FFF8F0', particles: ['↩️', '⬅️', '👣'], main: '↩️', anim: 'slide' },

        // ── Surrounding ───────────────────────────────────────
        'house': { bg: '#FFF8F0', particles: ['🏠', '🌳', '☀️'], main: '🏠', anim: 'float' },
        'apartment': { bg: '#F0F4FF', particles: ['🏢', '🪟', '🌆'], main: '🏢', anim: 'float' },
        'hotel': { bg: '#FFFDE7', particles: ['🏨', '🛎️', '🌟'], main: '🏨', anim: 'sway' },
        'museum': { bg: '#F5F0FF', particles: ['🏛️', '🎨', '🏺'], main: '🏛️', anim: 'float' },
        'beach': { bg: '#E6F7FF', particles: ['🏖️', '🌊', '☀️'], main: '🏖️', anim: 'wave' },
        'forest': { bg: '#EFFFEE', particles: ['🌲', '🦌', '🍃'], main: '🌲', anim: 'sway' },
        'mountain': { bg: '#F5F0FF', particles: ['⛰️', '🦅', '❄️'], main: '⛰️', anim: 'float' },
        'park': { bg: '#EFFFEE', particles: ['🌳', '🌸', '🦋'], main: '🌳', anim: 'bloom' },
        'river': { bg: '#E6F7FF', particles: ['🏞️', '🌊', '🐟'], main: '🏞️', anim: 'flow' },
        'sea': { bg: '#E6F7FF', particles: ['🌊', '🐬', '⛵'], main: '🌊', anim: 'wave' },
        'lake': { bg: '#E6F7FF', particles: ['🏞️', '🚣', '🌿'], main: '🏞️', anim: 'gentle' },
        'weather': { bg: '#F0F8FF', particles: ['🌤️', '🌡️', '🌈'], main: '🌤️', anim: 'float' },
        'sun': { bg: '#FFFDE7', particles: ['☀️', '🌟', '✨'], main: '☀️', anim: 'glow' },
        'rain': { bg: '#E6F0FF', particles: ['🌧️', '💧', '☔'], main: '🌧️', anim: 'drip' },
        'snow': { bg: '#F0F8FF', particles: ['❄️', '⛄', '🌨️'], main: '❄️', anim: 'fall' },
        'thunderstorm': { bg: '#F0F0F5', particles: ['⛈️', '⚡', '🌩️'], main: '⛈️', anim: 'flash' },

        // ── Communication ─────────────────────────────────────
        'hi!': { bg: '#FFF8F0', particles: ['👋', '😊', '✨'], main: '👋', anim: 'wave' },
        'hello!': { bg: '#FFF8F0', particles: ['👋', '😄', '🌟'], main: '👋', anim: 'wave' },
        'goodbye!': { bg: '#F5F0FF', particles: ['👋', '💙', '✨'], main: '👋', anim: 'wave' },
        'thank you!': { bg: '#EFFFEE', particles: ['🙏', '❤️', '✨'], main: '🙏', anim: 'bow' },
        'please!': { bg: '#FFF0F5', particles: ['🫶', '💕', '✨'], main: '🫶', anim: 'pulse' },
        'sorry!': { bg: '#FFF5F5', particles: ['😔', '🙏', '💙'], main: '😔', anim: 'droop' },
        'stop!': { bg: '#FFF0F0', particles: ['🛑', '❗', '✋'], main: '🛑', anim: 'pulse' },
        'caution!': { bg: '#FFFDE7', particles: ['⚠️', '❗', '🔶'], main: '⚠️', anim: 'flash' },
        'yes': { bg: '#EFFFEE', particles: ['✅', '👍', '😊'], main: '✅', anim: 'bounce' },
        'no': { bg: '#FFF5F5', particles: ['❌', '👎', '🚫'], main: '❌', anim: 'shake' },

        // ── Transport ─────────────────────────────────────────
        'train': { bg: '#F0F4FF', particles: ['🚂', '💨', '🛤️'], main: '🚂', anim: 'chug' },
        'bus': { bg: '#FFF8F0', particles: ['🚌', '🛑', '🌆'], main: '🚌', anim: 'drive' },
        'car': { bg: '#F5F5FF', particles: ['🚗', '💨', '🛣️'], main: '🚗', anim: 'drive' },
        'tram': { bg: '#F0FFF4', particles: ['🚋', '⚡', '🏙️'], main: '🚋', anim: 'slide' },
        'taxi': { bg: '#FFFDE7', particles: ['🚕', '💛', '📍'], main: '🚕', anim: 'drive' },
        'bicycle': { bg: '#EFFFEE', particles: ['🚲', '🌿', '💨'], main: '🚲', anim: 'spin' },
        'on foot': { bg: '#F5F5F5', particles: ['🚶', '👟', '🛤️'], main: '🚶', anim: 'walk' },
        'train station': { bg: '#F0F4FF', particles: ['🏣', '🚂', '🕐'], main: '🏣', anim: 'float' },
        'bus station': { bg: '#FFF8F0', particles: ['🚏', '🚌', '👥'], main: '🚏', anim: 'float' },
        'stop': { bg: '#FFF0F0', particles: ['🛑', '🚏', '✋'], main: '🛑', anim: 'pulse' },

        // ── Time ──────────────────────────────────────────────
        'time': { bg: '#FFFDE7', particles: ['⏰', '⌚', '⏳'], main: '⏰', anim: 'tick' },
        'day': { bg: '#FFFDE7', particles: ['📅', '☀️', '🌤️'], main: '📅', anim: 'float' },
        'week': { bg: '#F5F5FF', particles: ['📆', '7️⃣', '📅'], main: '📆', anim: 'flip' },
        'month': { bg: '#F0F4FF', particles: ['🗓️', '🌕', '📅'], main: '🗓️', anim: 'sway' },
        'year': { bg: '#FFF8F0', particles: ['📅', '🎆', '🌟'], main: '📅', anim: 'spin' },
        'monday': { bg: '#FFF5F0', particles: ['📅', '🌑', '☕'], main: '😪', anim: 'droop' },
        'tuesday': { bg: '#FFF8F0', particles: ['📅', '🔥', '💪'], main: '💪', anim: 'flex' },
        'wednesday': { bg: '#F0FFF4', particles: ['📅', '🐪', '🌿'], main: '🐪', anim: 'sway' },
        'thursday': { bg: '#F5F0FF', particles: ['📅', '⚡', '💜'], main: '⚡', anim: 'flash' },
        'friday': { bg: '#FFFDE7', particles: ['📅', '🎉', '🏖️'], main: '🎉', anim: 'bounce' },
        'saturday': { bg: '#FFF0F5', particles: ['🎉', '🎊', '✨'], main: '🎊', anim: 'pop' },
        'sunday': { bg: '#F0FFF4', particles: ['😴', '☀️', '💤'], main: '😴', anim: 'float' },
        'in the morning': { bg: '#FFFDE7', particles: ['🌅', '☕', '🐦'], main: '🌅', anim: 'rise' },
        'in the afternoon': { bg: '#FFF8E0', particles: ['🌞', '🌤️', '☀️'], main: '🌞', anim: 'glow' },
        'in the evening': { bg: '#F5F0FF', particles: ['🌆', '🌙', '✨'], main: '🌆', anim: 'float' },
        'at night': { bg: '#1A1A2E', particles: ['🌙', '⭐', '✨'], main: '🌙', anim: 'float', dark: true },
        'earlier': { bg: '#F0F4FF', particles: ['⏪', '🕐', '💨'], main: '⏪', anim: 'slide' },
        'later': { bg: '#FFF8F0', particles: ['⏩', '🕗', '🌅'], main: '⏩', anim: 'slide' },
        'on time': { bg: '#EFFFEE', particles: ['✅', '⏰', '👍'], main: '✅', anim: 'bounce' },
        'delayed': { bg: '#FFF5F5', particles: ['⏳', '😤', '❗'], main: '⏳', anim: 'shake' },

        // ── Technology ────────────────────────────────────────
        'internet': { bg: '#F0F4FF', particles: ['🌐', '📶', '💻'], main: '🌐', anim: 'spin' },
        'password': { bg: '#F5F0FF', particles: ['🔒', '🔑', '💻'], main: '🔒', anim: 'pulse' },
        'computer': { bg: '#F0F4FF', particles: ['💻', '⌨️', '🖱️'], main: '💻', anim: 'glow' },
        'socket': { bg: '#FFF8F0', particles: ['🔌', '⚡', '💡'], main: '🔌', anim: 'flash' },
        'to recharge': { bg: '#EFFFEE', particles: ['🔋', '⚡', '✅'], main: '🔋', anim: 'charge' },

        // ── Verbs ─────────────────────────────────────────────
        'to work': { bg: '#FFF8F0', particles: ['💼', '⏰', '💪'], main: '💼', anim: 'sway' },
        'to visit': { bg: '#F0FFF4', particles: ['🗺️', '✈️', '👋'], main: '🗺️', anim: 'float' },
        'to stay': { bg: '#FFF8F0', particles: ['🏠', '💙', '🔒'], main: '🏠', anim: 'pulse' },
        'to need': { bg: '#FFF5F5', particles: ['🤲', '❤️', '✨'], main: '🤲', anim: 'float' },
        'to ask': { bg: '#F0F4FF', particles: ['❓', '💬', '🤔'], main: '❓', anim: 'bounce' },
        'to give': { bg: '#EFFFEE', particles: ['🎁', '💚', '🤲'], main: '🎁', anim: 'bounce' },
        'to go': { bg: '#F5F5FF', particles: ['🚶', '➡️', '💨'], main: '🚶', anim: 'walk' },
        'to have': { bg: '#FFF8F0', particles: ['🤲', '💼', '✨'], main: '🤲', anim: 'float' },
        'to buy': { bg: '#F0FFF4', particles: ['🛍️', '💳', '✅'], main: '🛍️', anim: 'sway' },
        'can': { bg: '#F0F4FF', particles: ['💪', '✅', '⚡'], main: '💪', anim: 'flex' },
        'to learn': { bg: '#F5F0FF', particles: ['📚', '🧠', '✨'], main: '📚', anim: 'float' },
        'to make': { bg: '#FFF8F0', particles: ['🔨', '⚙️', '✨'], main: '🔨', anim: 'hammer' },
        'to take': { bg: '#F0FFF4', particles: ['✋', '→', '📦'], main: '✋', anim: 'grab' },
        'to say': { bg: '#F0F4FF', particles: ['💬', '🗣️', '✨'], main: '💬', anim: 'pop' },
        'to write': { bg: '#FFF8F0', particles: ['✍️', '📝', '🖊️'], main: '✍️', anim: 'write' },
        'to see': { bg: '#F0F8FF', particles: ['👁️', '🔍', '✨'], main: '👁️', anim: 'blink' },
        'to be': { bg: '#F5F0FF', particles: ['🌟', '✨', '💫'], main: '🌟', anim: 'glow' },
        'to search': { bg: '#F0F4FF', particles: ['🔍', '🔎', '✨'], main: '🔍', anim: 'scan' },
        'to call': { bg: '#EFFFEE', particles: ['📞', '📱', '💬'], main: '📞', anim: 'ring' },
        'to drink': { bg: '#E6F7FF', particles: ['🥤', '💧', '😊'], main: '🥤', anim: 'pour' },
        'to know': { bg: '#F5F0FF', particles: ['🧠', '💡', '✨'], main: '🧠', anim: 'glow' },
        'to want': { bg: '#FFF0F5', particles: ['💭', '❤️', '✨'], main: '💭', anim: 'float' },
        'to pay': { bg: '#EFFFEE', particles: ['💳', '💰', '✅'], main: '💳', anim: 'swipe' },

        // ── Personal ──────────────────────────────────────────
        'first name': { bg: '#F0F4FF', particles: ['🏷️', '👤', '✨'], main: '🏷️', anim: 'float' },
        'last name': { bg: '#F5F0FF', particles: ['🪪', '👤', '✨'], main: '🪪', anim: 'sway' },
        'address': { bg: '#EFFFEE', particles: ['📍', '🏠', '🗺️'], main: '📍', anim: 'pulse' },
        'country': { bg: '#F0F4FF', particles: ['🌍', '🗺️', '✈️'], main: '🌍', anim: 'spin' },
        'place of birth': { bg: '#FFF8F0', particles: ['📌', '🏥', '❤️'], main: '📌', anim: 'pulse' },
        'date of birth': { bg: '#FFF0F5', particles: ['🎂', '🎉', '🎈'], main: '🎂', anim: 'bounce' },
        'profession': { bg: '#F0FFF4', particles: ['💼', '🏆', '✨'], main: '💼', anim: 'float' },
        'man': { bg: '#F0F4FF', particles: ['👨', '💙', '✨'], main: '👨', anim: 'float' },
        'woman': { bg: '#FFF0F5', particles: ['👩', '💕', '✨'], main: '👩', anim: 'float' },
        'adult': { bg: '#F5F5FF', particles: ['🧑', '💼', '🌟'], main: '🧑', anim: 'float' },
        'child': { bg: '#FFF0F5', particles: ['👶', '🎈', '⭐'], main: '👶', anim: 'bounce' },

        // ── Sentences ─────────────────────────────────────────
        'what is it?': { bg: '#F0F4FF', particles: ['❓', '🔍', '💡'], main: '❓', anim: 'bounce' },
        'where is it?': { bg: '#EFFFEE', particles: ['📍', '🔍', '🗺️'], main: '📍', anim: 'pulse' },
        'how?': { bg: '#F5F0FF', particles: ['🤔', '💡', '✨'], main: '🤔', anim: 'swing' },
        'how much is it?': { bg: '#FFF8F0', particles: ['💰', '🏷️', '💳'], main: '💰', anim: 'bounce' },
        'how long does it take?': { bg: '#F0F4FF', particles: ['⏱️', '⏳', '🕐'], main: '⏱️', anim: 'tick' },
        'is there …?': { bg: '#EFFFEE', particles: ['🔎', '❓', '✅'], main: '🔎', anim: 'scan' },
        'i would like…': { bg: '#FFF0F5', particles: ['🙋', '💕', '✨'], main: '🙋', anim: 'wave' },
        'i need…': { bg: '#FFF5F5', particles: ['🙏', '❤️', '✨'], main: '🙏', anim: 'pulse' },
        'no problem!': { bg: '#EFFFEE', particles: ['👌', '😊', '✅'], main: '👌', anim: 'bounce' },
    };

    /* ── Category fallbacks ─────────────────────────────── */
    const CAT_FALLBACKS = {
        food: { bg: '#FFF3E0', particles: ['🍽️', '🍴', '✨'], main: '🍽️', anim: 'float' },
        color: { bg: '#FFF8FF', particles: ['🎨', '🌈', '✨'], main: '🎨', anim: 'spin' },
        numbers: { bg: '#F0F4FF', particles: ['🔢', '💯', '✨'], main: '🔢', anim: 'bounce' },
        adjective: { bg: '#FFFDE7', particles: ['📝', '⭐', '✨'], main: '📝', anim: 'float' },
        shopping: { bg: '#FFF0F5', particles: ['🛍️', '💳', '🏪'], main: '🛍️', anim: 'sway' },
        health: { bg: '#FFF0F5', particles: ['❤️', '💊', '🩺'], main: '❤️', anim: 'pulse' },
        orientation: { bg: '#F0F4FF', particles: ['🧭', '🗺️', '📍'], main: '🧭', anim: 'spin' },
        surrounding: { bg: '#EFFFEE', particles: ['🌍', '🌳', '✨'], main: '🌍', anim: 'float' },
        communication: { bg: '#F0F8FF', particles: ['💬', '🗣️', '✨'], main: '💬', anim: 'pop' },
        transport: { bg: '#F5F5FF', particles: ['🚀', '🚗', '✈️'], main: '🚀', anim: 'fly' },
        time: { bg: '#FFFDE7', particles: ['⏰', '📅', '✨'], main: '⏰', anim: 'tick' },
        technology: { bg: '#F0F4FF', particles: ['💻', '📱', '⚡'], main: '💻', anim: 'glow' },
        verb: { bg: '#F5F0FF', particles: ['⚡', '💫', '✨'], main: '⚡', anim: 'flash' },
        personal: { bg: '#F0FFF4', particles: ['👤', '💙', '✨'], main: '👤', anim: 'float' },
        sentences: { bg: '#FFF8F0', particles: ['📖', '💬', '✨'], main: '📖', anim: 'sway' },
    };

    /* ── Particle position presets ─────────────────────── */
    const POSITIONS = [
        { top: '12%', left: '8%', delay: '0s', dur: '3.2s' },
        { top: '18%', right: '10%', delay: '0.6s', dur: '4.1s' },
        { top: '55%', left: '6%', delay: '1.1s', dur: '3.7s' },
        { top: '60%', right: '8%', delay: '0.3s', dur: '3.9s' },
        { top: '80%', left: '20%', delay: '0.8s', dur: '4.5s' },
        { top: '75%', right: '18%', delay: '1.4s', dur: '3.3s' },
        { top: '35%', left: '3%', delay: '0.2s', dur: '4.8s' },
        { top: '40%', right: '4%', delay: '1.7s', dur: '3.6s' },
    ];

    /* ── Build particle style string from position def ── */
    function posStyle(p) {
        let s = `position:absolute;font-size:22px;`;
        if (p.top) s += `top:${p.top};`;
        if (p.left) s += `left:${p.left};`;
        if (p.right) s += `right:${p.right};`;
        if (p.bottom) s += `bottom:${p.bottom};`;
        s += `animation-delay:${p.delay};animation-duration:${p.dur};animation-iteration-count:infinite;animation-timing-function:ease-in-out;pointer-events:none;user-select:none;`;
        return s;
    }

    /* ── Render a scene config into HTML string ────────── */
    function buildHTML(cfg) {
        const { bg, particles, main, anim, dark } = cfg;
        const textColor = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.06)';

        // Repeat particles cyclically to fill 8 slots
        const pts = POSITIONS.map((pos, i) => {
            const em = particles[i % particles.length];
            return `<div class="ws-particle ws-anim-${anim}" style="${posStyle(pos)}">${em}</div>`;
        }).join('');

        return `
      <div class="ws-stage" style="background:${bg};">
        ${pts}
        <div class="ws-main ws-anim-${anim}-main" style="pointer-events:none;user-select:none;">${main}</div>
        <div class="ws-ripple" id="ws-ripple"></div>
      </div>`;
    }

    /* ── Public: get HTML for a word object ─────────────── */
    function getSceneHTML(word) {
        const key = (word.translationEn || '').toLowerCase().trim();
        const cfg = SCENES[key] || CAT_FALLBACKS[word.category] || CAT_FALLBACKS['sentences'];
        return buildHTML(cfg);
    }

    /* ── Public: trigger phrase-reaction animation ──────── */
    function triggerPhraseReaction(phraseText) {
        const ripple = document.getElementById('ws-ripple');
        const main = document.querySelector('.ws-main');
        if (!ripple || !main) return;

        // Ripple burst
        ripple.classList.remove('ws-ripple-active');
        void ripple.offsetWidth; // reflow
        ripple.classList.add('ws-ripple-active');

        // Main pop
        main.classList.remove('ws-main-pop');
        void main.offsetWidth;
        main.classList.add('ws-main-pop');
        setTimeout(() => main.classList.remove('ws-main-pop'), 600);
    }

    return { getSceneHTML, triggerPhraseReaction };
})();
