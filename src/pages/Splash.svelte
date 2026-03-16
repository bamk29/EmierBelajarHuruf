<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { initApp, appState } from "../lib/state.svelte.js";
    import { initTTS } from "../lib/tts.js";

    let loadingProgress = $state(0);

    onMount(async () => {
        // Simulasi loading aset & inisialisasi TTS/DB
        const interval = setInterval(() => {
            loadingProgress += 15;
            if (loadingProgress >= 100) clearInterval(interval);
        }, 200);

        await initApp();
        initTTS();

        // Tunggu sedikit agar animasi terlihat
        setTimeout(() => {
            if (appState.child) {
                push("/gate");
            } else {
                push("/register");
            }
        }, 2000);
    });
</script>

<div class="splash-container flex-col flex-center">
    <div class="mascot-container">
        <!-- Placeholder Kucing Tidur (Nanti diganti SVG animasi nyata) -->
        <div class="sleeping-cat">💤 🐱</div>
    </div>
    <h1 class="bounce-in">Langkah Kecil</h1>
    <p class="subtitle fade-in">Petualangan Huruf</p>

    <div class="progress-bar">
        <div class="progress-fill" style="width: {loadingProgress}%"></div>
    </div>
</div>

<style>
    .splash-container {
        height: 100vh;
        background: linear-gradient(
            135deg,
            var(--color-primary-light),
            var(--color-primary)
        );
        color: white;
    }

    .mascot-container {
        font-size: 80px;
        margin-bottom: var(--space-lg);
        animation: float 3s ease-in-out infinite;
    }

    h1 {
        color: white;
        font-size: var(--text-4xl);
        text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        margin-bottom: var(--space-xs);
    }

    .subtitle {
        font-size: var(--text-xl);
        font-weight: 600;
        opacity: 0.9;
        margin-bottom: var(--space-2xl);
    }

    .progress-bar {
        width: 60%;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: var(--radius-pill);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--color-accent);
        transition: width 0.3s ease;
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes bounceIn {
        0% {
            transform: scale(0.8);
            opacity: 0;
        }
        60% {
            transform: scale(1.1);
            opacity: 1;
        }
        100% {
            transform: scale(1);
        }
    }

    .bounce-in {
        animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
    }
    .fade-in {
        animation: fadeIn 1s ease forwards;
        opacity: 0;
        animation-delay: 0.3s;
    }
    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }
</style>
