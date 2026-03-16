<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { appState } from "../lib/state.svelte.js";
    import db from "../lib/db.js";
    import { playSfx } from "../lib/audio.js";
    import { speak } from "../lib/tts.js";

    let child = appState.child;
    let isEating = $state(false);

    // Jika tidak ada data child, kembalikan ke home
    if (!child) push("/");

    async function feedPet() {
        if (child.coins < 3) {
            playSfx("bloop");
            speak(
                "Wah ikan emasnya kurang! Ayo belajar lagi untuk dapat ikan emas.",
            );
            return;
        }

        // Potong 3 koin untuk 1x makan
        // Potong 3 koin untuk 1x makan secara reaktif
        appState.child.coins -= 3;
        isEating = true;
        playSfx("coin");

        speak(
            `Nyam nyam nyam! ${appState.child.petName} kenyang sekali! Terima kasih Emir!`,
        );

        try {
            await db
                .collection("children")
                .doc("profile_1")
                .set(appState.child);
            console.log("Coins persistent saved");
        } catch (err) {
            console.error("Gagal update koin", err);
        }

        setTimeout(() => {
            isEating = false;
        }, 3000);
    }
</script>

<div class="page-container page-bg">
    <header class="header flex-row space-between">
        <button class="btn btn-secondary back-btn" onclick={() => push("/map")}
            >⬅️ Peta</button
        >
        <div class="coin-display">
            <span>🪙 {child?.coins || 0}</span>
        </div>
    </header>

    <h1 class="title text-center">Rumah {child?.petName || "Kucing"}</h1>

    <div class="room-container flex-col flex-center">
        <!-- Nanti ganti dengan gambar SVG asli -->
        <div class="pet-container" class:eating={isEating}>
            <div class="pet">{isEating ? "😻" : "🐱"}</div>
        </div>

        {#if isEating}
            <div class="hearts-container">
                <span class="heart h1">💖</span>
                <span class="heart h2">💖</span>
                <span class="heart h3">💖</span>
            </div>
        {/if}

        <div class="action-card card">
            <h3 style="margin-bottom:10px;">Beri Makan</h3>
            <p style="margin-bottom:20px; color:var(--color-text-muted);">
                Butuh 3 🪙 Ikan Emas
            </p>
            <button
                class="btn btn-primary"
                style="width:100%;"
                onclick={feedPet}
                disabled={isEating}
            >
                🐟 Kasih Ikan
            </button>
        </div>
    </div>
</div>

<style>
    .page-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .page-bg {
        background: linear-gradient(
            180deg,
            #fff3e0,
            #ffe0b2
        ); /* Warna hangat krem/oranye lembut */
    }

    .header {
        padding: var(--space-md);
    }

    .coin-display {
        background-color: white;
        padding: var(--space-xs) var(--space-md);
        border-radius: var(--radius-pill);
        font-weight: bold;
        font-size: var(--text-lg);
        box-shadow: var(--shadow-sm);
        color: #f57f17;
    }

    .title {
        color: var(--color-primary-dark);
        margin-bottom: var(--space-lg);
    }

    .room-container {
        flex: 1;
        position: relative;
    }

    .pet-container {
        font-size: 150px;
        margin-bottom: var(--space-2xl);
        position: relative;
        transition: transform 0.3s;
    }

    .eating {
        animation: happyBounce 0.5s infinite alternate;
    }

    @keyframes happyBounce {
        0% {
            transform: translateY(0) scale(1);
        }
        100% {
            transform: translateY(-20px) scale(1.05);
        }
    }

    .action-card {
        text-align: center;
        width: 250px;
    }

    .hearts-container {
        position: absolute;
        top: 50px;
    }

    .heart {
        position: absolute;
        font-size: 30px;
        animation: floatHeart 1.5s ease-out forwards;
        opacity: 0;
    }

    .h1 {
        left: -60px;
        top: 0;
        animation-delay: 0s;
    }
    .h2 {
        left: 0px;
        top: -50px;
        animation-delay: 0.2s;
    }
    .h3 {
        left: 60px;
        top: 0;
        animation-delay: 0.4s;
    }

    @keyframes floatHeart {
        0% {
            transform: translateY(0) scale(0.5);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
        }
    }
</style>
