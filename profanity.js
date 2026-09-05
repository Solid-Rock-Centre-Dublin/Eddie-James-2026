// Client-side safety filter. The Firebase database rules also restrict shape/length.
// For stronger server-side language moderation, add a Cloud Function later.
window.PrayerWallFilter = (() => {
  // Keep this list editable for the church media team. It intentionally includes
  // common profanity, explicit sexual terms and a few broad derogatory terms.
  const blocked = [
    'fuck','fucker','fucking','motherfucker','shit','bullshit','bitch','bastard','asshole',
    'dick','cock','cunt','pussy','porn','whore','slut','nigger','nigga','faggot','retard'
  ];

  const substitutions = { '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s' };

  function normalizeForCheck(value) {
    let s = value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    s = [...s].map(ch => substitutions[ch] || ch).join('');
    return s.replace(/[^a-z]/g, '');
  }

  function containsBlockedWord(value) {
    const normalized = normalizeForCheck(value);
    return blocked.some(word => normalized.includes(word));
  }

  function validateName(raw) {
    const value = raw.trim().replace(/\s+/g, ' ');
    if (!value) return { ok:false, message:'Please enter a name.' };
    if (value.length > 40) return { ok:false, message:'Please keep the name under 40 characters.' };
    const words = value.split(' ');
    if (words.length > 2) return { ok:false, message:'Please enter only a first name, or first name + surname.' };
    // Letters, apostrophes and hyphens only; supports accented Latin names.
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'’\-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'’\-]+)?$/.test(value)) {
      return { ok:false, message:'Please use letters only (apostrophes and hyphens are okay).' };
    }
    if (containsBlockedWord(value)) {
      return { ok:false, message:"That name can't be submitted. Please check what you've entered." };
    }
    // Title-case presentation without forcing McDonald/O'Neil edge cases too aggressively.
    const clean = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { ok:true, value:clean };
  }

  return { validateName, containsBlockedWord };
})();
