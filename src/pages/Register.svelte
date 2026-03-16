<script>
    import { push } from "svelte-spa-router";
    import db from "../lib/db.js";
    import { appState } from "../lib/state.svelte.js";

    let childName = $state("");
    let petName = $state("");
    let errorMsg = $state("");

    async function handleRegister(e) {
        e.preventDefault();

        if (childName.trim().length < 2) {
            errorMsg = "Nama anak minimal 2 huruf ya!";
            return;
        }

        if (petName.trim().length < 2) {
            errorMsg = "Nama kucingnya kurang seru, tambahin lagi yuk!";
            return;
        }

        const newChild = {
            id: "profile_1", // Saat ini single profile dulu untuk MVP
            name: childName.trim(),
            petName: petName.trim(),
            coins: 0,
            currentWorld: "rimba-bunyi",
            createdAt: new Date().toISOString(),
        };

        try {
            await db.collection("children").doc("profile_1").set(newChild);
            appState.child = newChild;
            push("/gate");
        } catch (err) {
            errorMsg = "Waduh, gagal menyimpan data. Coba lagi ya!";
            console.error(err);
        }
    }
</script>

<div class="page-container flex-col flex-center">
    <h1>Kenalan Yuk!</h1>
    <p class="subtitle">Biar kita bisa main sama-sama</p>

    <form class="register-form card flex-col gap-md" onsubmit={handleRegister}>
        <div class="input-group flex-col gap-sm">
            <label for="childName">Nama Panggilanmu:</label>
            <input
                id="childName"
                type="text"
                bind:value={childName}
                placeholder="Contoh: Budi"
                autocomplete="off"
            />
        </div>

        <div class="input-group flex-col gap-sm">
            <label for="petName">Nama Kucing Peliharaanmu:</label>
            <input
                id="petName"
                type="text"
                bind:value={petName}
                placeholder="Contoh: Milo"
                autocomplete="off"
            />
        </div>

        {#if errorMsg}
            <p class="error-text">{errorMsg}</p>
        {/if}

        <button
            type="submit"
            class="btn btn-primary"
            style="margin-top: var(--space-sm);"
        >
            Mulai Petualangan! 🚀
        </button>
    </form>
</div>

<style>
    .page-container {
        height: 100vh;
        padding: var(--space-lg);
        background-color: var(--color-bg);
    }

    h1 {
        font-size: var(--text-3xl);
        text-align: center;
    }

    .subtitle {
        text-align: center;
        color: var(--color-text-muted);
        margin-bottom: var(--space-2xl);
        font-size: var(--text-lg);
    }

    .register-form {
        width: 100%;
        max-width: 320px;
    }

    .input-group label {
        font-family: var(--font-family-heading);
        color: var(--color-primary-dark);
        font-size: var(--text-md);
    }

    input {
        width: 100%;
        padding: var(--space-md);
        border: 2px solid #ffe0b2;
        border-radius: var(--radius-md);
        font-family: var(--font-family-main);
        font-size: var(--text-lg);
        background-color: #fff9c4;
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: var(--color-primary);
    }

    .error-text {
        color: var(--color-error);
        font-weight: bold;
        text-align: center;
        font-size: var(--text-sm);
    }
</style>
