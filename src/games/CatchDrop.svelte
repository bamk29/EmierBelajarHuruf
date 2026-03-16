<script>
    import { onMount, onDestroy } from "svelte";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, speakEncourage } from "../lib/tts.js";
    import { letters } from "../data/letters.js";

    let { targetLetter = "a", onComplete = () => {} } = $props();

    let basketPos = $state(50);
    let drops = $state([]);
    let score = $state(0);
    let mistakes = $state(0);
    let targetScore = 30;
    let isLevelDone = $state(false);

    let gameActive = false;
    let lastSpawnTime = 0;
    let animationFrame;

    onMount(() => {
        speak(`Ayo tangkap huruf ${targetLetter.toUpperCase()} yang jatuh!`);
        startGame();
    });

    onDestroy(() => {
        gameActive = false;
        cancelAnimationFrame(animationFrame);
    });

    function startGame() {
        score = 0;
        mistakes = 0;
        drops = [];
        isLevelDone = false;
        gameActive = true;
        requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        if (!gameActive) return;

        // Spawn logic
        if (timestamp - lastSpawnTime > 1200 && score < targetScore) {
            spawnDrop();
            lastSpawnTime = timestamp;
        }

        // Update positions
        let nextDrops = [];
        for (let dr of drops) {
            dr.y += 0.8; // Kecepatan halus

            // Cek Kolisi
            if (!dr.caught && dr.y > 82 && dr.y < 92) {
                if (Math.abs(dr.x - basketPos) < 15) {
                    dr.caught = true;
                    handleCatch(dr);
                }
            }

            if (!dr.caught && dr.y < 110) {
                nextDrops.push(dr);
            } else if (dr.caught) {
                // Biarkan sejenak kalau perlu animasi caught, tapi sekarang hapus saja
            }
        }
        drops = nextDrops;

        animationFrame = requestAnimationFrame(gameLoop);
    }

    function spawnDrop() {
        const isTarget = Math.random() > 0.4;
        let letter = isTarget
            ? Math.random() > 0.5
                ? targetLetter.toUpperCase()
                : targetLetter.toLowerCase()
            : letters[Math.floor(Math.random() * letters.length)].letter;

        drops.push({
            id: Math.random().toString(),
            letter: letter,
            isTarget: isTarget,
            x: Math.random() * 70 + 15, // 15% - 85%
            y: -10,
            caught: false,
        });
    }

    function handleCatch(item) {
        if (item.isTarget) {
            playSfx("ting");
            score++;
            if (score >= targetScore) {
                gameActive = false;
                speakPraise();
                setTimeout(() => {
                    isLevelDone = true;
                }, 1000);
            }
        } else {
            playSfx("bloop");
            mistakes++;
            if (mistakes >= 3) speakEncourage();
        }
    }

    function handleNext() {
        onComplete(mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);
    }

    function moveBasket(e) {
        let pointerX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        basketPos = (pointerX / window.innerWidth) * 100;
        if (basketPos < 10) basketPos = 10;
        if (basketPos > 90) basketPos = 90;
    }
</script>

<svelte:window on:mousemove={moveBasket} on:touchmove={moveBasket} />

<div class="game-container" style="z-index: 1;">
    <div class="score-display">🎯 {score} / {targetScore}</div>

    {#each drops as dr (dr.id)}
        {#if !dr.caught && !dr.missed}
            <div
                class="drop-item"
                style="left: {dr.x}%; top: {dr.y}%; z-index: 10;"
            >
                {dr.letter}
            </div>
        {/if}
    {/each}

    <div class="basket-area" style="left: {basketPos}%; z-index: 100;">
        <div
            class="cat-head"
            style="font-size: 85px; text-shadow: 0 4px 8px rgba(0,0,0,0.3); margin-bottom: -15px; z-index: 110;"
        >
            🐱
        </div>
        <!-- Ember Kayu Desain CSS Murni -->
        <div
            class="bucket-wood"
            style="position: relative; width: 110px; height: 75px; background: linear-gradient(to bottom, #a1887f, #5d4037); border-radius: 5px 5px 45px 45px; border: 5px solid #3e2723; box-shadow: 0 6px 12px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; overflow: hidden;"
        >
            <!-- Tekstur Kayu / Garis-garis Ember -->
            <div
                style="width: 100%; height: 10px; background: rgba(0,0,0,0.2); position: absolute; top: 15px;"
            ></div>
            <div
                style="width: 100%; height: 10px; background: rgba(0,0,0,0.2); position: absolute; top: 40px;"
            ></div>
        </div>
    </div>

    {#if isLevelDone}
        <div
            class="overlay-done flex-col flex-center slide-down"
            style="z-index: 50;"
        >
            <div class="card-done flex-col flex-center">
                <h2>Tangkapan Bagus! 🪣</h2>
                <div style="font-size: 50px; margin: 10px 0;">⭐⭐⭐</div>
                <div class="flex-row gap-sm" style="margin-top:20px;">
                    <button
                        class="btn btn-secondary"
                        onclick={() => startGame()}>🔁 Ulangi</button
                    >
                    <button class="btn btn-primary" onclick={() => handleNext()}
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
        background: linear-gradient(180deg, #ce93d8, #f3e5f5);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        overflow: hidden;
        cursor: none;
    }

    .score-display {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 24px;
        font-weight: bold;
        color: #4a148c;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .drop-item {
        position: absolute;
        width: 80px;
        height: 80px;
        background: radial-gradient(circle at 30% 30%, #ff5252, #d32f2f);
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 44px;
        font-weight: 900;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        z-index: 9999 !important;
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    .basket-area {
        position: absolute;
        bottom: 5%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 120px;
        z-index: 500;
    }

    .cat-head {
        z-index: 600;
    }

    .bucket-wood {
        margin-top: -10px;
    }

    .overlay-done {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(74, 20, 140, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }

    .card-done {
        background: white;
        padding: 50px;
        border-radius: 30px;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    .btn {
        padding: 15px 30px;
        font-size: 20px;
        border-radius: 15px;
        cursor: pointer;
        border: none;
        font-weight: bold;
        transition: transform 0.2s;
    }

    .btn:active {
        transform: scale(0.95);
    }

    .btn-primary {
        background: #7b1fa2;
        color: white;
    }
    .btn-secondary {
        background: #e1bee7;
        color: #4a148c;
    }
</style>
