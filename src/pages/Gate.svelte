<script>
    import { push } from "svelte-spa-router";
    import { appState } from "../lib/state.svelte.js";
</script>

<div class="page-container flex-col flex-center">
    <header
        class="header flex-row space-between"
        style="width:100%; padding: 10px 20px;"
    >
        <div
            class="coin-display"
            style="background: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: #f57f17; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"
        >
            🐟 {appState.child?.coins || 0}
        </div>
    </header>

    <div class="mascot-container">
        <!-- Nanti pakai gambar SVG kucing senyum -->
        <div class="mascot">🐱</div>
    </div>

    <h1 class="welcome-text">Halo, {appState.child?.name || "Teman"}!</h1>
    <p class="subtitle">Pilih tempat bermainmu hari ini!</p>

    <div class="menu-grid">
        <button
            class="menu-card"
            style="background-color: #81D4FA"
            onclick={() => push("/map")}
        >
            <span class="icon">🗺️</span>
            <span class="label">Peta Alfabet</span>
        </button>

        <button
            class="menu-card"
            style="background-color: #A5D6A7"
            onclick={() => push("/letter-train")}
        >
            <span class="icon">🚂</span>
            <span class="label">Gerobak Kereta</span>
        </button>

        <button
            class="menu-card"
            style="background-color: #CE93D8"
            onclick={() => push("/word-builder")}
        >
            <span class="icon">🍎</span>
            <span class="label">Susun Huruf</span>
        </button>

        <button
            class="menu-card"
            style="background-color: #81C784"
            onclick={() => push("/reading-game")}
        >
            <span class="icon">📚</span>
            <span class="label">Mulai Membaca</span>
        </button>

        <button
            class="menu-card"
            style="background-color: #FFCC80"
            onclick={() => push("/pet")}
        >
            <span class="icon">🏠</span>
            <span class="label">Rumah Kucing</span>
        </button>
    </div>

    <button
        class="btn btn-secondary"
        style="margin-top: 20px; width: 100%; max-width: 400px;"
        onclick={() => push("/parent")}
    >
        👨‍👩‍👧 Area Ayah Bunda
    </button>
</div>

<style>
    .page-container {
        height: 100vh;
        padding: var(--space-xl);
        text-align: center;
        background: linear-gradient(180deg, #f3e5f5, #e1f5fe);
    }

    .mascot-container {
        font-size: 80px;
        margin-bottom: var(--space-sm);
        animation: gentle-bounce 2s infinite ease-in-out;
    }

    .welcome-text {
        font-size: var(--text-2xl);
        color: var(--color-primary-dark);
        margin-bottom: var(--space-xs);
    }

    .subtitle {
        font-size: var(--text-md);
        color: var(--color-text-muted);
        margin-bottom: var(--space-xl);
    }

    .menu-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md);
        width: 100%;
        max-width: 400px;
    }

    .menu-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        border: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .menu-card:active {
        transform: scale(0.95);
    }

    .icon {
        font-size: 40px;
        margin-bottom: var(--space-sm);
    }

    .label {
        font-family: var(--font-family-heading);
        font-size: var(--text-md);
        font-weight: bold;
        color: #333;
    }

    @keyframes gentle-bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }
</style>
