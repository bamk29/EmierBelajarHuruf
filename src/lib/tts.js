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
export const speak = (text, rate = 1.0, pitch = 1.1) => {
    if (!voicesLoaded) {
        initTTS();
        // Coba langsung saja, jika idVoice masih null tetap akan bunyi dengan default browser
        doSpeak(text, rate, pitch);
        return;
    }
    doSpeak(text, rate, pitch);
};

const doSpeak = (text, rate, pitch) => {
    if (!synth) return;

    // Hentikan dan resume (beberapa browser butuh resume untuk unlock)
    synth.cancel();
    if (synth.paused) synth.resume();

    const utterance = new SpeechSynthesisUtterance(text);

    // Pastikan idVoice sudah siap
    if (!idVoice) {
        const _v = synth.getVoices();
        idVoice = _v.find(v => v.lang === 'id-ID') || _v[0];
    }

    if (idVoice) utterance.voice = idVoice;

    utterance.lang = "id-ID";
    utterance.volume = 1;
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Bug Fix: Di beberapa browser, utterance perlu di-bind ke event agar tidak di-garbage collect
    utterance.onend = () => { /* end */ };

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

// Fungsi untuk unlock audio di mobile (panggil saat interaksi pertama)
export const unlockTTS = () => {
    if (synth && synth.paused) synth.resume();
    const utterance = new SpeechSynthesisUtterance("");
    synth.speak(utterance);
};
