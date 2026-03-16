// Audio Manager sederhana menggunakan HTML5 Audio
// (Untuk MVP kita pakai HTML5 biasa daripada Howler.js demi bundle size minimal)

// Cache untuk SFX yang sudah dimuat
const sfxCache = {};

// Background music singleton
let bgmAudio = null;

// Sfx list:
// - pop (balon meletus)
// - ting (benar)
// - bloop (salah/hint)
// - coin (dapat ikan emas/bintang)

export const playSfx = (name) => {
    try {
        // Pada implementasi aslinya, kita pakai base64 ringkas atau ambil dari public/
        // Karena ini MVP dan kita hindari file .mp3 eksternal agar 100% offline langsung jalan,
        // kita akan pakai sintesis Web Audio API sederhana untuk SFX!
        playSynthSfx(name);
    } catch (err) {
        console.error("Gagal main SFX", err);
    }
};

export const playBgm = () => {
    // TODO: implementasi bgm loop
    console.log("Memulai BGM");
};

export const stopBgm = () => {
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
    }
};

// --- Web Audio API Synth (Tanpa butuh file MP3/WAV) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSynthSfx(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'ting') {
        // Bunyi Benar (high pitch bell)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);

    } else if (type === 'bloop') {
        // Bunyi Hint/Remedial (low bloop)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);

    } else if (type === 'pop') {
        // Bunyi balon pacah (quick noise-like pop)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);

    } else if (type === 'coin') {
        // Arpeggio manis buat bintang/ikan
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5 
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gainNode.gain.setValueAtTime(0.3, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    }
}
