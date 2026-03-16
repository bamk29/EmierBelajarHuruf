<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { letters } from "../data/letters.js";
    import { speak, speakPraise, speakEncourage, initTTS } from "../lib/tts.js";
    import { playSfx } from "../lib/audio.js";
    import { appState } from "../lib/state.svelte.js";

    import TapBubble from "../games/TapBubble.svelte";
    import VisualMatch from "../games/VisualMatch.svelte";
    import MatchCase from "../games/MatchCase.svelte";
    import Tracing from "../games/Tracing.svelte";
    import CatchDrop from "../games/CatchDrop.svelte";
    import WordBuilder from "../games/WordBuilder.svelte";

    import db from "../lib/db.js";

    let { params } = $props(); // from router eg. param.id == 'a'

    // Gunakan derived untuk mengambil data up-to-date kalau params berubah
    let letterData = $derived(letters.find((l) => l.id === params.id));

    // State CPA Flow: 'concrete' -> 'pictorial' -> 'game1' -> 'game2' -> 'game3' -> 'game4' -> 'game5' -> 'finish'
    let stage = $state("concrete");
    let subStageDelay = $state(false);
    let nextLetterId = $state(null);
    let totalStars = $state(0);

    onMount(() => {
        initTTS();
    });

    // Helpers untuk handle struktur data baru (array words) vs lama (properti publik)
    const currentWord = $derived(
        letterData?.words ? letterData.words[0].word : letterData?.word,
    );
    const currentIcon = $derived(
        letterData?.words ? letterData.words[0].icon : letterData?.icon,
    );

    // Watcher: Saat rute (params.id) berubah tapi halaman belum unmout, reset game.
    $effect(() => {
        if (params.id && letterData) {
            startConcrete();
        }
    });

    function startConcrete() {
        totalStars = 0;
        stage = "concrete";
        speak(
            `Ini ${currentWord}. ${letterData.phonetic}. Coba ketuk gambarnya!`,
        );
    }

    function handleConcreteTap() {
        playSfx("ting");
        subStageDelay = true;
        speak(
            `Lihat! ${currentWord} nya berubah jadi huruf ${letterData.letter.toUpperCase()}!`,
        );

        // Transisi ke pictorial
        setTimeout(() => {
            stage = "pictorial";
            subStageDelay = false;
        }, 1000); // Tunggu pujian selesai (kasar)
    }

    function handlePictorialTap() {
        playSfx("ting");
        speak(
            `Hebat! Sekarang ayo tangkap balon huruf ${letterData.letter.toUpperCase()}!`,
        );
        setTimeout(() => {
            stage = "game1";
        }, 1500);
    }

    // Sequence handlers
    function onGame1Complete(stars) {
        totalStars += stars;
        stage = "game2";
    }
    function onGame2Complete(stars) {
        totalStars += stars;
        stage = "game3";
    }
    function onGame3Complete(stars) {
        totalStars += stars;
        stage = "game4";
    }
    function onGame4Complete(stars) {
        totalStars += stars;
        stage = "game5";
    }

    function onGame5Complete(stars) {
        totalStars += stars;
        stage = "game6";
    }

    function onGame6Complete(stars) {
        totalStars += stars;
        stage = "finish";
        playSfx("coin");
        speakPraise();

        // Tambah reward koin
        // Tambah reward koin secara reaktif dan simpan permanen
        if (appState.child) {
            appState.child.coins += 3;
            db.collection("children")
                .doc("profile_1")
                .set(appState.child)
                .catch(console.error);
        }

        // Simpan history progress
        const today = new Date().toISOString().split("T")[0];
        db.collection("progress").add({
            letterId: params.id,
            stars: stars,
            date: today,
        });

        // Cek Huruf Selanjutnya
        const currentIndex = letters.findIndex((l) => l.id === params.id);
        if (currentIndex < letters.length - 1) {
            nextLetterId = letters[currentIndex + 1].id;
        } else {
            nextLetterId = null;
        }
    }

    function nextLesson() {
        if (nextLetterId) {
            stage = "concrete";
            push("/lesson/" + nextLetterId); // Navigasi ke ID berikutnya
        }
    }
</script>

<div class="page-container flex-col flex-center">
    <button class="back-btn btn btn-secondary" onclick={() => push("/map")}
        >❌ Keluar</button
    >

    {#if !letterData}
        <p>Memuat...</p>
    {:else if stage === "concrete"}
        <div
            class="cpa-container flex-col flex-center"
            class:fade-out={subStageDelay}
        >
            <h1 class="bounce">{currentWord}</h1>
            <!-- Nanti ganti dengan gambar SVG bola/apel yang sesungguhnya -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="interactive-image jiggle"
                role="button"
                tabindex="0"
                onclick={handleConcreteTap}
                onkeypress={(e) => e.key === "Enter" && handleConcreteTap()}
            >
                {currentIcon}
            </div>
            <p class="hint">Ketuk gambarnya ya!</p>
        </div>
    {:else if stage === "pictorial"}
        <div class="cpa-container flex-col flex-center slide-up">
            <div class="flex-row items-baseline gap-sm">
                <h1 class="morph-text">{letterData.letter.toUpperCase()}</h1>
                <h1 class="morph-text-small">
                    {letterData.letter.toLowerCase()}
                </h1>
            </div>
            <p class="hint">Bentuknya seperti {currentWord} ya!</p>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="interactive-image-large pulse"
                role="button"
                tabindex="0"
                onclick={handlePictorialTap}
                onkeypress={(e) => e.key === "Enter" && handlePictorialTap()}
            >
                <span class="big-letter">{letterData.letter.toUpperCase()}</span
                >
                <span class="small-letter"
                    >{letterData.letter.toLowerCase()}</span
                >
            </div>
            <button
                class="btn btn-primary"
                style="margin-top:20px"
                onclick={handlePictorialTap}>Lanjut 👉</button
            >
        </div>
    {:else if stage === "game1"}
        <TapBubble
            targetLetter={letterData.letter}
            onComplete={onGame1Complete}
        />
    {:else if stage === "game2"}
        <VisualMatch
            targetLetter={letterData.letter}
            targetWord={currentWord}
            targetIcon={currentIcon}
            onComplete={onGame2Complete}
        />
    {:else if stage === "game3"}
        <MatchCase
            targetLetter={letterData.letter}
            onComplete={onGame3Complete}
        />
    {:else if stage === "game4"}
        <Tracing
            targetLetter={letterData.letter}
            onComplete={onGame4Complete}
        />
    {:else if stage === "game5"}
        <CatchDrop
            targetLetter={letterData.letter}
            onComplete={onGame5Complete}
        />
    {:else if stage === "game6"}
        <WordBuilder
            targetLetter={letterData.letter}
            onComplete={onGame6Complete}
        />
    {:else if stage === "finish"}
        <div class="cpa-container flex-col flex-center bounce-in">
            <h1 style="font-size: 80px;">⭐⭐⭐</h1>
            <h2>Luar Biasa! (Skor: {totalStars})</h2>
            <p style="margin-bottom: 20px;">
                Kamu dapat +3 Ikan Emas untuk kucingmu!
            </p>

            <div
                class="flex-col gap-sm"
                style="width: 100%; max-width: 400px; margin-top: 30px; z-index: 1001;"
            >
                {#if nextLetterId}
                    <button
                        class="btn btn-primary"
                        style="font-size: 28px; padding: 20px 40px; box-shadow: 0 15px 30px rgba(0,0,0,0.3); border-radius: 20px;"
                        onclick={nextLesson}>Belajar Huruf Berikutnya 👉</button
                    >
                {/if}
                <button
                    class="btn btn-secondary"
                    style="font-size: 20px; padding: 15px; margin-top: 10px;"
                    onclick={() => push("/map")}>Kembali ke Peta 🗺️</button
                >
            </div>
        </div>
    {/if}
</div>

<style>
    .page-container {
        height: 100vh;
        background-color: #e3f2fd; /* Biru langit cerah */
        position: relative;
        overflow: hidden;
    }

    .back-btn {
        position: absolute;
        top: var(--space-md);
        left: var(--space-md);
        z-index: 100;
    }

    .cpa-container {
        width: 100%;
        height: 100%;
        text-align: center;
    }

    .interactive-image {
        font-size: 150px;
        margin: var(--space-xl) 0;
        cursor: pointer;
        touch-action: manipulation;
    }

    .hint {
        font-size: var(--text-xl);
        color: var(--color-primary-dark);
        margin-top: -20px;
        margin-bottom: 20px;
    }

    .morph-text {
        font-size: 120px;
        color: var(--color-primary);
        line-height: 1;
    }

    .morph-text-small {
        font-size: 80px;
        color: var(--color-primary-dark);
        opacity: 0.8;
    }

    .interactive-image-large {
        font-size: 150px;
        margin: var(--space-lg) 0;
        cursor: pointer;
        display: flex;
        align-items: baseline;
        gap: 10px;
    }

    .big-letter {
        font-size: 160px;
        font-weight: bold;
        color: var(--color-primary);
    }
    .small-letter {
        font-size: 100px;
        font-weight: bold;
        color: var(--color-primary-dark);
    }

    /* Animasi Sederhana */
    .fade-out {
        opacity: 0;
        transition: opacity 1s;
    }
    .pulse {
        animation: pulse 2s infinite;
    }
    .bounce {
        animation: bounce 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-15px);
        }
    }

    .jiggle {
        animation: jiggle 3s infinite;
    }
    @keyframes jiggle {
        0% {
            transform: rotate(0deg);
        }
        5% {
            transform: rotate(10deg);
        }
        10% {
            transform: rotate(-10deg);
        }
        15% {
            transform: rotate(10deg);
        }
        20% {
            transform: rotate(-10deg);
        }
        25% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(0deg);
        }
    }

    .slide-up {
        animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
