<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { playSfx } from "../lib/audio.js";
    import { speak, speakPraise, speakEncourage } from "../lib/tts.js";
    import { appState } from "../lib/state.svelte.js";
    import { letters } from "../data/letters.js";

    let {
        targetLetter = $bindable("a"),
        isLessonMode = false,
        onComplete = () => {},
    } = $props();
    let currentLetter = $state("a");

    let word = $state("");
    let icon = $state("");
    let slots = $state([]); // { letter: 'A', filled: false }
    let options = $state([]); // { letter: 'A', id: 1 }
    let draggedItem = $state(null);
    let dragPos = $state({ x: 0, y: 0 });
    let isComplete = $state(false);

    onMount(() => {
        initGame();
    });

    // Sinkronisasi jika targetLetter dari prop berubah (rute berubah di Lesson)
    $effect(() => {
        if (targetLetter !== currentLetter) {
            currentLetter = targetLetter;
            initGame();
        }
    });

    let lastWordIndex = -1;

    function initGame() {
        const data =
            letters.find((l) => l.letter === currentLetter) || letters[0];

        let wordIndex = Math.floor(Math.random() * data.words.length);
        // Jika kata yang dipilih sama dengan kata sebelumnya dan ada lebih dari 1 kata, cari index lain
        if (data.words.length > 1 && wordIndex === lastWordIndex) {
            wordIndex = (wordIndex + 1) % data.words.length;
        }
        lastWordIndex = wordIndex;

        const randomWordData = data.words[wordIndex];
        word = randomWordData.word.toUpperCase();
        icon = randomWordData.icon;

        slots = word
            .split("")
            .map((char, i) => ({ char, filled: false, id: i }));
        options = word
            .split("")
            .map((char, i) => ({ char, id: i }))
            .sort(() => Math.random() - 0.5);

        isComplete = false;
        speak(`Ayo susun kata ${word}!`);
    }

    function startDrag(e, item) {
        if (e.cancelable) e.preventDefault();
        draggedItem = item;

        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        dragPos = { x: clientX, y: clientY };
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
        const slotElements = document.querySelectorAll(".slot");

        slotElements.forEach((slotEl) => {
            if (found) return;

            const rect = slotEl.getBoundingClientRect();
            // Gunakan margin 40px seperti di kereta agar lebih responsif
            const margin = 40;
            const isInside =
                dragPos.x > rect.left - margin &&
                dragPos.x < rect.right + margin &&
                dragPos.y > rect.top - margin &&
                dragPos.y < rect.bottom + margin;

            if (isInside) {
                const index = parseInt(slotEl.getAttribute("data-index"));
                const isFilled = slotEl.getAttribute("data-filled") === "true";

                if (!isFilled && slots[index].char === draggedItem.char) {
                    slots[index].filled = true;
                    options = options.filter((o) => o.id !== draggedItem.id);
                    playSfx("ting");
                    found = true;
                    checkComplete();
                }
            }
        });

        if (!found) playSfx("bloop");
        draggedItem = null;
    }

    function checkComplete() {
        if (slots.every((s) => s.filled)) {
            // Tambah koin secara reaktif
            if (appState.child) {
                appState.child.coins += 3;
            }

            speakPraise();

            // Auto-advance setelah 2.5 detik
            if (isLessonMode) {
                setTimeout(() => {
                    isComplete = true; // Tampilkan overlay di Lesson mode
                }, 1500);
                return;
            }

            setTimeout(() => {
                handleNext();
            }, 2500);
        }
    }

    function handleNext() {
        if (isLessonMode) {
            onComplete(3);
            return;
        }
        // Standalone: Lanjut ke kata lain
        initGame();
    }
</script>

<svelte:window
    on:mousemove={handleDrag}
    on:touchmove={handleDrag}
    on:mouseup={handleDrop}
    on:touchend={handleDrop}
/>

<div class="game-container flex-col flex-center">
    <button class="btn btn-secondary exit-btn" onclick={() => push("/gate")}
        >❌ Keluar</button
    >

    <div class="image-card pop-in">
        <span class="icon">{icon}</span>
        <h2 class="word-label">{word}</h2>
    </div>

    <div class="slots-container flex-row">
        {#each slots as slot, i}
            <div
                class="slot flex-center"
                class:filled={slot.filled}
                data-index={i}
                data-filled={slot.filled}
            >
                {slot.filled ? slot.char : ""}
                {#if !slot.filled}
                    <span class="shadow-char">{slot.char}</span>
                {/if}
            </div>
        {/each}
    </div>

    <div class="options-container flex-row flex-center gap-md">
        {#each options as opt}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="drag-item flex-center"
                onmousedown={(e) => startDrag(e, opt)}
                ontouchstart={(e) => startDrag(e, opt)}
            >
                {opt.char}
            </div>
        {/each}
    </div>

    {#if isComplete}
        <div class="overlay-done flex-col flex-center" style="z-index: 10000;">
            <div class="card-done flex-col flex-center slide-down">
                <div style="font-size: 80px; margin-bottom: 10px;">
                    {icon}
                </div>
                <h2
                    style="color: #FBC02D; font-size: 40px; margin-bottom: 20px;"
                >
                    {word}
                </h2>
                <div style="font-size: 50px; margin: 10px 0;">⭐⭐⭐</div>
                <div class="flex-row gap-sm" style="margin-top:30px;">
                    <button
                        class="btn btn-primary"
                        onclick={handleNext}
                        style="font-size: 24px; padding: 15px 40px;"
                        >Lanjut 👉</button
                    >
                </div>
            </div>
        </div>
    {/if}

    {#if draggedItem}
        <div
            class="floating-item flex-center"
            style="left: {dragPos.x}px; top: {dragPos.y}px;"
        >
            {draggedItem.char}
        </div>
    {/if}

    {#if isComplete}
        <div class="overlay-done flex-col flex-center pop-in">
            <div class="card-done flex-col flex-center">
                <div style="font-size: 100px; margin-bottom: 20px;">{icon}</div>
                <h2>Hebat! Kata {word} Selesai! ✨</h2>
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
        background: linear-gradient(135deg, #fff9c4, #fff176);
        padding: 20px;
        user-select: none;
        -webkit-user-select: none;
        position: relative;
    }

    .exit-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 100;
    }

    .image-card {
        background: white;
        padding: 20px 40px;
        border-radius: 30px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        text-align: center;
        margin-bottom: 40px;
    }

    .icon {
        font-size: 100px;
        display: block;
    }
    .word-label {
        margin-top: 10px;
        color: #fbc02d;
        font-size: 32px;
        letter-spacing: 5px;
    }

    .slots-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-bottom: 40px;
        width: 100%;
        max-width: 600px;
    }

    .slot {
        width: 60px;
        height: 70px;
        background: #f5f5f5;
        border: 3px dashed #bdbdbd;
        border-radius: 12px;
        font-size: 32px;
        font-weight: bold;
        color: #4caf50;
        position: relative;
    }

    @media (max-width: 480px) {
        .slot {
            width: 45px;
            height: 55px;
            font-size: 24px;
            border-width: 2px;
        }
    }

    .slot.filled {
        background: white;
        border: 4px solid #4caf50;
        border-style: solid;
        box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
    }

    .shadow-char {
        opacity: 0.15;
        position: absolute;
    }

    .options-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        min-height: 80px;
        width: 100%;
        max-width: 600px;
    }

    .drag-item {
        width: 60px;
        height: 60px;
        background: white;
        border: 3px solid #fbc02d;
        border-radius: 12px;
        font-size: 32px;
        font-weight: bold;
        color: #fbc02d;
        cursor: grab;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 480px) {
        .drag-item {
            width: 45px;
            height: 45px;
            font-size: 24px;
            border-width: 2px;
        }
    }

    .floating-item {
        position: fixed;
        width: 80px;
        height: 80px;
        background: white;
        border: 4px solid #fbc02d;
        border-radius: 15px;
        font-size: 40px;
        font-weight: bold;
        color: #fbc02d;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    }

    .overlay-done {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(251, 192, 45, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 11000;
    }

    .card-done {
        background: white;
        padding: 50px;
        border-radius: 30px;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
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
        background: #fbc02d;
        color: white;
    }
    .btn-secondary {
        background: #fff9c4;
        color: #fbc02d;
    }

    .pop-in {
        animation: pop 0.5s ease-out;
    }
    @keyframes pop {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
</style>
