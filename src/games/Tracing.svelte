<script>
    import { onMount } from "svelte";
    import { playSfx } from "../lib/audio.js";
    import { speakPraise } from "../lib/tts.js";

    let { targetLetter = "a", onComplete = () => {} } = $props();

    let canvas;
    let ctx;
    let isDrawing = $state(false);
    let currentRound = $state(1); // 1 = Upper, 2 = Lower
    let isDone = $state(false);

    // Ukuran kuas dan warna
    const brushSize = 35; // Perkecil sedikit sesuai request
    const brushColor = "#FFCA28";

    onMount(() => {
        setupCanvas();
    });

    function setupCanvas() {
        ctx = canvas.getContext("2d");
        // Perbesar canvas sesuai request
        canvas.width = 450;
        canvas.height = 500;
        drawGuideLetter();
    }

    function drawGuideLetter() {
        const char =
            currentRound === 1
                ? targetLetter.toUpperCase()
                : targetLetter.toLowerCase();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Shadow/Template besar di latar
        ctx.font = `bold ${currentRound === 1 ? "420px" : "380px"} Arial, sans-serif`;
        ctx.fillStyle = "#F0F0F0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, canvas.width / 2, canvas.height / 2 + 20);

        // Garis tepi tipis
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#DDDDDD";
        ctx.strokeText(char, canvas.width / 2, canvas.height / 2 + 20);
    }

    function resetGame() {
        isDone = false;
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
    }

    function checkCompletion() {
        // Sensor dihapus sesuai request
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
            style="width: 100%; height: auto; max-width: 450px;"
        ></canvas>
    </div>

    <div class="controls-row flex-row gap-md mt-lg">
        <button class="btn btn-secondary btn-lg" onclick={resetGame}>
            🗑️ Hapus
        </button>
        <button class="btn btn-primary btn-lg" onclick={handleNext}>
            Lanjut 👉
        </button>
    </div>

    <div class="progress-bar-bg mt-md">
        <div
            class="progress-fill"
            style="width: {Math.min(fillPercentage, 100)}%;"
        ></div>
    </div>

    {#if showOverlay}
        <div class="overlay-done flex-col flex-center" style="z-index: 10000;">
            <div class="card-done flex-col flex-center slide-down">
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
