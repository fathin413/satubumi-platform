const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  id: () => import('./dictionaries/id.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  // Jika locale bukan 'en' atau 'id', paksa gunakan 'en'
  if (locale !== 'en' && locale !== 'id') {
    return dictionaries['en']();
  }
  
  return dictionaries[locale as keyof typeof dictionaries]();
};