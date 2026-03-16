import { push } from 'svelte-spa-router';
import db, { seedInitialData } from './db.js';

// Menggunakan pattern store manual untuk kompatibilitas PWA & SPA sederhana
// Svelte 5 `$state` rune di .svelte.js optimal untuk reactivity global
export const appState = $state({
    isLoaded: false,
    child: null, // { name: 'Adik', petName: 'Milo', coins: 0, currentWorld: 'rimba-bunyi' }
});

export const initApp = async () => {
    await seedInitialData();

    try {
        const defaultChild = await db.collection('children').doc('profile_1').get();
        if (defaultChild) {
            // Pastikan assignment memicu reactivity Svelte 5 jika diperlukan
            appState.child = $state.snapshot(defaultChild);
        }
    } catch (error) {
        console.error("Gagal memuat profil:", error);
    }

    appState.isLoaded = true;
};
