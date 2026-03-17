<script>
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";
  import { routes } from "./lib/routes.js";
  import { initTTS, unlockTTS } from "./lib/tts.js";

  onMount(() => {
    initTTS();

    const unlock = () => {
      unlockTTS();
      window.removeEventListener("mousedown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("mousedown", unlock);
    window.addEventListener("touchstart", unlock);
  });
</script>

<main class="app-container">
  <Router {routes} />
</main>
