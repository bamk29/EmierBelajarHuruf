<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { appState } from "../lib/state.svelte.js";
    import { initTTS, speak } from "../lib/tts.js";
    import { playSfx } from "../lib/audio.js";
    import { letters } from "../data/letters.js";

    let child = appState.child;

    let mapNodes = $derived(
        [...letters]
            .sort((a, b) => a.letter.localeCompare(b.letter))
            .map((l, index) => {
                return {
                    id: l.id,
                    label: `Huruf ${l.letter.toUpperCase()}`,
                    status: "unlocked",
                };
            }),
    );

    onMount(() => {
        initTTS();
        if (!child) push("/");
    });

    const handleNodeClick = (node) => {
        if (node.status === "locked") {
            playSfx("bloop");
            speak("Selesaikan yang sebelumnya dulu ya!");
            return;
        }
        playSfx("ting");
        speak(`Ayo kita belajar ${node.label}!`);
        setTimeout(() => {
            push(`/lesson/${node.id}`);
        }, 1500);
    };
</script>

<div class="page-container map-bg">
    <header class="map-header space-between flex-row">
        <button class="btn btn-secondary back-btn" onclick={() => push("/gate")}
            >⬅️ Ke Menu Utama</button
        >
        <div class="coin-display">
            <span>🪙 {child?.coins || 0}</span>
        </div>
    </header>

    <h1 class="map-title text-center">🌳 Peta Alfabet</h1>

    <div class="map-area">
        <div class="nodes-grid">
            {#each mapNodes as node}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="map-node node-{node.status}"
                    onclick={() => handleNodeClick(node)}
                >
                    <div class="node-icon">
                        {#if node.status === "unlocked"}
                            {node.label.replace("Huruf ", "")}
                        {:else if node.status === "locked"}
                            🔒
                        {:else}
                            ✅
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .page-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, #e8f5e9, #81c784);
        position: relative;
        overflow: hidden;
    }

    .map-header {
        padding: var(--space-md);
        z-index: 10;
        background: rgba(255, 255, 255, 0.4);
    }

    .back-btn {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--text-base);
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

    .map-title {
        color: #1b5e20;
        margin-bottom: var(--space-xs);
        text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
    }

    .map-area {
        flex: 1;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
    }

    .nodes-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding: 30px;
    }

    .map-node {
        background: white;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px 10px;
        cursor: pointer;
        box-shadow:
            0 6px 0 #a5d6a7,
            0 8px 10px rgba(0, 0, 0, 0.1);
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }

    .map-node:active {
        transform: translateY(6px);
        box-shadow:
            0 0px 0 #a5d6a7,
            0 2px 2px rgba(0, 0, 0, 0.1);
    }

    .node-locked {
        background: #e0e0e0;
        box-shadow: 0 6px 0 #9e9e9e;
        color: #9e9e9e;
    }

    .node-icon {
        font-size: 36px;
        font-family: var(--font-family-heading);
        font-weight: bold;
        color: var(--color-primary-dark);
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
    .pulse {
        animation: pulse 2s infinite;
    }
</style>
