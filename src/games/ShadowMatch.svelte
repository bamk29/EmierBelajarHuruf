<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router"; // Tambah manual push
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, speakEncourage } from "../lib/tts.js";

    let { onComplete = (stars) => {} } = $props();

    // Data game (Kata vs Gambar)
    const allWords = [
        { word: "baju", icon: "👕" },
        { word: "bola", icon: "⚽" },
        { word: "buku", icon: "📖" },
        { word: "palu", icon: "🔨" },
        { word: "satu", icon: "1️⃣" },
        { word: "mata", icon: "👁️" },
        { word: "dadu", icon: "🎲" },
        { word: "roda", icon: "🛞" },
    ];

    let currentLevelData = $state([]);
    let shadows = $state([]);
    let words = $state([]);

    let score = $state(0);
    let mistakes = $state(0);
    let totalTargets = 3;

    let selectedWord = $state(null);
    let hintMode = $state(false);

    // State fase: 'intro' (belajar membaca) -> 'playing' (game) -> 'finish'
    let phase = $state("intro");
    let introIndex = $state(0);

    onMount(() => {
        initGame();
    });

    function initGame() {
        // Ambil 3 kata acak
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        currentLevelData = shuffled.slice(0, totalTargets);

        // Kumpulan Shadow (Di sebelah Kanan) diacak letaknya
        shadows = [...currentLevelData]
            .map((item) => ({
                ...item,
                matched: false,
            }))
            .sort(() => 0.5 - Math.random());

        // Kumpulan Kata (Di sebelah Kiri)
        words = [...currentLevelData].map((item) => ({
            ...item,
            matched: false,
            wrong: false,
        }));

        // Mulai Fase Intro
        score = 0;
        mistakes = 0;
        phase = "intro";
        introIndex = 0;
        playIntroVocals();
    }

    function playIntroVocals() {
        if (introIndex < currentLevelData.length) {
            let item = currentLevelData[introIndex];
            speak(`Ini ${item.word}.`);
        }
    }

    function nextIntro() {
        introIndex++;
        if (introIndex < currentLevelData.length) {
            playIntroVocals();
        } else {
            phase = "playing";
            speak("Sekarang, pasangkan kata dengan bentuknya!");
        }
    }

    function selectWord(item) {
        if (item.matched) return;
        playSfx("pop");
        selectedWord = item;
        // Hapus status wrong
        words = words.map((w) => ({ ...w, wrong: false }));
        speak(item.word); // Mengucapkan kata untuk bantuan membacanya
    }

    function tryMatch(shadowItem) {
        if (!selectedWord || shadowItem.matched) return;

        if (shadowItem.word === selectedWord.word) {
            // Benar
            playSfx("ting");
            shadowItem.matched = true;
            selectedWord.matched = true;
            selectedWord = null;
            score += 1;

            if (score === totalTargets) {
                setTimeout(() => {
                    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
                    phase = "finish";
                    speakPraise();
                    onComplete(stars);
                }, 1500);
            }
        } else {
            // Salah
            playSfx("bloop");
            mistakes += 1;
            selectedWord.wrong = true;

            if (mistakes >= 3) {
                hintMode = true;
                speakEncourage();
            }

            setTimeout(() => {
                if (selectedWord) selectedWord.wrong = false;
                selectedWord = null;
            }, 800);
        }
    }
</script>

<div class="game-container flex-col flex-center">
    <button
        class="btn btn-secondary"
        style="position: absolute; top:20px; left:20px;"
        onclick={() => push("/gate")}>❌ Keluar</button
    >

    {#if phase === "intro"}
        <div class="intro-card flex-col flex-center slide-in">
            <h2 style="color:#FF7043; margin-bottom:20px;">
                Belajar Membaca Dulu!
            </h2>

            <div class="intro-icon bounce">
                {currentLevelData[introIndex]?.icon}
            </div>
            <div class="intro-word">
                {currentLevelData[introIndex]?.word.toUpperCase()}
            </div>

            <button
                class="btn btn-primary btn-large"
                style="margin-top:30px;"
                onclick={nextIntro}
            >
                {introIndex < currentLevelData.length - 1
                    ? "Selanjutnya 👉"
                    : "Mulai Main! 🎮"}
            </button>
        </div>
    {:else if phase === "playing"}
        <div class="score-card">🎯 {score}/{totalTargets}</div>
        <h2 class="title">Pasangkan Katanya!</h2>

        {#if hintMode}
            <div class="hint-badge">Dengarkan dan pasangkan perlahan ya!</div>
        {/if}

        <div class="play-area flex-row space-between fade-in">
            <!-- Kolom Kata (Kiri) -->
            <div class="col words-col flex-col gap-md">
                {#each words as word}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="item word-card flex-center"
                        class:selected={selectedWord?.word === word.word}
                        class:matched={word.matched}
                        class:shake={word.wrong}
                        onclick={() => selectWord(word)}
                    >
                        {word.word.toUpperCase()}
                    </div>
                {/each}
            </div>

            <!-- Kolom Shadow/Gambar (Kanan) -->
            <div class="col shadow-col flex-col gap-md">
                {#each shadows as shadow}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="item shadow-card flex-center"
                        class:matched={shadow.matched}
                        class:hint-glow={hintMode &&
                            selectedWord?.word === shadow.word}
                        onclick={() => tryMatch(shadow)}
                    >
                        {#if shadow.matched}
                            <span class="revealed-icon pop-in"
                                >{shadow.icon}</span
                            >
                        {:else}
                            <span class="shadow-icon">{shadow.icon}</span>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {:else if phase === "finish"}
        <!-- SELESAI -->
        <div class="flex-col flex-center pop-in">
            <h1 style="font-size: 80px;">⭐⭐⭐</h1>
            <h2 style="color: #4CAF50;">Pintar Membaca!</h2>
            <p style="margin-bottom: 20px;">
                Kamu sudah melatih matamu dan fokusmu!
            </p>
            <div class="flex-col gap-sm">
                <button class="btn btn-primary" onclick={initGame}
                    >Main Kata Lain 🔄</button
                >
                <button class="btn btn-secondary" onclick={() => push("/gate")}
                    >Kembali ke Menu 🏠</button
                >
            </div>
        </div>
    {/if}
</div>

<style>
    .game-container {
        height: 100vh;
        background: linear-gradient(135deg, #fff9c4, #ffe0b2);
        position: relative;
        padding: var(--space-md);
    }

    .title {
        color: #f57f17;
        margin-bottom: var(--space-xl);
        text-align: center;
    }

    .intro-card {
        background-color: white;
        padding: var(--space-2xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        text-align: center;
    }
    .intro-icon {
        font-size: 100px;
        margin-bottom: 20px;
    }
    .intro-word {
        font-size: 50px;
        font-weight: bold;
        letter-spacing: 5px;
        color: var(--color-primary-dark);
    }
    .btn-large {
        padding: 15px 30px;
        font-size: 24px;
    }

    .score-card {
        position: absolute;
        top: var(--space-md);
        right: var(--space-md);
        background: white;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font-weight: bold;
        color: #f57f17;
        box-shadow: var(--shadow-sm);
    }

    .hint-badge {
        background-color: var(--color-warning);
        color: white;
        padding: 4px 12px;
        border-radius: var(--radius-pill);
        margin-bottom: var(--space-md);
        font-weight: bold;
        animation: pulse 2s infinite;
    }

    .play-area {
        width: 100%;
        max-width: 400px;
    }

    .col {
        width: 45%;
    }

    .item {
        height: 80px;
        border-radius: var(--radius-md);
        font-size: var(--text-2xl);
        font-weight: bold;
        cursor: pointer;
        background-color: white;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s;
        user-select: none;
    }

    .word-card {
        color: var(--color-primary-dark);
        border: 3px solid transparent;
    }

    .word-card.selected {
        transform: scale(1.05);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
    }

    .shadow-card {
        background-color: rgba(0, 0, 0, 0.05);
        border: 3px dashed #bdbdbd;
    }

    .shadow-icon {
        filter: brightness(0) invert(0.8); /* Membuat emoji jadi siluet abu-abu */
        opacity: 0.5;
    }

    .revealed-icon {
        filter: none;
        opacity: 1;
    }

    .matched {
        background-color: #c8e6c9 !important;
        border-color: #4caf50 !important;
        color: #2e7d32 !important;
        pointer-events: none;
        transform: scale(0.95);
        opacity: 0.8;
    }

    /* Animasi Keren */
    .shake {
        animation: shake 0.4s;
    }
    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-5px) rotate(-2deg);
        }
        75% {
            transform: translateX(5px) rotate(2deg);
        }
    }

    .pop-in {
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
        0% {
            transform: scale(0);
        }
        80% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    .slide-in {
        animation: slideIn 0.5s ease-out;
    }
    @keyframes slideIn {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .bounce {
        animation: bounce 2s infinite;
    }
    @keyframes bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    .hint-glow {
        box-shadow: 0 0 15px var(--color-warning);
        border-color: var(--color-warning);
    }

    @keyframes pulse {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
</style>
