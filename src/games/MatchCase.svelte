<script>
    import { onMount } from "svelte";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, speakEncourage } from "../lib/tts.js";
    import { letters } from "../data/letters.js";

    let { targetLetter = "a", onComplete = () => {} } = $props();

    let uppercaseBoxes = $state([]);
    let lowercaseBoxes = $state([]);
    let selectedUpper = $state(null);
    let mistakes = $state(0);
    let matchedCount = $state(0);
    let targetCount = 3;
    let isLevelDone = $state(false);

    // Warna Feedback sesuai request
    const selectedColor = "#FF80AB"; // Pink
    const correctColor = "#4CAF50"; // Default hijau (digunakan untuk outline/base)
    const matchColors = ["#4CAF50", "#2196F3", "#FFC107"]; // Hijau, Biru, Kuning (Kumon style)

    onMount(() => {
        initGame();
    });

    function initGame() {
        mistakes = 0;
        matchedCount = 0;
        isLevelDone = false;

        // Siapkan 1 pasang Target + 2 pasang Decoy
        let ops = [targetLetter];
        while (ops.length < targetCount) {
            const l =
                letters[Math.floor(Math.random() * letters.length)].letter;
            if (!ops.includes(l)) ops.push(l);
        }

        uppercaseBoxes = ops
            .map((l) => ({
                id: l,
                letter: l.toUpperCase(),
                matched: false,
                wrong: false,
                colorIndex: -1,
            }))
            .sort(() => 0.5 - Math.random());
        lowercaseBoxes = ops
            .map((l) => ({
                id: l,
                letter: l.toLowerCase(),
                matched: false,
                wrong: false,
                colorIndex: -1,
            }))
            .sort(() => 0.5 - Math.random());

        speak(`Mari pasangkan huruf BESAR ke huruf kecil!`);
    }

    function selectUpper(box) {
        if (box.matched) return;
        playSfx("pop");
        selectedUpper = box;
        uppercaseBoxes = uppercaseBoxes.map((b) => ({ ...b, wrong: false }));
        lowercaseBoxes = lowercaseBoxes.map((b) => ({ ...b, wrong: false }));
    }

    function tryMatch(lowerBox) {
        if (!selectedUpper || lowerBox.matched) return;

        if (lowerBox.id === selectedUpper.id) {
            playSfx("ting");
            const cIdx = matchedCount;
            const targetId = selectedUpper.id;

            // Update both arrays with new state to trigger reactivity
            uppercaseBoxes = uppercaseBoxes.map((b) =>
                b.id === targetId
                    ? { ...b, matched: true, colorIndex: cIdx }
                    : b,
            );
            lowercaseBoxes = lowercaseBoxes.map((b) =>
                b.id === targetId
                    ? { ...b, matched: true, colorIndex: cIdx }
                    : b,
            );

            selectedUpper = null;
            matchedCount++;

            if (matchedCount === targetCount) {
                speakPraise();

                const isLessonMode = window.location.hash.includes("/lesson");
                if (isLessonMode) {
                    setTimeout(() => {
                        isLevelDone = true;
                    }, 1500);
                    return;
                }

                setTimeout(() => {
                    // Infinite Mode: Main lagi dengan huruf yang diacak ulang
                    initGame();
                }, 2000);
            }
        } else {
            playSfx("bloop");
            speak("Ulangi!");
            mistakes++;
            selectedUpper.wrong = true;
            lowerBox.wrong = true;
            if (mistakes >= 3) speakEncourage();

            setTimeout(() => {
                if (selectedUpper) selectedUpper.wrong = false;
                selectedUpper = null;
            }, 800);
        }
    }

    function handleNext() {
        onComplete(mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);
    }
</script>

<div class="game-container flex-col flex-center">
    <h2 class="title" style="margin-bottom: 40px;">Pasangkan Besar & Kecil!</h2>

    <div
        class="match-area flex-row space-around"
        style="width: 100%; max-width: 300px;"
    >
        <div class="col-upper flex-col gap-md">
            {#each uppercaseBoxes as up, i}
                <div class="match-row flex-row items-center gap-md">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="box big flex-center"
                        class:selected={selectedUpper?.id === up.id}
                        style="background-color: {up.matched
                            ? matchColors[up.colorIndex]
                            : selectedUpper?.id === up.id
                              ? selectedColor
                              : 'white'}; border-color: {up.matched
                            ? 'white'
                            : 'transparent'}; color: {up.matched ||
                        selectedUpper?.id === up.id
                            ? 'white'
                            : '#1565c0'}; pointer-events: {up.matched
                            ? 'none'
                            : 'auto'};"
                        onclick={() => selectUpper(up)}
                    >
                        {up.letter}
                    </div>

                    <!-- Garis Indikator di Sebelah Kanan Kotak Besar -->
                    <div
                        class="indicator-line"
                        class:active={up.matched}
                        style="background-color: {up.matched
                            ? matchColors[up.colorIndex]
                            : '#e0e0e0'};"
                    ></div>
                </div>
            {/each}
        </div>

        <div class="col-lower flex-col gap-md">
            {#each lowercaseBoxes as low}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="box small flex-center"
                    style="background-color: {low.matched
                        ? matchColors[low.colorIndex]
                        : 'white'}; border-color: white; color: {low.matched
                        ? 'white'
                        : '#00838f'}; pointer-events: {low.matched
                        ? 'none'
                        : 'auto'};"
                    onclick={() => tryMatch(low)}
                >
                    {low.letter}
                </div>
            {/each}
        </div>
    </div>

    {#if isLevelDone}
        <div class="overlay-done flex-col flex-center" style="z-index: 10000;">
            <div class="card-done flex-col flex-center slide-down">
                <h2>Hebat Sekali! 🧠</h2>
                <div style="font-size: 50px; margin: 10px 0;">⭐⭐⭐</div>
                <div class="flex-row gap-sm" style="margin-top:20px;">
                    <button class="btn btn-secondary" onclick={initGame}
                        >🔁 Ulangi</button
                    >
                    <button class="btn btn-primary" onclick={handleNext}
                        >Lanjut 👉</button
                    >
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .game-container {
        height: 100vh;
        background: linear-gradient(135deg, #e8eaf6, #c5cae9);
        padding: var(--space-md);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .title {
        color: #283593;
        text-align: center;
    }

    .box {
        width: 90px;
        height: 90px;
        background: white;
        border-radius: var(--radius-lg);
        font-family: var(--font-family-heading);
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 4px solid transparent;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .indicator-line {
        width: 40px;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        transition: background 0.3s;
    }
    .indicator-line.active {
        background: currentColor;
    }

    .match-row {
        position: relative;
    }

    .indicator-line {
        width: 60px;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        transition: all 0.3s;
    }
    .indicator-line.active {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .match-area {
        align-items: flex-start;
        max-width: 500px !important;
        gap: 20px;
    }

    .big {
        font-size: 50px;
        color: #1565c0;
    }
    .small {
        font-size: 40px;
        color: #00838f;
    }

    .selected {
        transform: scale(1.1);
        border-color: #1e88e5;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
    }

    .slide-down {
        animation: slideDown 0.5s ease-out;
    }
    @keyframes slideDown {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-5px) rotate(-5deg);
        }
        75% {
            transform: translateX(5px) rotate(5deg);
        }
    }

    .overlay-done {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }

    .card-done {
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        text-align: center;
    }
    .card-done h2 {
        color: #1e88e5;
        margin-bottom: 5px;
    }
</style>
