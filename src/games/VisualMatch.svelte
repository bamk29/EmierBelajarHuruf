<script>
    import { onMount } from "svelte";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, speakEncourage } from "../lib/tts.js";
    import { letters } from "../data/letters.js";

    let {
        targetLetter = "a",
        targetWord = "Apel",
        targetIcon = "🍎",
        isLessonMode = false,
        onComplete = () => {},
    } = $props();

    let options = $state([]);
    let mistakes = $state(0);
    let currentRound = $state(1);
    let totalRounds = 3;
    let showHint = $state(false);
    let isLevelDone = $state(false);

    onMount(() => {
        initGame();
    });

    function initGame() {
        const letterData = letters.find((l) => l.letter === targetLetter);
        const roundWordData =
            letterData && letterData.words && letterData.words[currentRound - 1]
                ? letterData.words[currentRound - 1]
                : { word: targetWord, icon: targetIcon };

        let currentTargetWord = roundWordData.word;
        let currentTargetIcon = roundWordData.icon;

        let ops = [
            {
                word: currentTargetWord,
                icon: currentTargetIcon,
                isTarget: true,
            },
        ];

        while (ops.length < 3) {
            const dec = letters[Math.floor(Math.random() * letters.length)];
            const decWord = dec.words ? dec.words[0].word : dec.word;
            const decIcon = dec.words ? dec.words[0].icon : dec.icon;

            if (
                !ops.find((o) => o.word === decWord) &&
                decWord !== currentTargetWord
            ) {
                ops.push({ word: decWord, icon: decIcon, isTarget: false });
            }
        }
        ops.sort(() => 0.5 - Math.random());
        options = ops.map((o) => ({ ...o, selected: false, wrong: false }));

        speak(
            `Ronde ${currentRound}. Mana benda yang berawalan huruf ${targetLetter.toUpperCase()}?`,
        );
    }

    function selectOption(opt) {
        if (isLevelDone) return;

        const letterData = letters.find((l) => l.letter === targetLetter);

        speak(opt.word);

        if (opt.isTarget) {
            playSfx("ting");
            opt.selected = true;
            speakPraise();

            if (isLessonMode) {
                setTimeout(() => {
                    isLevelDone = true;
                }, 1000);
                return;
            }

            // Standalone Mode: Auto-advance
            setTimeout(() => {
                if (currentRound >= (letterData?.words?.length || 3)) {
                    currentRound = 1;
                } else {
                    currentRound++;
                }
                initGame();
            }, 2000);
        } else {
            playSfx("bloop");
            opt.wrong = true;
            mistakes++;
            if (mistakes >= 2) {
                showHint = true;
                speakEncourage();
            }
            setTimeout(() => {
                if (opt) opt.wrong = false;
            }, 800);
        }
    }

    function handleNext() {
        if (isLessonMode) {
            // Jika di lesson mode, Ronde ditentukan oleh totalRounds (3)
            if (currentRound < totalRounds) {
                currentRound++;
                isLevelDone = false;
                initGame();
            } else {
                onComplete(mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1);
            }
        } else {
            // Standalone next
            onComplete(3);
        }
    }

    function handleRetry() {
        mistakes = 0;
        isLevelDone = false;
        showHint = false;
        initGame();
    }
</script>

<div class="game-container flex-col flex-center">
    <div class="round-badge">Ronde {currentRound} / {totalRounds}</div>

    <h2 class="title" style="margin-bottom: 50px;">
        Pilih Gambar Berawalan <strong>{targetLetter.toUpperCase()}</strong>
    </h2>

    {#if showHint}
        <div class="hint-badge slide-down">
            Dengarkan Kucing! Berawalan huruf {targetLetter.toUpperCase()}...
        </div>
    {/if}

    <div class="options-row flex-row gap-lg">
        {#each options as opt}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="card-option flex-col flex-center"
                class:selected={opt.selected}
                class:wrong={opt.wrong}
                class:hinted={showHint && opt.isTarget}
                onclick={() => selectOption(opt)}
            >
                <span class="icon">{opt.icon}</span>
                <span class="word">{opt.word}</span>
            </div>
        {/each}
    </div>

    {#if isLevelDone}
        <div class="overlay-done flex-col flex-center" style="z-index: 10000;">
            <div class="card-done flex-col flex-center slide-down">
                <h2>Mata Elang! 🦅</h2>
                <div style="font-size: 50px; margin: 10px 0;">⭐⭐⭐</div>
                <div class="flex-row gap-sm" style="margin-top:20px;">
                    <button class="btn btn-secondary" onclick={handleRetry}
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
        background: linear-gradient(135deg, #fff3e0, #ffe0b2);
        padding: var(--space-md);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .title {
        color: #e65100;
        text-align: center;
        margin-top: 20px;
    }

    .round-badge {
        background: #fb8c00;
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .hint-badge {
        position: absolute;
        top: 100px;
        background: var(--color-warning);
        color: white;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font-weight: bold;
        z-index: 10;
    }

    .card-option {
        width: 100px;
        height: 120px;
        background: white;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.2s;
        border: 4px solid transparent;
    }

    .card-option:active {
        transform: scale(0.95);
    }

    .icon {
        font-size: 50px;
        margin-bottom: 10px;
    }
    .word {
        font-weight: bold;
        color: #5d4037;
        font-size: 14px;
    }

    .selected {
        background: #c8e6c9;
        border-color: #4caf50;
        transform: scale(1.1);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
        pointer-events: none;
    }

    .wrong {
        animation: shake 0.4s;
        background: #ffcdd2;
        border-color: #e53935;
        opacity: 0.7;
    }

    .hinted {
        box-shadow: 0 0 15px #ffca28;
        border-color: #ffca28;
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
        color: #e65100;
        margin-bottom: 5px;
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
</style>
