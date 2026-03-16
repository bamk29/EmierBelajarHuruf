import Splash from '../pages/Splash.svelte';
import Gate from '../pages/Gate.svelte';
import Register from '../pages/Register.svelte';
import MapView from '../pages/Map.svelte';
import Lesson from '../pages/Lesson.svelte';
import Treehouse from '../pages/Treehouse.svelte';
import ParentPortal from '../pages/ParentPortal.svelte';
import ShadowMatch from '../games/ShadowMatch.svelte';
import LetterTrain from '../games/LetterTrain.svelte';

import WordBuilder from '../games/WordBuilder.svelte';
import ReadingGame from '../games/ReadingGame.svelte';

export const routes = {
    '/': Splash,
    '/gate': Gate,
    '/register': Register,
    '/map': MapView,
    '/lesson/:id': Lesson,
    '/pet': Treehouse,
    '/parent': ParentPortal,
    '/shadow-match': ShadowMatch,
    '/letter-train': LetterTrain,
    '/word-builder': WordBuilder,
    '/reading-game': ReadingGame
};
