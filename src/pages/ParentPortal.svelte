<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import db from "../lib/db.js";
    import { letters } from "../data/letters.js";

    let isAuthenticated = $state(false);
    let pinInput = $state("");
    let correctPin = "1234"; // Default PIN
    let pinError = $state(false);

    // Laporan statis map logic
    let progressData = $state([]);
    let heatmap = $state({});

    onMount(async () => {
        try {
            const settings = await db
                .collection("settings")
                .doc("app_settings")
                .get();
            if (settings?.parentPin) correctPin = settings.parentPin;
        } catch (e) {
            console.warn("Gagal load setting", e);
        }
    });

    const checkPin = () => {
        if (pinInput === correctPin) {
            isAuthenticated = true;
            pinError = false;
            loadProgress();
        } else {
            pinError = true;
            pinInput = "";
        }
    };

    const loadProgress = async () => {
        try {
            // Ambil seluruh progress
            const data = await db.collection("progress").get();
            progressData = data || [];

            // Hitung skor terbaik per huruf
            let map = {};
            letters.forEach((l) => {
                map[l.id] = { mastered: false, attempts: 0, bestStars: 0 };
            });

            progressData.forEach((entry) => {
                if (!map[entry.letterId]) return;
                map[entry.letterId].attempts += 1;
                if (entry.stars > map[entry.letterId].bestStars) {
                    map[entry.letterId].bestStars = entry.stars;
                }
                if (entry.stars === 3) {
                    map[entry.letterId].mastered = true;
                }
            });

            heatmap = map;
        } catch (err) {
            console.error(err);
        }
    };
</script>

<div class="page-container flex-col">
    <header class="header flex-row space-between">
        <button class="btn btn-secondary back-btn" onclick={() => push("/gate")}
            >⬅️ Tutup</button
        >
        <h2>Area Ayah Bunda</h2>
    </header>

    <div class="content flex-col flex-center">
        {#if !isAuthenticated}
            <div class="card pin-card flex-col flex-center gap-md">
                <h3>Masukkan PIN</h3>
                <p class="text-muted">
                    Mencegah anak masuk tanpa sengaja. (Default: 1234)
                </p>

                <input
                    type="password"
                    maxlength="4"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    bind:value={pinInput}
                    class="pin-input text-center"
                    placeholder="****"
                />

                {#if pinError}
                    <p class="error">PIN Salah. Coba lagi!</p>
                {/if}

                <button
                    class="btn btn-primary"
                    style="width:100%"
                    onclick={checkPin}>Masuk</button
                >
            </div>
        {:else}
            <div class="dashboard flex-col gap-lg">
                <div class="card stat-card">
                    <h3>📊 Heatmap Pemahaman Huruf</h3>
                    <p class="text-muted">
                        Hijau = Dikuasai (Bintang 3). Kuning = Perlu Diulang.
                    </p>

                    <div class="heatmap-grid flex-row">
                        {#each letters as l}
                            {@const stat = heatmap[l.id]}
                            <div
                                class="heatmap-item flex-col flex-center"
                                class:mastered={stat?.mastered}
                                class:learning={stat?.attempts > 0 &&
                                    !stat?.mastered}
                            >
                                <span class="letter-text"
                                    >{l.letter.toUpperCase()}</span
                                >
                                <span class="stars-text"
                                    >{"★".repeat(stat?.bestStars || 0)}</span
                                >
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="card setting-card">
                    <h3>⚙️ Pengaturan Dasar</h3>
                    <div class="flex-row space-between">
                        <span>Ubah PIN (Akan datang)</span>
                        <button class="btn btn-secondary" disabled>Edit</button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .page-container {
        height: 100vh;
        background-color: #f3e5f5; /* Ungu super muda */
    }

    .header {
        padding: var(--space-md);
        background-color: white;
        box-shadow: var(--shadow-sm);
    }

    .content {
        flex: 1;
        padding: var(--space-lg);
        overflow-y: auto;
    }

    h2 {
        color: #4a148c; /* Ungu gelap elegan */
    }

    .pin-card {
        width: 100%;
        max-width: 300px;
        padding: var(--space-xl);
    }

    .pin-input {
        width: 100%;
        padding: var(--space-md);
        font-size: var(--text-3xl);
        letter-spacing: 15px;
        border: 2px solid #ce93d8;
        border-radius: var(--radius-md);
        outline: none;
    }

    .pin-input:focus {
        border-color: #8e24aa;
    }

    .error {
        color: var(--color-error);
        font-weight: bold;
    }

    .dashboard {
        width: 100%;
        max-width: 500px;
    }

    .heatmap-grid {
        margin-top: var(--space-md);
        flex-wrap: wrap;
        gap: var(--space-sm);
    }

    .heatmap-item {
        width: 60px;
        height: 60px;
        background-color: #e0e0e0;
        border-radius: var(--radius-sm);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .heatmap-item.mastered {
        background-color: #81c784; /* Hijau */
        color: white;
    }

    .heatmap-item.learning {
        background-color: #fff176; /* Kuning */
        color: #f57f17;
    }

    .letter-text {
        font-size: var(--text-2xl);
        font-family: var(--font-family-heading);
        font-weight: bold;
        line-height: 1;
    }

    .stars-text {
        font-size: var(--text-xs);
        letter-spacing: 1px;
        color: inherit;
        opacity: 0.8;
    }
</style>
