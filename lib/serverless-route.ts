/**
 * Limite d’exécution des route handlers sur Vercel (secondes).
 * Plan Hobby : jusqu’à 60 s — nécessaire pour le SSE et les transactions lourdes.
 * @see https://vercel.com/docs/functions/configuring-functions/duration
 */
export const maxDuration = 60;
