export const letters = [
    // Vokal (Rimba Bunyi)
    {
        id: 'a', letter: 'a',
        words: [
            { word: 'Apel', icon: '🍎' },
            { word: 'Alpukat', icon: '🥑' },
            { word: 'Anggur', icon: '🍇' }
        ],
        phonetic: 'A A Apel'
    },
    {
        id: 'i', letter: 'i',
        words: [
            { word: 'Ikan', icon: '🐟' },
            { word: 'Itik', icon: '🦆' },
            { word: 'Ibu', icon: '👩' }
        ],
        phonetic: 'I I Ikan'
    },
    {
        id: 'u', letter: 'u',
        words: [
            { word: 'Ulat', icon: '🐛' },
            { word: 'Udang', icon: '🦐' },
            { word: 'Uang', icon: '💵' }
        ],
        phonetic: 'U U Ulat'
    },
    {
        id: 'e', letter: 'e',
        words: [
            { word: 'Ember', icon: '🪣' },
            { word: 'Elang', icon: '🦅' },
            { word: 'Es Krim', icon: '🍦' }
        ],
        phonetic: 'E E Ember'
    },
    {
        id: 'o', letter: 'o',
        words: [
            { word: 'Obat', icon: '💊' },
            { word: 'Obeng', icon: '🪛' },
            { word: 'Orang', icon: '👤' }
        ],
        phonetic: 'O O Obat'
    },

    // Konsonan Dasar
    { id: 'b', letter: 'b', words: [{ word: 'Bola', icon: '⚽' }, { word: 'Buku', icon: '📖' }, { word: 'Baju', icon: '👕' }], phonetic: 'B B Bola' },
    { id: 'c', letter: 'c', words: [{ word: 'Cincin', icon: '💍' }, { word: 'Cumi', icon: '🦑' }, { word: 'Cabai', icon: '🌶️' }], phonetic: 'C C Cincin' },
    { id: 'd', letter: 'd', words: [{ word: 'Dadu', icon: '🎲' }, { word: 'Domba', icon: '🐑' }, { word: 'Dasi', icon: '👔' }], phonetic: 'D D Dadu' },
    { id: 'f', letter: 'f', words: [{ word: 'Foto', icon: '📸' }, { word: 'Feri', icon: '⛴️' }, { word: 'Fosil', icon: '🦴' }], phonetic: 'F F Foto' },
    { id: 'g', letter: 'g', words: [{ word: 'Gajah', icon: '🐘' }, { word: 'Gitar', icon: '🎸' }, { word: 'Gelas', icon: '🥛' }], phonetic: 'G G Gajah' },
    { id: 'h', letter: 'h', words: [{ word: 'Harimau', icon: '🐅' }, { word: 'Hidung', icon: '👃' }, { word: 'Hujan', icon: '🌧️' }], phonetic: 'H H Harimau' },
    { id: 'j', letter: 'j', words: [{ word: 'Jam', icon: '⌚' }, { word: 'Jari', icon: '🖐️' }, { word: 'Jeruk', icon: '🍊' }], phonetic: 'J J Jam' },
    { id: 'k', letter: 'k', words: [{ word: 'Kucing', icon: '🐱' }, { word: 'Kuda', icon: '🐎' }, { word: 'Kopi', icon: '☕' }], phonetic: 'K K Kucing' },
    { id: 'l', letter: 'l', words: [{ word: 'Lampu', icon: '💡' }, { word: 'Lidah', icon: '👅' }, { word: 'Lolipop', icon: '🍭' }], phonetic: 'L L Lampu' },
    { id: 'm', letter: 'm', words: [{ word: 'Mobil', icon: '🚗' }, { word: 'Madu', icon: '🍯' }, { word: 'Meja', icon: '🪑' }], phonetic: 'M M Mobil' },
    { id: 'n', letter: 'n', words: [{ word: 'Nanas', icon: '🍍' }, { word: 'Nasi', icon: '🍚' }, { word: 'Nyamuk', icon: '🦟' }], phonetic: 'N N Nanas' },
    { id: 'p', letter: 'p', words: [{ word: 'Palu', icon: '🔨' }, { word: 'Pintu', icon: '🚪' }, { word: 'Pisang', icon: '🍌' }], phonetic: 'P P Palu' },
    { id: 'q', letter: 'q', words: [{ word: 'Quran', icon: '📖' }, { word: 'Qatar', icon: '🇶🇦' }], phonetic: 'Q Q Quran' },
    { id: 'r', letter: 'r', words: [{ word: 'Roda', icon: '🛞' }, { word: 'Rusa', icon: '🦌' }, { word: 'Roti', icon: '🍞' }], phonetic: 'R R Roda' },
    { id: 's', letter: 's', words: [{ word: 'Sapi', icon: '🐄' }, { word: 'Sepatu', icon: '👟' }, { word: 'Susu', icon: '🥛' }], phonetic: 'S S Sapi' },
    { id: 't', letter: 't', words: [{ word: 'Topi', icon: '🧢' }, { word: 'Tikus', icon: '🐭' }, { word: 'Telur', icon: '🥚' }], phonetic: 'T T Topi' },
    { id: 'v', letter: 'v', words: [{ word: 'Vase', icon: '🏺' }, { word: 'Video', icon: '📹' }], phonetic: 'V V Vase' },
    { id: 'w', letter: 'w', words: [{ word: 'Wortel', icon: '🥕' }, { word: 'Wajan', icon: '🍳' }, { word: 'Wayang', icon: '🎭' }], phonetic: 'W W Wortel' },
    { id: 'x', letter: 'x', words: [{ word: 'Xilofon', icon: '🎹' }], phonetic: 'X X Xilofon' },
    { id: 'y', letter: 'y', words: [{ word: 'Yoyo', icon: '🪀' }, { word: 'Yogurt', icon: '🍦' }], phonetic: 'Y Y Yoyo' },
    { id: 'z', letter: 'z', words: [{ word: 'Zebra', icon: '🦓' }, { word: 'Ziper', icon: '🤐' }], phonetic: 'Z Z Zebra' }
];
