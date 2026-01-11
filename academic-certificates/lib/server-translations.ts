// Helper function to get translations in server components
export async function getServerTranslations(locale: string = 'es') {
  try {
    const translations = locale === 'es'
      ? await import('./../locales/es.json')
      : await import('./../locales/en.json');

    return translations.default;
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fallback to Spanish
    const fallback = await import('./../locales/es.json');
    return fallback.default;
  }
}