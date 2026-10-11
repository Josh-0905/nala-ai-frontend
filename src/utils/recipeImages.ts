/**
 * Smart culinary photography curation:
 * Ensures every recipe card and recipe detail view displays authentic, mouthwatering
 * food photography that precisely matches the dish name (e.g., Chicken Curry shows authentic Chicken Curry,
 * never Idlis or unrelated produce).
 */
export function getCuratedDishImage(recipeName: string, currentImageUrl?: string): string {
  const name = (recipeName || '').toLowerCase().trim();

  // If already a valid specific photo and not the known idli/books placeholder
  const isGenericOrIdli = !currentImageUrl ||
    currentImageUrl.includes('1589301760014-d929f3979dbc') ||
    currentImageUrl.includes('1594282486552-05b4d80fbb9f') || // books
    currentImageUrl.includes('placeholder');

  // 1. CHICKEN DISHES
  if (name.includes('chicken') || name.includes('kodi') || name.includes('murgh')) {
    if (name.includes('biryani') || name.includes('dum')) {
      return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85'; // Hyderabadi Biryani
    }
    if (name.includes('stir') || name.includes('wok') || name.includes('fajita') || name.includes('teriyaki') || name.includes('manchurian')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85'; // Wok Toss
    }
    if (name.includes('sear') || name.includes('grill') || name.includes('tikka') || name.includes('kebab') || name.includes('roast') || name.includes('vepudu') || name.includes('fry')) {
      return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=85'; // Pan Seared / Roast Chicken
    }
    // Authentic Rich Indian Chicken Curry
    return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=85';
  }

  // 2. MUTTON & MEAT DISHES
  if (name.includes('mutton') || name.includes('lamb') || name.includes('mamsam') || name.includes('meat') || name.includes('beef') || name.includes('pork')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85';
  }

  // 3. FISH & SEAFOOD DISHES
  if (name.includes('fish') || name.includes('chepala') || name.includes('prawn') || name.includes('shrimp') || name.includes('royyala') || name.includes('crab') || name.includes('salmon')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85';
  }

  // 4. EGG DISHES
  if (name.includes('egg') || name.includes('guddu') || name.includes('anda')) {
    if (name.includes('bhurji') || name.includes('scramble')) {
      return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85'; // Egg Bhurji
    }
    if (name.includes('omelette') || name.includes('tamagoyaki')) {
      return 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1000&q=85'; // Omelette
    }
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85';
  }

  // 5. PANEER & TOFU DISHES
  if (name.includes('paneer') || name.includes('tofu')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=85'; // Paneer Butter Masala
  }

  // 6. SAMBAR & RASAM
  if (name.includes('sambar') || name.includes('rasam') || name.includes('pulusu') || name.includes('charu')) {
    return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=85'; // Authentic Sambar
  }

  // 7. CABBAGE DISHES
  if (name.includes('cabbage') || name.includes('patta gobhi') || name.includes('poriyal')) {
    return 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=1000&q=85'; // Cabbage Sabzi
  }

  // 8. POTATO / ALOO DISHES
  if (name.includes('potato') || name.includes('aloo') || name.includes('alugadda') || name.includes('jeera aloo') || name.includes('wedges')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1000&q=85'; // Golden Roasted Potatoes
  }

  // 9. CAULIFLOWER / GOBI
  if (name.includes('cauliflower') || name.includes('gobi')) {
    return 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=1000&q=85';
  }

  // 10. GOURD DISHES (Lauki / Karela / Sorakaya / Turai)
  if (name.includes('bitter gourd') || name.includes('karela') || name.includes('kakarakaya')) {
    return 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=1000&q=85';
  }
  if (name.includes('bottle gourd') || name.includes('sorakaya') || name.includes('lauki') || name.includes('turai') || name.includes('ridge gourd')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85';
  }

  // 11. DAL & LENTILS
  if (name.includes('dal') || name.includes('pappu') || name.includes('lentil') || name.includes('tadka')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85';
  }

  // 12. CHICKPEAS / CHANA / CHOLE
  if (name.includes('chana') || name.includes('chickpea') || name.includes('chole')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85';
  }

  // 13. IDLI (ONLY when name specifically has idli!)
  if (name.includes('idli') || name.includes('idly')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85';
  }

  // 14. DOSA
  if (name.includes('dosa') || name.includes('dosai')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=85';
  }

  // 15. VADA / GARELU
  if (name.includes('vada') || name.includes('garelu')) {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85';
  }

  // 16. POHA
  if (name.includes('poha') || name.includes('aval')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85';
  }

  // 17. PASTA & NOODLES
  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('penne') || name.includes('fettuccine')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=85';
  }
  if (name.includes('noodle') || name.includes('ramen') || name.includes('chow mein') || name.includes('pad thai')) {
    return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1000&q=85';
  }

  // 18. RICE & BIRYANI
  if (name.includes('rice') || name.includes('pulao') || name.includes('biryani') || name.includes('khichdi')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85';
  }

  // 19. OATS & FRUITS
  if (name.includes('oat') || name.includes('porridge') || name.includes('granola')) {
    return 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1000&q=85';
  }

  // 20. BREAD & TOAST & SANDWICH
  if (name.includes('bread') || name.includes('toast') || name.includes('sandwich')) {
    return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1000&q=85';
  }

  // If currentImageUrl is not generic, keep it
  if (currentImageUrl && !isGenericOrIdli) {
    return currentImageUrl;
  }

  return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85';
}
