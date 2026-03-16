import Localbase from 'localbase';

// Inisialisasi database
const db = new Localbase('langkah-kecil-db');

// Nonaktifkan log console bawaan Localbase agar terminal rapi
db.config.debug = false;

/**
 * Fungsi pembantu untuk memastikan pengaturan awal aplikasi tersedia
 */
export const seedInitialData = async () => {
    try {
        const settings = await db.collection('settings').doc('app_settings').get();
        if (!settings) {
            await db.collection('settings').add({
                id: 'app_settings',
                parentPin: '1234', // Default PIN orang tua
                bgmEnabled: true,
                sfxEnabled: true,
                dailyTargetMins: 15
            }, 'app_settings'); // Gunakan key eksplisit
        }
    } catch (err) {
        console.error("Gagal seed initial data:", err);
    }
};

export default db;
