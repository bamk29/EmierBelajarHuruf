<script>
    import { onMount, onDestroy } from "svelte";
    import { push } from "svelte-spa-router";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, speakEncourage } from "../lib/tts.js";
    import { letters } from "../data/letters.js";

    // State Game
    let isPlaying = $state(false);
    let score = $state(0);
    let difficulty = $state(1); // Level kecepatan (1 - 5)

    // Kereta
    let cartTargetId = $state(null);
    let cartTargetLetter = $state(null);
    let cartPosition = $state(-100); // Mulai dari sisi kiri luar layar (-100%)

    // Huruf Draggable (3 buah, 1 benar 2 salah)
    let draggableLetters = $state([]);
    let draggedItem = $state(null);
    let dragPos = $state({ x: 0, y: 0 }); // Posisi drag real-time
    let dragHover = $state(false);

    let animationFrame;
    let cartSpeed = $derived(0.2 + difficulty * 0.15); // Semakin tinggi level, kereta makin cepat

    onMount(() => {
        startGame();
    });

    onDestroy(() => {
        cancelAnimationFrame(animationFrame);
    });

    function startGame() {
        score = 0;
        difficulty = 1;
        isPlaying = true;
        nextRound();
    }

    function nextRound() {
        if (score >= 5) {
            isPlaying = false;
            playSfx("coin");
            speakPraise();
            return;
        }

        // Pilih 1 huruf target acak dari daftar A-Z
        const targetData = letters[Math.floor(Math.random() * letters.length)];
        cartTargetId = targetData.id;
        cartTargetLetter = targetData.letter.toUpperCase();
        cartPosition = -30; // Reset ke pinggir kiri

        // Siapkan 3 pilihan huruf di bawah (1 benar, 2 decoy/pengecoh)
        let ops = [targetData];
        while (ops.length < 3) {
            const dec = letters[Math.floor(Math.random() * letters.length)];
            if (!ops.find((o) => o.id === dec.id)) ops.push(dec);
        }
        ops = ops.sort(() => 0.5 - Math.random());
        draggableLetters = ops.map((o) => ({
            id: o.id,
            letter: o.letter.toUpperCase(),
            wrong: false,
            hidden: false,
            x: 0,
            y: 0,
        }));

        speak(
            `Coba masukkan huruf ${targetData.letter.toUpperCase()} ke dalam kereta!`,
        );
        animateCart();
    }

    function animateCart() {
        // Gerakkan kereta ke kanan
        cartPosition += cartSpeed;

        // Kalau kereta lewat batas kanan (120%), dianggap gagal/lewat
        if (cartPosition > 120) {
            speakEncourage();
            playSfx("bloop");
            cancelAnimationFrame(animationFrame);
            // Ulangi round ini saja
            setTimeout(() => {
                cartPosition = -30;
                animateCart();
            }, 1000);
            return;
        }

        animationFrame = requestAnimationFrame(animateCart);
    }

    // --- DRAG & DROP LOGIC ---
    // Menggunakan touch/mouse tracking sederhana agar compatible dengan device balita

    function startDrag(e, item) {
        if (item.hidden) return;

        // Kunci kontrol agar tidak terjadi seleksi teks atau drag bawaan browser
        if (e.cancelable) e.preventDefault();

        draggedItem = item;

        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        dragPos = { x: clientX, y: clientY };

        playSfx("pop");
        speak(item.letter);
    }

    function handleDrag(e) {
        if (!draggedItem) return;
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        dragPos = { x: clientX, y: clientY };
    }

    function drop(e) {
        if (!draggedItem) return;

        const winHeight = window.innerHeight;
        const pointerY = dragPos.y;

        // Area Drop: 45% atas layar
        const isInsideDropzone = pointerY < winHeight * 0.45;

        if (isInsideDropzone) {
            if (draggedItem.id === cartTargetId) {
                playSfx("ting");
                cancelAnimationFrame(animationFrame);
                draggedItem.hidden = true;
                score += 1;
                if (difficulty < 5) difficulty += 0.5;

                setTimeout(() => {
                    draggedItem = null;
                    nextRound();
                }, 1000);
            } else {
                playSfx("bloop");
                draggedItem.wrong = true;
                if (difficulty > 1.5) difficulty -= 0.5;
                speak("Bukan yang itu!");
                setTimeout(() => {
                    if (draggedItem) draggedItem.wrong = false;
                    draggedItem = null;
                }, 500);
            }
        } else {
            // Jika dilepas di luar area, kembalikan ke awal
            draggedItem = null;
        }
    }
</script>

<svelte:window
    on:mousemove={handleDrag}
    on:touchmove={handleDrag}
    on:mouseup={drop}
    on:touchend={drop}
/>

<div class="game-container flex-col">
    <header class="header flex-row space-between">
        <button class="btn btn-secondary back-btn" onclick={() => push("/gate")}
            >❌ Keluar</button
        >
        <div class="score-display">
            🎖️ Kecepatan Lv. {Math.floor(difficulty)} | Skor: {score}/5
        </div>
    </header>

    {#if isPlaying}
        <!-- ATAS: Area Kereta Bergerak -->
        <div class="train-area">
            <!-- Rel Kereta -->
            <div class="track"></div>

            <!-- Gerobak -->
            <div class="cart" style="left: {cartPosition}%;">
                <div class="cart-body flex-center">
                    <!-- Dropzone / Bayangan Huruf -->
                    <div
                        class="shadow-dropzone"
                        class:glow={draggedItem !== null}
                    >
                        {cartTargetLetter}
                    </div>
                </div>
                <div class="wheels">
                    <div class="wheel"></div>
                    <div class="wheel"></div>
                </div>
            </div>
        </div>

        <!-- BAWAH: Area Pilihan Huruf -->
        <div class="inventory-area flex-row flex-center gap-md">
            {#each draggableLetters as item}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="drag-item flex-center"
                    class:hidden={item.hidden}
                    class:wrong={item.wrong}
                    onmousedown={(e) => startDrag(e, item)}
                    ontouchstart={(e) => startDrag(e, item)}
                >
                    {item.letter}
                </div>
            {/each}
        </div>

        {#if draggedItem}
            <div
                class="floating-item flex-center"
                style="left: {dragPos.x}px; top: {dragPos.y}px;"
            >
                {draggedItem.letter}
            </div>
            <div class="instruction">Lepaskan di atas kereta! 🚂</div>
        {/if}
    {:else}
        <!-- GAME OVER / MENANG -->
        <div class="flex-col flex-center pop-in" style="flex:1;">
            <h1 style="font-size: 80px;">🚂⭐⭐⭐</h1>
            <h2 style="color: #4CAF50;">Hebat Sekali!</h2>
            <p style="margin-bottom: 20px;">
                Kamu sudah melatih kecepatan matamu dan refleksmu!
            </p>
            <div class="flex-row gap-sm">
                <button class="btn btn-primary" onclick={startGame}
                    >Main Lagi Cepat 🔄</button
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
        background: linear-gradient(180deg, #e0f7fa, #e8f5e9);
        position: relative;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
    }

    .header {
        padding: var(--space-sm) var(--space-md);
        z-index: 10;
    }

    .score-display {
        background: white;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font-weight: bold;
        color: var(--color-primary-dark);
        box-shadow: var(--shadow-sm);
    }

    /* TRACK & CART (AREA ATAS) */
    .train-area {
        flex: 1;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .track {
        position: absolute;
        bottom: 20%;
        width: 100%;
        height: 10px;
        background-color: #795548;
        border-bottom: 4px solid #5d4037;
    }

    .cart {
        position: absolute;
        bottom: 20%;
        width: 160px;
        height: 120px;
        transform: translate(-50%, 0);
    }

    .cart-body {
        width: 100%;
        height: 100%;
        background-color: #ef5350;
        border: 4px solid #c62828;
        border-radius: 10px 10px 0 0;
        position: relative;
        box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.2);
    }

    .wheels {
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin-top: -10px;
    }

    .wheel {
        width: 40px;
        height: 40px;
        background-color: #424242;
        border-radius: 50%;
        border: 4px solid #212121;
        animation: spinCart 0.5s linear infinite;
    }

    @keyframes spinCart {
        100% {
            transform: rotate(360deg);
        }
    }

    .shadow-dropzone {
        font-size: 70px;
        font-family: var(--font-family-heading);
        font-weight: bold;
        color: rgba(255, 255, 255, 0.4);
        pointer-events: none;
        transition:
            color 0.3s,
            text-shadow 0.3s;
    }

    .glow {
        color: white;
        text-shadow: 0 0 20px #fff59d;
    }

    /* INVENTORY AREA (AREA BAWAH) */
    .inventory-area {
        height: 35%;
        background: rgba(255, 255, 255, 0.5);
        border-top: 4px dashed #bdbdbd;
        padding: var(--space-md);
    }

    .drag-item {
        width: 80px;
        height: 80px;
        background-color: white;
        border-radius: var(--radius-md);
        font-size: 50px;
        font-family: var(--font-family-heading);
        font-weight: bold;
        color: var(--color-primary-dark);
        box-shadow:
            0 5px 0 #90caf9,
            0 8px 10px rgba(0, 0, 0, 0.2);
        cursor: grab;
        transition: transform 0.1s;
    }

    .drag-item:active {
        cursor: grabbing;
        transform: scale(1.1) translateY(-10px);
        box-shadow:
            0 2px 0 #90caf9,
            0 15px 20px rgba(0, 0, 0, 0.3);
    }

    .drag-item.hidden {
        visibility: hidden;
    }

    .floating-item {
        position: fixed;
        width: 100px;
        height: 100px;
        background: white;
        border-radius: 15px;
        font-size: 60px;
        font-weight: bold;
        color: #1976d2;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        border: 4px solid #64b5f6;
    }

    .drag-item.wrong {
        animation: shake 0.3s;
        background-color: #ffcdd2;
        color: #c62828;
    }

    .instruction {
        position: absolute;
        bottom: 20px;
        width: 100%;
        text-align: center;
        font-size: var(--text-lg);
        font-weight: bold;
        color: var(--color-primary-dark);
        pointer-events: none;
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px) rotate(-5deg);
        }
        75% {
            transform: translateX(10px) rotate(5deg);
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
</style>
