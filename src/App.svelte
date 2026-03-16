<script>
  import Router from 'svelte-spa-router';
  import { routes } from './lib/routes.js';
</script>

<main class="app-container">
  <Router {routes} />
</main>
