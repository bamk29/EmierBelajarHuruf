<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, initTTS } from "../lib/tts.js";
    import { appState } from "../lib/state.svelte.js";
    import { letters } from "../data/letters.js";

    let wordData = $state(null);
    let syllables = $state([]); // { text: 'BO', id: 0, matched: false }
    let options = $state([]); // { text: 'BO', id: 0 }
    let draggedItem = $state(null);
    let dragPos = $state({ x: 0, y: 0 });
    let isComplete = $state(false);

    // Daftar kata & kalimat untuk game belajar membaca
    const readingWords = [
        { word: "BOLA", syllables: ["BO", "LA"], icon: "⚽" },
        { word: "BUKU", syllables: ["BU", "KU"], icon: "📖" },
        { word: "MATA", syllables: ["MA", "TA"], icon: "👁️" },
        { word: "RODA", syllables: ["RO", "DA"], icon: "🛞" },
        { word: "BAJU", syllables: ["BA", "JU"], icon: "👕" },
        { word: "PADI", syllables: ["PA", "DI"], icon: "🌾" },
        { word: "KAKI", syllables: ["KA", "KI"], icon: "🦶" },
        { word: "DADU", syllables: ["DA", "DU"], icon: "🎲" },
        { word: "TOPI", syllables: ["TO", "PI"], icon: "🧢" },
        { word: "SAPI", syllables: ["SA", "PI"], icon: "🐄" },
        { word: "PAPA", syllables: ["PA", "PA"], icon: "👨" },
        { word: "MAMA", syllables: ["MA", "MA"], icon: "👩" },
        { word: "BUDI", syllables: ["BU", "DI"], icon: "👦" },
        { word: "AYAM", syllables: ["A", "YAM"], icon: "🐔" },
        { word: "IKAN", syllables: ["I", "KAN"], icon: "🐟" },
        { word: "ULAT", syllables: ["U", "LAT"], icon: "🐛" },
        // Kalimat Sederhana
        {
            word: "BUDI BACA BUKU",
            syllables: ["BU", "DI", "BA", "CA", "BU", "KU"],
            icon: "👨‍🏫",
            isSentence: true,
        },
        {
            word: "SAPI MAKAN RUMPUT",
            syllables: ["SA", "PI", "MA", "KAN", "RUM", "PUT"],
            icon: "🐄",
            isSentence: true,
        },
        {
            word: "MAMA MASAK NASI",
            syllables: ["MA", "MA", "MA", "SAK", "NA", "SI"],
            icon: "👩‍🍳",
            isSentence: true,
        },
    ];

    onMount(() => {
        initTTS();
        initGame();
    });

    function initGame() {
        const randomWord =
            readingWords[Math.floor(Math.random() * readingWords.length)];
        wordData = randomWord;

        syllables = randomWord.syllables.map((s, i) => ({
            text: s.toUpperCase(),
            id: i,
            matched: false,
        }));

        options = randomWord.syllables
            .map((s, i) => ({ text: s.toUpperCase(), id: i }))
            .sort(() => Math.random() - 0.5);

        isComplete = false;
        speak(`Ayo susun kata ${randomWord.word}!`);
    }

    function startDrag(e, item) {
        if (e.cancelable) e.preventDefault();
        draggedItem = item;
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        dragPos = { x: clientX, y: clientY };
        speak(item.text);
        playSfx("pop");
    }

    function handleDrag(e) {
        if (!draggedItem) return;
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        dragPos = { x: clientX, y: clientY };
    }

    function handleDrop() {
        if (!draggedItem) return;

        let found = false;
        const targets = document.querySelectorAll(".syllable-target");

        targets.forEach((targetEl) => {
            if (found) return;
            const rect = targetEl.getBoundingClientRect();
            const isInside =
                dragPos.x > rect.left - 20 &&
                dragPos.x < rect.right + 20 &&
                dragPos.y > rect.top - 20 &&
                dragPos.y < rect.bottom + 20;

            if (isInside) {
                const index = parseInt(targetEl.getAttribute("data-index"));
                const isMatched =
                    targetEl.getAttribute("data-matched") === "true";

                if (!isMatched && syllables[index].text === draggedItem.text) {
                    syllables[index].matched = true;
                    options = options.filter((o) => o.id !== draggedItem.id);
                    playSfx("ting");
                    speak(draggedItem.text); // Bunyi suku kata saat tepat
                    found = true;
                    checkComplete();
                }
            }
        });

        if (!found) playSfx("bloop");
        draggedItem = null;
    }

    function checkComplete() {
        if (syllables.every((s) => s.matched)) {
            // Reward koin
            if (appState.child) {
                appState.child.coins += 5;
            }
            speak(`Luar biasa! Kata ini selesai!`);
            setTimeout(() => {
                speakPraise();
                // Auto-advance ke kata berikut secara acak
                initGame();
            }, 2500);
        }
    }
</script>

<svelte:window
    onmousemove={handleDrag}
    ontouchmove={handleDrag}
    onmouseup={handleDrop}
    ontouchend={handleDrop}
/>

<div class="reading-page flex-col flex-center">
    <button class="btn btn-secondary exit-btn" onclick={() => push("/gate")}
        >❌ Keluar</button
    >

    {#if !isComplete}
        <div class="header-area flex-row flex-center gap-md">
            <h1 class="title">Susun Suku Katanya!</h1>
            <button
                class="speaker-btn animate-pulse"
                onclick={() => speak(`Ayo susun kata ${wordData.word}!`)}
                aria-label="Ulangi Suara"
            >
                🔊
            </button>
        </div>

        <div class="word-assembly flex-row gap-lg">
            {#each syllables as s, i}
                <div
                    class="syllable-target flex-center"
                    class:matched={s.matched}
                    data-index={i}
                    data-matched={s.matched}
                >
                    {s.matched ? s.text : "?"}
                </div>
            {/each}
        </div>

        <div class="options-area flex-row gap-md">
            {#each options as opt}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="syllable-card flex-center bounce-in"
                    onmousedown={(e) => startDrag(e, opt)}
                    ontouchstart={(e) => startDrag(e, opt)}
                >
                    {opt.text}
                </div>
            {/each}
        </div>
    {:else}
        <div class="finish-screen flex-col flex-center pop-in">
            <div class="reward-icon">{wordData.icon}</div>
            <h1 class="success-text">{wordData.word.toUpperCase()}!</h1>
            <p>Hebat! Kamu bisa membaca!</p>
            <div class="coin-gain">💰 +5 Ikan Emas</div>

            <div class="action-buttons flex-col gap-sm">
                <button class="btn btn-primary" onclick={initGame}
                    >Lanjut Kata Lain ⏭️</button
                >
                <button class="btn btn-secondary" onclick={() => push("/gate")}
                    >Kembali ke Menu 🏠</button
                >
            </div>
        </div>
    {/if}

    {#if draggedItem}
        <div
            class="drag-preview"
            style="left: {dragPos.x}px; top: {dragPos.y}px;"
        >
            {draggedItem.text}
        </div>
    {/if}
</div>

<style>
    .reading-page {
        height: 100vh;
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
        position: relative;
        overflow: hidden;
        padding: 40px;
    }

    .exit-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 100;
    }

    .header-area {
        margin-bottom: 30px;
    }

    .title {
        color: #2e7d32;
        margin-bottom: 0;
        font-size: 2.5rem;
    }

    .speaker-btn {
        background: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 1.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }

    .speaker-btn:hover {
        transform: scale(1.1);
    }

    .speaker-btn:active {
        transform: scale(0.9);
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }

    .animate-pulse {
        animation: pulse 2s infinite ease-in-out;
    }

    .word-assembly {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
        margin-bottom: 50px;
        width: 100%;
        max-width: 800px;
    }

    .syllable-target {
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.5);
        border: 3px dashed #66bb6a;
        border-radius: 15px;
        font-size: 2rem;
        font-weight: bold;
        color: #1b5e20;
    }

    @media (max-width: 480px) {
        .syllable-target {
            width: 70px;
            height: 70px;
            font-size: 1.5rem;
            border-width: 2px;
        }
        .syllable-card {
            width: 70px;
            height: 70px;
            font-size: 1.5rem;
        }
    }

    .syllable-target.matched {
        background: #fff;
        border-style: solid;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transform: scale(1.05);
    }

    .options-area {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        min-height: 120px;
        width: 100%;
        max-width: 800px;
    }

    .syllable-card {
        width: 85px;
        height: 85px;
        background: white;
        border-bottom: 5px solid #43a047;
        border-radius: 12px;
        font-size: 1.8rem;
        font-weight: bold;
        color: #2e7d32;
        cursor: grab;
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
        transition: transform 0.1s;
    }

    .syllable-card:active {
        cursor: grabbing;
        transform: scale(0.95);
    }

    .drag-preview {
        position: fixed;
        width: 100px;
        height: 100px;
        background: white;
        border-radius: 15px;
        font-size: 2rem;
        font-weight: bold;
        color: #2e7d32;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translate(-50%, -50%);
    }

    .finish-screen {
        background: white;
        padding: 50px;
        border-radius: 30px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .reward-icon {
        font-size: 100px;
        margin-bottom: 10px;
    }

    .success-text {
        font-size: 3rem;
        color: #2e7d32;
        margin: 10px 0;
    }

    .coin-gain {
        font-size: 1.5rem;
        font-weight: bold;
        color: #f57f17;
        margin-bottom: 30px;
    }

    .action-buttons {
        width: 100%;
        max-width: 300px;
    }
</style>
