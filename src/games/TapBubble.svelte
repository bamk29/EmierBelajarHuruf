<script>
    import { onMount, onDestroy } from "svelte";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakEncourage, speakPraise } from "../lib/tts.js";

    let { targetLetter = "a", onComplete = (stars) => {} } = $props();

    // Opsi huruf salah untuk pengecoh
    const decoys = ["b", "d", "p", "i", "u", "e", "o"]
        .filter((l) => l !== targetLetter)
        .slice(0, 3);

    let balloons = $state([]);
    let score = $state(0);
    let mistakes = $state(0);
    let targetMissed = $state(0);
    let currentDifficulty = $state(1); // Makin cepat
    let currentRound = $state(1);
    let maxRounds = 3;
    let targetScore = $derived(currentRound === 3 ? 15 : 5);
    let maxMistakes = 5; // Total salah pencet ATAU kelewatan (missed target)
    let gameInterval;
    let overlayType = $state("none"); // "none", "round", "game", "fail"

    onMount(() => {
        startGame();
    });

    onDestroy(() => {
        clearInterval(gameInterval);
    });

    function startGame() {
        overlayType = "none";
        score = 0;
        mistakes = 0;
        targetMissed = 0;
        balloons = [];
        spawnBalloon();
        let spawnRate = Math.max(700, 1500 - currentDifficulty * 200); // makin ngebut tiap ronde
        gameInterval = setInterval(spawnBalloon, spawnRate);
    }

    function spawnBalloon() {
        // Kalau belum mulai atau sudah menang ronde ini, stop spawn sementara
        if (score >= targetScore) return;

        // Tingkatkan kesulitan perlahan setiap balon muncul jika belum mentok
        if (Math.random() > 0.8 && currentDifficulty < 5) {
            currentDifficulty += 0.2; // Sedikit dinaikkan autonominya
            clearInterval(gameInterval);
            let spawnRate = Math.max(800, 1500 - currentDifficulty * 150);
            gameInterval = setInterval(spawnBalloon, spawnRate);
        }

        // Peluang 50% untuk spawn huruf target vs pengecoh
        // Ronde 1: Besar, Ronde 2: Kecil, Ronde 3: Acak
        let letter;
        const isTarget = Math.random() > 0.4;

        if (isTarget) {
            if (currentRound === 1) letter = targetLetter.toUpperCase();
            else if (currentRound === 2) letter = targetLetter.toLowerCase();
            else
                letter =
                    Math.random() > 0.5
                        ? targetLetter.toUpperCase()
                        : targetLetter.toLowerCase();
        } else {
            const dec = decoys[Math.floor(Math.random() * decoys.length)];
            if (currentRound === 1) letter = dec.toUpperCase();
            else if (currentRound === 2) letter = dec.toLowerCase();
            else
                letter =
                    Math.random() > 0.5 ? dec.toUpperCase() : dec.toLowerCase();
        }

        // Warna acak untuk balon
        const colors = ["#FF7043", "#00BCD4", "#66BB6A", "#FFA726", "#AB47BC"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const balloon = {
            id: Math.random().toString(36).substr(2, 9),
            letter: letter,
            isTarget: isTarget,
            x: 15 + Math.random() * 70, // Posisi X (15% - 85%) supaya tidak nabrak pinggir
            y: 110, // Mulai dari bawah layar
            color: color,
            popped: false,
        };

        balloons.push(balloon);

        // Hapus jika sudah di luar layar setelah 6 detik
        setTimeout(() => {
            // Cek apakah balon target terlewat meletup?
            const b = balloons.find((i) => i.id === balloon.id);
            if (b && !b.popped && b.isTarget) {
                targetMissed += 1;
                mistakes += 1;
                checkFail();
            }
            balloons = balloons.filter((i) => i.id !== balloon.id);
        }, 6000);
    }

    function checkFail() {
        if (mistakes >= maxMistakes && overlayType === "none") {
            // Batas salah/kelewatan melampaui toleransi -> Gagal Ronde
            clearInterval(gameInterval);
            speakEncourage();
            overlayType = "fail";
        }
    }

    function tapBalloon(balloon) {
        if (balloon.popped) return;

        if (balloon.isTarget) {
            // Benar!
            playSfx("pop");
            balloon.popped = true;
            score += 1;
            mistakes = 0; // Reset kesalahan
            // showHint = false; // This variable is not defined in the provided code.

            if (score >= targetScore) {
                clearInterval(gameInterval);
                speakPraise();

                // Infinite: Naikkan ronde secara otomatis tanpa overlay yang memutus game
                setTimeout(() => {
                    handleNextRound();
                }, 2000);
            }
        } else {
            // Salah
            playSfx("bloop");
            balloon.popped = true;
            balloon.wrong = true;
            mistakes += 1;

            checkFail();
        }

        // Update array referensi untuk svelte runes
        balloons = [...balloons];
    }

    function handleNextRound() {
        currentRound += 1;
        currentDifficulty += 1;
        startGame();
    }

    function handleNextGame() {
        onComplete(mistakes === 0 ? 3 : mistakes <= 5 ? 2 : 1);
    }
</script>

<div class="game-container">
    <div
        class="top-bar flex-row space-between"
        style="position: absolute; width:100%; top:20px; padding: 0 40px; z-index:10; pointer-events:none; justify-content: center;"
    >
        <div
            class="round-display"
            style="background: white; margin-right: 15px; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: #E91E63; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 24px;"
        >
            Ronde {currentRound}/{maxRounds} 🚀
        </div>
        <div
            class="score-board"
            style="background: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: var(--color-primary-dark); box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 24px;"
        >
            🎯 {score} / {targetScore}
        </div>
    </div>

    {#each balloons as balloon (balloon.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="balloon float-up cursor-pointer"
            style="left: {balloon.x}%; background-color: {balloon.wrong
                ? '#9E9E9E'
                : balloon.color};"
            class:popped={balloon.popped}
            class:wrong={balloon.wrong}
            onclick={() => tapBalloon(balloon)}
        >
            {#if !balloon.popped || balloon.wrong}
                <span>{balloon.letter}</span>
            {:else}
                <span style="font-size:40px;">💥</span>
            {/if}

            {#if !balloon.popped && !balloon.wrong}
                <div class="string"></div>
            {/if}
        </div>
    {/each}

    {#if overlayType !== "none"}
        <!-- Overlay Tombol Lanjut/Ulangi -->
        <div
            class="overlay-done flex-col flex-center slide-down"
            style="z-index: 50;"
        >
            <div class="card-done flex-col flex-center">
                {#if overlayType === "fail"}
                    <h2 style="color: #E91E63;">Yah, Terlewat! 😢</h2>
                    <p style="font-size: 20px;">
                        Ayo fokus tangkap huruf <b
                            style="color:var(--color-primary)"
                            >{targetLetter.toUpperCase()}</b
                        >
                    </p>
                    <div class="flex-row gap-sm" style="margin-top:20px;">
                        <button class="btn btn-secondary" onclick={startGame}
                            >🔁 Ulangi Ronde</button
                        >
                    </div>
                {:else if overlayType === "round"}
                    <h2>Ronde {currentRound} Lulus! 🎉</h2>
                    <div style="font-size: 50px; margin: 10px 0;">⭐</div>
                    <div class="flex-row gap-sm" style="margin-top:20px;">
                        <button
                            class="btn btn-primary"
                            onclick={handleNextRound}>Makin Cepat! 👉</button
                        >
                    </div>
                {:else if overlayType === "game"}
                    <h2>Hebat Sekali! 🎉</h2>
                    <div style="font-size: 50px; margin: 10px 0;">⭐⭐⭐</div>
                    <div class="flex-row gap-sm" style="margin-top:20px;">
                        <button class="btn btn-secondary" onclick={startGame}
                            >🔁 Ulangi</button
                        >
                        <button class="btn btn-primary" onclick={handleNextGame}
                            >Lanjut Main 👉</button
                        >
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .game-container {
        width: 100%;
        height: 100vh;
        background: linear-gradient(180deg, #81d4fa, #e1f5fe); /* Langit biru */
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
    }

    .slide-down {
        animation: slideDown 0.5s ease-out;
    }
    @keyframes slideDown {
        from {
            top: 70px;
            opacity: 0;
        }
        to {
            top: 100px;
            opacity: 1;
        }
    }

    .balloon {
        position: absolute;
        width: 70px;
        height: 85px;
        border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 36px;
        font-family: var(--font-family-heading);
        font-weight: bold;
        box-shadow:
            inset -5px -5px 10px rgba(0, 0, 0, 0.1),
            0 5px 10px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        touch-action: manipulation;
        bottom: -100px; /* Start dari bawah */
    }

    .balloon span {
        transform: translateY(-5px);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    .string {
        position: absolute;
        bottom: -30px;
        left: 50%;
        width: 2px;
        height: 30px;
        background-color: rgba(255, 255, 255, 0.7);
        transform: translateX(-50%);
    }

    .float-up {
        /* TranslateY dr bawah 120vh ke -20vh selama 6 detik */
        animation: floatUp 6s linear forwards;
    }

    @keyframes floatUp {
        0% {
            transform: translateY(0);
        }
        100% {
            transform: translateY(-120vh);
        }
    }

    .popped {
        background-color: transparent !important;
        box-shadow: none !important;
        animation: none !important;
        transition: all 0.2s;
    }

    .wrong {
        transform: scale(0.9) translateY(40px);
        opacity: 0.5;
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
        color: #4caf50;
        margin-bottom: 5px;
    }
</style>
