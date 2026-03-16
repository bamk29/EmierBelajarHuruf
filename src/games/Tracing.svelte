<script>
    import { onMount } from "svelte";
    import { playSfx } from "../lib/audio.js";
    import { speakPraise } from "../lib/tts.js";

    let { targetLetter = "a", onComplete = () => {} } = $props();

    let canvas;
    let ctx;
    let isDrawing = $state(false);
    let fillPercentage = $state(0);
    let currentRound = $state(1); // 1 = Upper, 2 = Lower (Asumsikan di-update di checkCompletion)
    let isDone = $state(false);
    let showOverlay = $state(false);

    // Ukuran kuas dan warna
    const brushSize = 60; // Dipertebal sesuai request (seukuran jari anak)
    const brushColor = "#FFCA28"; // Kuning emas

    onMount(() => {
        setupCanvas();
    });

    function setupCanvas() {
        ctx = canvas.getContext("2d");
        canvas.width = 300;
        canvas.height = 300;
        drawGuideLetter();
    }

    function drawGuideLetter() {
        const char =
            currentRound === 1
                ? targetLetter.toUpperCase()
                : targetLetter.toLowerCase();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Shadow/Template abu-abu di latar
        ctx.font = `bold ${currentRound === 1 ? "280px" : "240px"} Arial, sans-serif`;
        ctx.fillStyle = "#CCCCCC";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, 150, 160);

        // Garis tepi/outline tipis sebagai panduan tambahan
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#AAAAAA";
        ctx.strokeText(char, 150, 160);
    }

    function resetGame() {
        fillPercentage = 0;
        isDone = false;
        showOverlay = false;
        drawGuideLetter();
    }

    function startDraw(e) {
        if (e.cancelable) e.preventDefault();
        if (isDone) return;
        isDrawing = true;
        draw(e);
    }

    function stopDraw(e) {
        if (e && e.cancelable) e.preventDefault();
        isDrawing = false;
        ctx.beginPath();
        checkCompletion();
    }

    function draw(e) {
        if (e && e.cancelable) e.preventDefault();
        if (!isDrawing || isDone) return;

        let x, y;
        if (e.touches) {
            const rect = canvas.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.offsetX;
            y = e.offsetY;
        }

        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = brushColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Kasar estimasi (Tiap drag naikkan percentage)
        fillPercentage += 0.5;

        // Animasi suara gesek (opsional) mending tidak usah biar ga spam
    }

    function checkCompletion() {
        if (fillPercentage > 100) {
            isDone = true;
            playSfx("coin");
            speakPraise();

            if (currentRound === 1) {
                setTimeout(() => {
                    currentRound = 2;
                    resetGame();
                }, 2000);
            } else {
                setTimeout(() => {
                    showOverlay = true;
                }, 2000);
            }
        }
    }

    function handleNext() {
        onComplete(3); // Selalu bintang 3 karena tracing itu effort
    }
</script>

<div class="game-container flex-col flex-center">
    <h2 class="title">
        Tebalkan <strong
            >{currentRound === 1
                ? targetLetter.toUpperCase()
                : targetLetter.toLowerCase()}</strong
        >
    </h2>
    <div class="round-indicator mb-sm">Langkah {currentRound} dari 2</div>

    <div class="canvas-wrapper">
        <canvas
            bind:this={canvas}
            onmousedown={startDraw}
            onmouseup={stopDraw}
            onmousemove={draw}
            onmouseleave={stopDraw}
            ontouchstart={startDraw}
            ontouchend={stopDraw}
            ontouchmove={draw}
        ></canvas>

        {#if isDone}
            <div class="success-sparks">✨</div>
        {/if}
    </div>

    <div class="progress-bar-bg mt-md">
        <div
            class="progress-fill"
            style="width: {Math.min(fillPercentage, 100)}%;"
        ></div>
    </div>

    {#if showOverlay}
        <div
            class="overlay-done flex-col flex-center slide-down"
            style="z-index: 50;"
        >
            <div class="card-done flex-col flex-center">
                <h2>Penulis Hebat! 📝</h2>
                <div style="font-size: 50px; margin: 10px 0;">⭐⭐⭐</div>
                <div class="flex-row gap-sm" style="margin-top:20px;">
                    <button class="btn btn-secondary" onclick={resetGame}
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
        background: linear-gradient(135deg, #f9fbe7, #dcedc8);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .title {
        color: #558b2f;
        margin-bottom: 20px;
    }

    .canvas-wrapper {
        position: relative;
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 5px dashed #aed581;
    }

    canvas {
        display: block;
        cursor: crosshair;
        touch-action: none; /* Cegah scroll browser saat menggambar */
    }

    .progress-bar-bg {
        width: 300px;
        height: 15px;
        background: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 20px;
    }

    .round-indicator {
        background: #8bc34a;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .progress-fill {
        height: 100%;
        background: #ffca28;
        transition: width 0.1s linear;
    }

    .success-sparks {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 150px;
        pointer-events: none;
        animation: popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(-45deg);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0;
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
        color: #558b2f;
        margin-bottom: 5px;
    }
</style>
