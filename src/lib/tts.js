import { appState } from './state.svelte.js';

let synth = window.speechSynthesis;
let idVoice = null;
let voicesLoaded = false;

export const initTTS = () => {
    if (!('speechSynthesis' in window)) return;

    const setVoice = () => {
        const _voices = synth.getVoices();
        if (_voices.length === 0) return;

        // Prioritaskan suara "Google Bahasa Indonesia" (Biasanya Perempuan, HQ di Chrome)
        const googleId = _voices.find(v => v.name.includes("Google Bahasa Indonesia") || v.name.includes("Google id-ID"));

        if (googleId) {
            idVoice = googleId;
        } else {
            // Fallback
            idVoice = _voices.find(v => v.lang === 'id-ID') || _voices[0];
        }
        voicesLoaded = true;
    };

    setVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setVoice;
    }
};

// Fungsi memanggil teks dinamis ("Wah, Budi pintar!")
export const speak = (text, rate = 0.9, pitch = 1.3) => {
    if (!voicesLoaded) {
        initTTS();
        // Berikan delay kecil jika baru saja init agar browser sempat memuat voice
        setTimeout(() => {
            if (voicesLoaded) doSpeak(text, rate, pitch);
        }, 150);
        return;
    }
    doSpeak(text, rate, pitch);
};

const doSpeak = (text, rate, pitch) => {
    // Hentikan suara yang sedang main untuk mencegah tumpang tindih
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (idVoice) utterance.voice = idVoice;

    utterance.lang = "id-ID";
    utterance.volume = 1;
    utterance.pitch = 1.1; // Sedikit dinaikkan pitch-nya untuk kesan ramah anak
    utterance.rate = 1.0; // Kecepatan normal normal kembali

    synth.speak(utterance);
};

// Helper library untuk pujian
export const speakPraise = () => {
    const name = appState.child?.name || 'Pintar';
    const pet = appState.child?.petName || 'Milo';
    const praises = [
        `Hebat sekali ${name}!`,
        `Wah, ${name} luar biasa pin-tarnya!`,
        `Jempol buat ${name}! Kamu keren!`,
        `Lihat ${name}, si ${pet} senang sekali karena kamu pintar!`
    ];
    const random = praises[Math.floor(Math.random() * praises.length)];
    speak(random);
};

export const speakEncourage = () => {
    const name = appState.child?.name || 'Sayang';
    const lines = [
        `Ayo ${name}, coba lagi ya!`,
        `Hampir benar ${name}, semang-at!`,
        `Coba perhatikan baik-baik sekali lagi.`
    ];
    const random = lines[Math.floor(Math.random() * lines.length)];
    speak(random);
};
