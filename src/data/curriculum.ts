import type { BoundaryPresetId, FilterChoice } from '../shared/protocol';
import type { OpticalColorName } from '../utils/optics';

export type FlashcardTopic = 'refraction' | 'lenses' | 'prism-rgb' | 'filters';

export interface FlashcardItem {
  id: number;
  topic: FlashcardTopic;
  term: string;
  def: string;
}

export const FLASHCARDS: FlashcardItem[] = [
  // Refraction Fundamentals (10)
  { id: 1, topic: 'refraction', term: 'Refraction of Light', def: 'The change in direction (bending) of light as it passes from one transparent medium (substance) to another of different optical density.' },
  { id: 2, topic: 'refraction', term: 'The Normal Line', def: 'An imaginary reference line drawn at 90° (perpendicular) to the surface or boundary where a light ray enters or leaves. All angles are measured from the normal.' },
  { id: 3, topic: 'refraction', term: 'Air → Glass (Less Dense to More Dense)', def: 'When light enters a more optically dense medium like glass or water, it slows down and bends TOWARDS the normal (angle of refraction < angle of incidence).' },
  { id: 4, topic: 'refraction', term: 'Glass → Air (More Dense to Less Dense)', def: 'When light leaves a denser medium into air, it speeds up and bends AWAY from the normal (angle of refraction > angle of incidence).' },
  { id: 5, topic: 'refraction', term: 'Refractive Index (n)', def: 'A measure of how much a medium slows light down and bends it. Air ≈ 1.00, Water ≈ 1.33, Glass ≈ 1.50, Diamond ≈ 2.42.' },
  { id: 6, topic: 'refraction', term: 'Incident, Refracted & Emerging Rays', def: 'Incident ray approaches the boundary. Refracted ray bends inside the second medium. Emerging ray leaves the block back into the original medium.' },
  { id: 7, topic: 'refraction', term: 'Entry at 0° to the Normal (90° to Surface)', def: 'Light slows down or speeds up, but passes straight through without bending because the entire wavefront hits the boundary simultaneously.' },
  { id: 8, topic: 'refraction', term: 'Car & Mud Analogy', def: 'Hitting mud squarely slows both front wheels together (straight). Hitting at an angle slows one wheel first while the other stays fast, turning the car towards the normal.' },
  { id: 9, topic: 'refraction', term: 'Law of Reflection vs. Refraction', def: 'Reflection bounces light back in the same medium with angle i = angle r. Refraction transmits light into a new medium where speed and angle change.' },
  { id: 10, topic: 'refraction', term: 'Parallel-Sided Glass Block Emerging Ray', def: 'When light enters and exits a parallel-sided glass block into air, the emerging ray bends back by the same amount, emerging parallel to the original incident ray (but shifted sideways).' },

  // Lenses & Real-World Refraction (10)
  { id: 11, topic: 'lenses', term: 'Bent Pencil & Apparent Depth in Water', def: 'Light from an underwater pencil speeds up and bends away from the normal as it enters air. Our brain traces straight lines back, making the pencil look bent and shallower.' },
  { id: 12, topic: 'lenses', term: 'Spear Fishing & Refraction Aiming', def: 'Because light from a submerged fish bends away from the normal leaving water, the fish appears higher (shallower) than it really is — so you must aim slightly below where it appears.' },
  { id: 13, topic: 'lenses', term: 'UAE Summer Desert Mirage', def: 'Hot air just above desert sand is less dense than cooler air above it. Sky light refracts gradually upwards through these air layers, creating the illusion of water on the sand.' },
  { id: 14, topic: 'lenses', term: 'Total Internal Reflection (TIR)', def: 'When light inside a denser medium hits the boundary to a less dense medium at an angle greater than the critical angle, 100% of the light reflects back inside instead of refracting out.' },
  { id: 15, topic: 'lenses', term: 'Optical Fibres (Internet & Endoscopes)', def: 'Thin glass fibres trap pulses of light using repeated Total Internal Reflection so signals travel fast around bends with minimal energy loss.' },
  { id: 16, topic: 'lenses', term: 'Convex (Converging) Lens', def: 'A lens thicker in the middle than at the edges. It refracts parallel light rays inward so they meet at a single Focal Point (F).' },
  { id: 17, topic: 'lenses', term: 'Concave (Diverging) Lens', def: 'A lens thinner in the middle than at the edges. It spreads parallel light rays outward away from a principal focus behind the lens.' },
  { id: 18, topic: 'lenses', term: 'Focal Length (f) & Lens Curvature', def: 'Focal length is the distance from the centre of a lens to its focal point. A thicker, more curved convex lens bends light more strongly and has a SHORTER focal length.' },
  { id: 19, topic: 'lenses', term: '3 Uses of Converging (Convex) Lenses', def: 'Magnifying glasses (enlarging close objects), camera lenses (focusing light onto the sensor), and the human eye / reading glasses (focusing onto the retina).' },
  { id: 20, topic: 'lenses', term: 'Human Eye: Cornea, Lens & Retina', def: 'The cornea and flexible convex lens refract light to focus a sharp inverted image on the retina, which contains light-sensitive rod and cone cells.' },

  // Prism Dispersion & RGB Light (10)
  { id: 21, topic: 'prism-rgb', term: 'Transverse Light Waves', def: 'Light travels as a transverse wave in straight lines through a uniform medium and can travel through a vacuum (no particles needed).' },
  { id: 22, topic: 'prism-rgb', term: 'Dispersion in a Prism', def: 'Splitting white light into the 7 colours of the visible spectrum (Red, Orange, Yellow, Green, Blue, Indigo, Violet) using a triangular glass prism.' },
  { id: 23, topic: 'prism-rgb', term: 'Why White Light Splits into a Spectrum', def: 'Each colour has a different wavelength and slows down by a slightly different amount in glass, so each wavelength refracts at a different angle.' },
  { id: 24, topic: 'prism-rgb', term: 'Red vs. Violet in a Prism', def: 'Red has the longest visible wavelength and bends the LEAST. Violet has the shortest visible wavelength, travels SLOWEST in glass, and bends the MOST.' },
  { id: 25, topic: 'prism-rgb', term: 'Natural Rainbows', def: 'Sunlight enters millions of water droplets in the sky, refracts and disperses into 7 colours, reflects off the back of each droplet, and refracts again leaving the droplet.' },
  { id: 26, topic: 'prism-rgb', term: 'Primary Colours of Light (RGB)', def: 'Red, Green, and Blue — matching the 3 types of colour-sensitive cone cells in the human retina. (Art paints use Red, Yellow, Blue pigments instead.)' },
  { id: 27, topic: 'prism-rgb', term: 'Secondary Colours of Light (CMY)', def: 'Red + Green = Yellow; Green + Blue = Cyan; Red + Blue = Magenta. Overlapping all three RGB primary lights makes White light.' },
  { id: 28, topic: 'prism-rgb', term: 'Wavelength & Frequency Relationship', def: 'Across the visible spectrum from Red to Violet, wavelength decreases while wave frequency increases.' },
  { id: 29, topic: 'prism-rgb', term: 'Monochromatic Light Through a Prism', def: 'A single pure colour (such as pure Red laser light) bends when passing through a prism, but does NOT split into a rainbow because it only contains one wavelength.' },
  { id: 30, topic: 'prism-rgb', term: 'Recombining the Spectrum', def: 'Placing a second inverted triangular prism in the path of the dispersed spectrum refracts the 7 colours back together into white light.' },

  // Optical Filters & Selective Appearance (10)
  { id: 31, topic: 'filters', term: 'Transmit, Absorb & Reflect', def: 'Transmit: pass through a medium. Absorb: take in wave energy (converting it to heat). Reflect: bounce off a surface.' },
  { id: 32, topic: 'filters', term: 'Transparent vs. Translucent vs. Opaque', def: 'Transparent materials (clear glass) transmit almost all light clearly. Translucent scatters transmitted light. Opaque blocks transmission by reflecting and absorbing light.' },
  { id: 33, topic: 'filters', term: 'Primary Optical Filter (Red / Green / Blue)', def: 'A transparent filter that transmits ONLY its own primary wavelength and absorbs all other colours from white light.' },
  { id: 34, topic: 'filters', term: 'Secondary Optical Filter (Yellow / Cyan / Magenta)', def: 'Yellow filters transmit Red + Green; Cyan filters transmit Green + Blue; Magenta filters transmit Red + Blue.' },
  { id: 35, topic: 'filters', term: 'Stacked Opposite Primary Filters (Red + Blue)', def: 'A red filter transmits only red light; a subsequent blue filter absorbs red light. Result: NO light passes through (appears black).' },
  { id: 36, topic: 'filters', term: 'Stacked Magenta + Blue Filter', def: 'A magenta filter transmits Red + Blue. The blue filter then absorbs Red and transmits Blue, so pure Blue light emerges.' },
  { id: 37, topic: 'filters', term: 'Why Objects Look Coloured in White Light', def: 'A green leaf reflects green wavelengths to your eye and absorbs red and blue. White objects reflect all visible wavelengths; black objects absorb almost all.' },
  { id: 38, topic: 'filters', term: 'Garden Gnome Through a Green Filter', def: 'Green jacket & white beard reflect green light so look green; red hat, blue jeans & black shoes cannot reflect green, so they appear black.' },
  { id: 39, topic: 'filters', term: 'Coloured Costume Under Coloured Spotlight', def: 'A blue costume in a red spotlight absorbs all red light and reflects nothing, so it appears BLACK. Under a cyan spotlight (G+B), it reflects blue and appears BLUE.' },
  { id: 40, topic: 'filters', term: 'UAE Desert Photo with Red/Orange Filter', def: 'Warm red and orange wavelengths reflected off the desert sand pass through the filter, while blue sky wavelengths are absorbed — darkening the sky dramatically.' },
];

export type QuestionTopic = 'refraction' | 'lenses' | 'prism-rgb' | 'filters';

export type QuestionDiagram =
  | { kind: 'boundary'; preset: BoundaryPresetId; angle: number; labelA?: string; labelB?: string }
  | { kind: 'prism'; highlight?: 'red' | 'violet' | 'all' }
  | { kind: 'filter-stack'; f1: FilterChoice; f2: FilterChoice }
  | { kind: 'lens'; lensKind: 'convex' | 'concave' };

export interface QuizQuestion {
  id: string;
  topic: QuestionTopic;
  paper: 'A' | 'B';
  difficulty: 'Core' | 'Applied' | 'Challenge';
  q: string;
  opts: string[];
  ans: number;
  exp: string;
  diagram?: QuestionDiagram;
}

export const QUIZ_BANK: QuizQuestion[] = [
  // ================= REFRACTION (15) =================
  {
    id: 'q1', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'What happens to a ray of light when it moves from air into a glass block at an angle?',
    opts: ['It speeds up and bends away from the normal', 'It slows down and bends towards the normal', 'It slows down and bends away from the normal', 'It keeps the exact same speed and direction'],
    ans: 1,
    exp: 'Glass is more optically dense than air, so light slows down upon entering and bends towards the normal.',
    diagram: { kind: 'boundary', preset: 'air-glass', angle: 45 },
  },
  {
    id: 'q2', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'Light enters glass from air at an angle of incidence of 45°. Which value could be the angle of refraction?',
    opts: ['65°', '45°', '28°', '90°'],
    ans: 2,
    exp: 'Because light bends towards the normal entering denser glass, the angle of refraction must be smaller than 45° (about 28°).',
    diagram: { kind: 'boundary', preset: 'air-glass', angle: 45 },
  },
  {
    id: 'q3', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'When a ray of light leaves a glass block and enters air at an angle of 30°, how does it behave?',
    opts: ['It speeds up and bends away from the normal', 'It slows down and bends towards the normal', 'It stops at the boundary', 'It passes straight through with no angle change'],
    ans: 0,
    exp: 'Air is less dense than glass, so the emerging ray speeds up and bends away from the normal.',
    diagram: { kind: 'boundary', preset: 'glass-air', angle: 30 },
  },
  {
    id: 'q4', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'In a ray-box experiment, what happens when the light ray hits the glass block at 90° to the surface (0° to the normal)?',
    opts: ['It bends 45° towards the normal', 'It passes straight through without bending', 'It splits into a 7-colour rainbow', 'It reflects straight back out'],
    ans: 1,
    exp: 'At 0° to the normal, the entire wavefront hits the boundary at the same instant, so it slows down without changing direction.',
    diagram: { kind: 'boundary', preset: 'air-glass', angle: 0 },
  },
  {
    id: 'q5', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'What is the "normal" line on an optical ray diagram?',
    opts: ['The ray leaving the glass block', 'The edge of the glass block', 'A reference line drawn at 90° (perpendicular) to the boundary', 'The path light takes inside water'],
    ans: 2,
    exp: 'The normal is always drawn perpendicular (90°) to the boundary surface where the ray meets it; angles are measured from the normal.',
  },
  {
    id: 'q6', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'What does the "refractive index" (n) of a transparent material tell us?',
    opts: ['The temperature of the medium', 'How much the material slows down and bends light', 'The colour reflected by the material', 'The thickness of the glass block'],
    ans: 1,
    exp: 'A higher refractive index means light slows down more and bends further towards the normal.',
  },
  {
    id: 'q7', topic: 'refraction', paper: 'B', difficulty: 'Applied',
    q: 'In the car-and-mud analogy, a car drives from smooth asphalt onto mud at an angle. Why does the car turn towards the normal?',
    opts: ['The front wheel entering mud first slows down while the other wheel stays fast', 'Both back wheels speed up at the same time', 'Mud pushes the car sideways from behind', 'The steering wheel locks automatically'],
    ans: 0,
    exp: 'One side of the wavefront (wheel) enters the slower medium first, causing the wavefront to pivot towards the normal.',
  },
  {
    id: 'q8', topic: 'refraction', paper: 'B', difficulty: 'Applied',
    q: 'Light passes from water (n = 1.33) into diamond (n = 2.42) at an angle of 40°. How will the ray change?',
    opts: ['Speed up and bend away from the normal', 'Slow down significantly and bend towards the normal', 'Pass straight through at 40°', 'Undergo total internal reflection'],
    ans: 1,
    exp: 'Diamond has a much higher refractive index than water, so light slows down strongly and bends towards the normal.',
  },
  {
    id: 'q9', topic: 'refraction', paper: 'B', difficulty: 'Applied',
    q: 'A student measures the angle between the incident ray and the GLASS SURFACE as 35°. What is the true angle of incidence?',
    opts: ['35°', '55°', '70°', '145°'],
    ans: 1,
    exp: 'Angles in optics are always measured from the NORMAL (90° to the surface). So 90° - 35° = 55°.',
  },
  {
    id: 'q10', topic: 'refraction', paper: 'B', difficulty: 'Applied',
    q: 'A light ray enters a parallel-sided glass block at 42° in air and later exits the opposite parallel side back into air. What is the emerging angle?',
    opts: ['Smaller than 42°', 'Equal to 42° (parallel to the incident ray)', '90° along the surface', '0° along the normal'],
    ans: 1,
    exp: 'The ray bends towards the normal entering glass, then bends away by the exact opposite amount leaving parallel glass into air.',
  },
  {
    id: 'q11', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'How do the angles in reflection and refraction compare?',
    opts: ['In reflection angle i = angle r; in refraction (at an angle) the refracted angle differs from the incident angle', 'Both always keep angles equal', 'Refraction angles are always 90°', 'Reflection only happens in air'],
    ans: 0,
    exp: 'Reflection keeps light in the same medium at the same speed (angle i = r), whereas refraction changes medium and speed.',
  },
  {
    id: 'q12', topic: 'refraction', paper: 'B', difficulty: 'Challenge',
    q: 'A ray inside glass (n = 1.50) hits the boundary to air (n = 1.00) at 50°, which is greater than the critical angle (~41.8°). What happens?',
    opts: ['It refracts out into air at 75°', 'It passes straight out at 50°', 'It undergoes Total Internal Reflection back into the glass', 'It splits into a rainbow'],
    ans: 2,
    exp: 'When light in a denser medium hits a less dense boundary beyond the critical angle, no ray escapes — it undergoes Total Internal Reflection.',
    diagram: { kind: 'boundary', preset: 'glass-air', angle: 50 },
  },
  {
    id: 'q13', topic: 'refraction', paper: 'B', difficulty: 'Challenge',
    q: 'Which material pair has the LARGEST amount of bending (greatest speed ratio) for a ray entering at 45°?',
    opts: ['Air (1.00) → Water (1.33)', 'Water (1.33) → Glass (1.50)', 'Air (1.00) → Diamond (2.42)', 'Glass (1.50) → Water (1.33)'],
    ans: 2,
    exp: 'Air to diamond has the largest refractive index jump (1.00 to 2.42), causing the biggest speed drop and sharpest bend towards the normal.',
  },
  {
    id: 'q14', topic: 'refraction', paper: 'B', difficulty: 'Applied',
    q: 'During refraction across a boundary from air into water, which property of the light wave stays CONSTANT?',
    opts: ['Wave speed', 'Wavelength', 'Frequency', 'Angle relative to the normal'],
    ans: 2,
    exp: 'When light slows down in a denser medium, its wavelength shortens proportionally while its frequency remains unchanged.',
  },
  {
    id: 'q15', topic: 'refraction', paper: 'A', difficulty: 'Core',
    q: 'In the medium boundary diagram shown (Glass → Air at 25°), will the refracted angle in air be greater than or less than 25°?',
    opts: ['Greater than 25° (bends away from normal)', 'Less than 25° (bends towards normal)', 'Exactly 25°', 'Exactly 0°'],
    ans: 0,
    exp: 'Moving from denser glass into less dense air speeds the wave up, bending it away from the normal (so angle > 25°).',
    diagram: { kind: 'boundary', preset: 'glass-air', angle: 25 },
  },

  // ================= LENSES & REAL-WORLD REFRACTION (15) =================
  {
    id: 'q16', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'Why does a straight pencil sitting in a glass of water appear bent at the water surface?',
    opts: ['Water softens the wood', 'Light from the submerged part speeds up and bends away from the normal as it enters air', 'Air is denser than water so light slows down', 'The glass absorbs green wavelengths'],
    ans: 1,
    exp: 'Light leaving water into air bends away from the normal; our brain traces straight lines back, making the submerged part look shifted.',
  },
  {
    id: 'q17', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'Why do mirages commonly occur over desert sand in the UAE during hot summers?',
    opts: ['Sand grains act like tiny blue mirrors', 'Hot low-density air near the sand and cooler denser air above refract sky light upwards', 'Sunlight cannot pass through dry air', 'Heat turns air into a solid prism'],
    ans: 1,
    exp: 'Hot air near sun-baked sand is less dense than cooler air above, bending sky light upwards so it looks like shimmering water.',
  },
  {
    id: 'q18', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'What does a Convex (Converging) Lens do to parallel rays of light?',
    opts: ['Spreads them apart so they never meet', 'Absorbs all wavelengths except red', 'Refracts them inward to converge at a focal point', 'Reflects them backwards'],
    ans: 2,
    exp: 'A convex lens is thicker in the middle and bends parallel rays inward to focus an image at the focal point (F).',
    diagram: { kind: 'lens', lensKind: 'convex' },
  },
  {
    id: 'q19', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'Which list contains three everyday uses of converging (convex) lenses?',
    opts: ['Periscope, flat mirror, kaleidoscope', 'Magnifying glass, camera lens, human eye / reading glasses', 'Black curtain, red filter, prism', 'Concave shaving mirror, sunglasses, spoon'],
    ans: 1,
    exp: 'Magnifying glasses, cameras, and human eyes all rely on converging lenses to focus light.',
  },
  {
    id: 'q20', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'In the human eye, what is the light-sensitive surface at the back where the lens focuses an image?',
    opts: ['Cornea', 'Iris', 'Retina', 'Optic blind spot'],
    ans: 2,
    exp: 'The retina lines the back of the eye and contains rod and cone cells that detect brightness and RGB colour.',
  },
  {
    id: 'q21', topic: 'lenses', paper: 'B', difficulty: 'Applied',
    q: 'If you look straight down into a clear swimming pool, the bottom looks shallower than its true depth. Why?',
    opts: ['Water pushes the tiles upward', 'Light from the pool bottom refracts away from the normal entering air', 'Light slows down entering air', 'Blue water absorbs depth'],
    ans: 1,
    exp: 'Apparent depth is shallower than real depth because rays from the bottom bend away from the normal as they exit water into air.',
  },
  {
    id: 'q22', topic: 'lenses', paper: 'B', difficulty: 'Applied',
    q: 'A fisherman sees a fish underwater from above the surface. Where should he aim a spear to hit it?',
    opts: ['Directly at the image he sees', 'Slightly ABOVE the apparent image', 'Slightly BELOW the apparent image', 'Behind the boat'],
    ans: 2,
    exp: 'Refraction makes the fish appear closer to the surface (higher) than its true position, so aiming slightly below hits the real fish.',
  },
  {
    id: 'q23', topic: 'lenses', paper: 'B', difficulty: 'Applied',
    q: 'Compare two convex lenses made of the same glass: Lens X is very thick and strongly curved; Lens Y is thin and gently curved. Which has a SHORTER focal length?',
    opts: ['Lens X (thicker/more curved bends rays more sharply)', 'Lens Y (thinner bends rays more sharply)', 'Both always have the exact same focal length', 'Neither lens has a focal point'],
    ans: 0,
    exp: 'Greater curvature bends parallel light rays through a larger angle, bringing them to a focus closer to the lens (shorter focal length).',
  },
  {
    id: 'q24', topic: 'lenses', paper: 'B', difficulty: 'Applied',
    q: 'What does a Concave (Diverging) Lens do to parallel rays of light?',
    opts: ['Brings them to a tight bright focus in front', 'Spreads the rays outward as if coming from a focal point behind the lens', 'Turns white light into green light', 'Reflects 100% of incoming light'],
    ans: 1,
    exp: 'A concave lens is thinner in the middle and diverges parallel rays outward.',
    diagram: { kind: 'lens', lensKind: 'concave' },
  },
  {
    id: 'q25', topic: 'lenses', paper: 'B', difficulty: 'Challenge',
    q: 'How do high-speed fibre-optic internet cables keep light inside glass strands even when the cable bends around corners?',
    opts: ['By coating the outside with black paint', 'Through repeated Total Internal Reflection inside the denser glass core', 'By using concave lenses every millimetre', 'Because light slows to zero at bends'],
    ans: 1,
    exp: 'Light hits the inner cladding boundary above the critical angle and bounces along the fibre core via Total Internal Reflection.',
  },
  {
    id: 'q26', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'How many times does a parallel ray of light refract as it passes completely through a glass convex lens in air?',
    opts: ['Zero times', 'Once (only at the centre)', 'Twice (entering the front curved surface and leaving the back curved surface)', 'Seven times'],
    ans: 2,
    exp: 'Light bends at the air→glass front surface and bends again at the glass→air back surface.',
  },
  {
    id: 'q27', topic: 'lenses', paper: 'B', difficulty: 'Challenge',
    q: 'A person with short-sightedness (myopia) has eyeballs where parallel light focuses IN FRONT of the retina. Which lens helps diverge the rays slightly before the eye?',
    opts: ['A concave (diverging) lens', 'A thicker convex lens', 'A triangular glass prism', 'A red optical filter'],
    ans: 0,
    exp: 'A concave lens spreads rays slightly outward so the eye focuses the image farther back right onto the retina.',
  },
  {
    id: 'q28', topic: 'lenses', paper: 'B', difficulty: 'Applied',
    q: 'Why does a diamond sparkle far more brilliantly than a piece of clear glass cut in the exact same shape?',
    opts: ['Diamond glows in the dark', 'Diamond has a much higher refractive index (2.42) and smaller critical angle, trapping and reflecting more light internally', 'Diamond absorbs all colours except blue', 'Glass cannot refract light'],
    ans: 1,
    exp: 'Diamond’s high refractive index gives a tiny critical angle (~24°), causing light entering to undergo multiple total internal reflections.',
  },
  {
    id: 'q29', topic: 'lenses', paper: 'A', difficulty: 'Core',
    q: 'Which part of the human eye changes shape using ciliary muscles to fine-tune focal length for near vs. distant objects?',
    opts: ['The pupil', 'The retina', 'The flexible crystalline lens', 'The optic nerve'],
    ans: 2,
    exp: 'The eye’s flexible convex lens becomes rounder (shorter focal length) for close reading and flatter for distant viewing.',
  },
  {
    id: 'q30', topic: 'lenses', paper: 'B', difficulty: 'Applied',
    q: 'If you hold a convex magnifying glass in sunlight at its exact focal length above dry paper, why can it create a tiny hot spot?',
    opts: ['The lens generates electricity', 'It converges parallel solar rays onto a single small focal point, concentrating energy', 'Glass amplifies the sun’s frequency', 'Air turns into a prism'],
    ans: 1,
    exp: 'All incoming parallel rays converge at the focal point (F), concentrating light and thermal energy onto a tiny area.',
  },

  // ================= PRISM DISPERSION & RGB (15) =================
  {
    id: 'q31', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'What type of wave is light?',
    opts: ['Longitudinal mechanical wave', 'Transverse wave', 'Sound compression wave', 'Standing water ripple only'],
    ans: 1,
    exp: 'Light is a transverse electromagnetic wave that oscillates perpendicular to its direction of travel.',
  },
  {
    id: 'q32', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'Splitting white light into a 7-colour visible spectrum using a glass triangular prism is called:',
    opts: ['Absorption', 'Dispersion', 'Reflection', 'Convergence'],
    ans: 1,
    exp: 'Dispersion separates white light into Red, Orange, Yellow, Green, Blue, Indigo, and Violet.',
    diagram: { kind: 'prism', highlight: 'all' },
  },
  {
    id: 'q33', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'Inside a glass prism during dispersion, which colour bends the LEAST and which travels the SLOWEST (bends the most)?',
    opts: ['Violet bends least; Red travels slowest', 'Green bends least; Blue travels slowest', 'Red bends least; Violet travels slowest and bends most', 'All 7 colours bend equally'],
    ans: 2,
    exp: 'Red has the longest visible wavelength and bends least; violet has the shortest visible wavelength, travels slowest in glass, and bends most.',
    diagram: { kind: 'prism', highlight: 'all' },
  },
  {
    id: 'q34', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'What is the correct order of the 7 colours in the visible spectrum from LEAST bent to MOST bent through a prism?',
    opts: ['Violet, Indigo, Blue, Green, Yellow, Orange, Red', 'Red, Orange, Yellow, Green, Blue, Indigo, Violet', 'Red, Yellow, Orange, Blue, Green, Violet, Indigo', 'Blue, Green, Red, Yellow, Orange, Violet, Indigo'],
    ans: 1,
    exp: 'From least refracted (longest wavelength) to most refracted (shortest wavelength): Red, Orange, Yellow, Green, Blue, Indigo, Violet.',
  },
  {
    id: 'q35', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'Which three colours are the primary colours of LIGHT (matching the 3 cone cell types in the human retina)?',
    opts: ['Red, Yellow, Blue', 'Cyan, Magenta, Yellow', 'Red, Green, Blue', 'Orange, Green, Violet'],
    ans: 2,
    exp: 'Light mixing (screens, stage lights, human retina cones) uses Red, Green, and Blue (RGB).',
  },
  {
    id: 'q36', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'What secondary colour of light is produced when Red light and Green light overlap on a white screen?',
    opts: ['Cyan', 'Magenta', 'Yellow', 'Brown'],
    ans: 2,
    exp: 'In additive RGB light mixing: Red + Green = Yellow.',
  },
  {
    id: 'q37', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'What secondary colour of light is produced when Green light and Blue light overlap?',
    opts: ['Yellow', 'Cyan', 'Magenta', 'White'],
    ans: 1,
    exp: 'Green + Blue light = Cyan.',
  },
  {
    id: 'q38', topic: 'prism-rgb', paper: 'A', difficulty: 'Core',
    q: 'What secondary colour of light is produced when Red light and Blue light overlap?',
    opts: ['Yellow', 'Magenta', 'Cyan', 'Orange'],
    ans: 1,
    exp: 'Red + Blue light = Magenta.',
  },
  {
    id: 'q39', topic: 'prism-rgb', paper: 'B', difficulty: 'Applied',
    q: 'If you shine a pure RED laser beam (monochromatic light) into a triangular glass prism, what appears on the screen?',
    opts: ['A full 7-colour rainbow spectrum', 'Only a single bent red beam (no splitting)', 'A cyan and yellow beam', 'Nothing exits the prism'],
    ans: 1,
    exp: 'A prism does not create colours — it separates existing wavelengths. Pure red light only has one wavelength, so it refracts once without splitting.',
    diagram: { kind: 'prism', highlight: 'red' },
  },
  {
    id: 'q40', topic: 'prism-rgb', paper: 'B', difficulty: 'Applied',
    q: 'Why does mixing Red + Green + Blue paint in art class make muddy dark brown, while mixing Red + Green + Blue spotlights makes crisp White light?',
    opts: ['Paint adds pigments that absorb wavelengths (subtractive), whereas spotlights add light wavelengths together (additive)', 'Stage bulbs contain invisible white paint', 'Human cones only work in art class', 'Glass prisms turn paint white'],
    ans: 0,
    exp: 'Lights combine additively (R+G+B triggers all three retina cone types -> white). Paints absorb wavelengths subtractively.',
  },
  {
    id: 'q41', topic: 'prism-rgb', paper: 'B', difficulty: 'Applied',
    q: 'A student draws a prism diagram showing Violet at the TOP (least bent) and Red at the BOTTOM (most bent). What mistake did they make?',
    opts: ['Prisms do not bend light at all', 'Red should bend least (top) and Violet should bend most (bottom)', 'Green should be missing from the spectrum', 'White light should exit straight without bending'],
    ans: 1,
    exp: 'Violet slows down more in glass than red, so violet always refracts through the larger angle.',
  },
  {
    id: 'q42', topic: 'prism-rgb', paper: 'B', difficulty: 'Challenge',
    q: 'What happens if you pass the 7-colour spectrum from Prism 1 into an identical second prism flipped upside down?',
    opts: ['It splits into 49 colours', 'The colours recombine back into a beam of White light', 'All colours are absorbed', 'Only green light survives'],
    ans: 1,
    exp: 'Isaac Newton proved white light is made of the spectrum by using an inverted second prism to undo the dispersion and recombine white light.',
  },
  {
    id: 'q43', topic: 'prism-rgb', paper: 'B', difficulty: 'Applied',
    q: 'In a natural rainbow, what acts as the tiny prisms that disperse sunlight?',
    opts: ['Dust particles in space', 'Suspended spherical water droplets in the air', 'Ozone molecules only', 'Ice crystals on the ground'],
    ans: 1,
    exp: 'Rainbows form when sunlight refracts, disperses, internally reflects, and refracts again out of millions of water droplets.',
  },
  {
    id: 'q44', topic: 'prism-rgb', paper: 'B', difficulty: 'Challenge',
    q: 'A TV screen pixel lights up ONLY its Red and Blue sub-pixels at full brightness (Green is off). What colour does your eye perceive from across the room?',
    opts: ['Yellow', 'Cyan', 'Magenta', 'Black'],
    ans: 2,
    exp: 'Tiny RGB sub-pixels blend in the eye: Red + Blue stimulation of cone cells is perceived as Magenta.',
  },
  {
    id: 'q45', topic: 'prism-rgb', paper: 'B', difficulty: 'Applied',
    q: 'As you move across the spectrum from Red towards Violet, how do wavelength and frequency change?',
    opts: ['Wavelength increases and frequency increases', 'Wavelength decreases and frequency increases', 'Wavelength increases and frequency decreases', 'Both stay constant'],
    ans: 1,
    exp: 'Red has long wavelength / lower frequency; violet has short wavelength / higher frequency.',
  },

  // ================= OPTICAL FILTERS & APPEARANCE (15) =================
  {
    id: 'q46', topic: 'filters', paper: 'A', difficulty: 'Core',
    q: 'What does a green optical filter do when white light shines through it?',
    opts: ['Reflects green and turns red into blue', 'Transmits green wavelengths and absorbs all other colours', 'Splits green into 7 colours', 'Absorbs green and lets red and blue pass'],
    ans: 1,
    exp: 'A primary optical filter transmits only its own wavelength (green) and absorbs the remaining colours.',
  },
  {
    id: 'q47', topic: 'filters', paper: 'A', difficulty: 'Core',
    q: 'A garden gnome has a red hat, white beard, green jacket, blue jeans, and black shoes. How does it look through a GREEN filter?',
    opts: ['All parts look green', 'Jacket and beard look green; hat, jeans, and shoes look black', 'Hat looks red, jacket looks green, beard looks white', 'Only the shoes look green'],
    ans: 1,
    exp: 'Only green light reaches the gnome. The green jacket and white beard reflect green; the red hat, blue jeans, and black shoes absorb green and look black.',
  },
  {
    id: 'q48', topic: 'filters', paper: 'A', difficulty: 'Core',
    q: 'A theatre performer wears a blue costume in white light. What colour does the costume appear under a RED spotlight?',
    opts: ['Red', 'Blue', 'Purple', 'Black'],
    ans: 3,
    exp: 'A blue costume absorbs red light and reflects only blue. With only red light hitting it, no light is reflected, so it looks black.',
  },
  {
    id: 'q49', topic: 'filters', paper: 'A', difficulty: 'Core',
    q: 'Why does a white object appear red under a red optical filter, while a black object remains black?',
    opts: ['White reflects all visible colours (including red); black absorbs nearly all colours', 'White absorbs red light; black transmits it', 'Red filters coat objects in red dye', 'Black reflects violet only'],
    ans: 0,
    exp: 'White surfaces reflect any wavelength that hits them; black surfaces absorb all incoming visible wavelengths.',
  },
  {
    id: 'q50', topic: 'filters', paper: 'A', difficulty: 'Core',
    q: 'What wavelengths does a MAGENTA optical filter transmit when white light shines onto it?',
    opts: ['Only green', 'Red and Blue (absorbing Green)', 'Red and Green (absorbing Blue)', 'Blue and Green (absorbing Red)'],
    ans: 1,
    exp: 'Magenta is made of Red + Blue light, so a magenta filter transmits both Red and Blue while absorbing Green.',
  },
  {
    id: 'q51', topic: 'filters', paper: 'B', difficulty: 'Applied',
    q: 'White light passes through a RED filter and then immediately through a GREEN filter. What light emerges on the screen?',
    opts: ['Yellow light', 'Red light', 'Green light', 'No light (Black)'],
    ans: 3,
    exp: 'The red filter blocks everything except red light; the green filter then absorbs that red light, leaving darkness (black).',
    diagram: { kind: 'filter-stack', f1: 'red', f2: 'green' },
  },
  {
    id: 'q52', topic: 'filters', paper: 'B', difficulty: 'Challenge',
    q: 'White light passes through a MAGENTA filter and then through a BLUE filter. What colour emerges on the screen?',
    opts: ['Magenta', 'Red', 'Blue', 'Black'],
    ans: 2,
    exp: 'The magenta filter transmits Red + Blue. The blue filter absorbs Red and allows Blue to pass through.',
    diagram: { kind: 'filter-stack', f1: 'magenta', f2: 'blue' },
  },
  {
    id: 'q53', topic: 'filters', paper: 'B', difficulty: 'Challenge',
    q: 'White light passes through a YELLOW filter and then through a CYAN filter. Which colour passes through BOTH filters?',
    opts: ['Yellow', 'Green', 'Red', 'Black'],
    ans: 1,
    exp: 'Yellow transmits Red + Green; Cyan transmits Green + Blue. The only wavelength transmitted by both is Green!',
    diagram: { kind: 'filter-stack', f1: 'yellow', f2: 'cyan' },
  },
  {
    id: 'q54', topic: 'filters', paper: 'B', difficulty: 'Applied',
    q: 'A yellow banana (reflects Red + Green) is placed under a pure RED spotlight. What colour does the banana appear?',
    opts: ['Yellow', 'Red', 'Green', 'Black'],
    ans: 1,
    exp: 'A yellow surface reflects both Red and Green light. Since only Red light shines on it, it reflects Red light and looks Red!',
  },
  {
    id: 'q55', topic: 'filters', paper: 'B', difficulty: 'Applied',
    q: 'That same yellow banana (reflects Red + Green) is placed under a pure BLUE spotlight. What colour does it appear?',
    opts: ['Blue', 'Yellow', 'Green', 'Black'],
    ans: 3,
    exp: 'Yellow surfaces absorb Blue light and only reflect Red and Green. With only Blue light present, it looks Black.',
  },
  {
    id: 'q56', topic: 'filters', paper: 'B', difficulty: 'Challenge',
    q: 'A performer wears a WHITE shirt and RED trousers under a CYAN (Green + Blue) stage spotlight. How do they look?',
    opts: ['Cyan shirt and Black trousers', 'White shirt and Red trousers', 'Green shirt and Blue trousers', 'Black shirt and Red trousers'],
    ans: 0,
    exp: 'The white shirt reflects all incoming light (Cyan). The red trousers absorb both Green and Blue from cyan light, so they look Black.',
  },
  {
    id: 'q57', topic: 'filters', paper: 'B', difficulty: 'Applied',
    q: 'Why does a photographer shooting UAE desert dunes put an orange/red filter over a camera lens?',
    opts: ['To bend rays away from the normal', 'To transmit warm orange/red sand wavelengths while absorbing blue sky light for dramatic contrast', 'To turn white clouds green', 'To increase the focal length of the lens'],
    ans: 1,
    exp: 'Optical filters selectively transmit matching wavelengths (orange/red sand) and absorb complementary wavelengths (blue sky).',
  },
  {
    id: 'q58', topic: 'filters', paper: 'B', difficulty: 'Challenge',
    q: 'You look at the garden gnome (Red hat, White beard, Green jacket, Blue jeans) through a MAGENTA filter. How do the hat and jacket appear?',
    opts: ['Hat appears Red; Jacket appears Black', 'Hat appears Black; Jacket appears Green', 'Both appear Magenta', 'Hat appears Blue; Jacket appears Red'],
    ans: 0,
    exp: 'Magenta transmits Red + Blue (absorbing Green). The red hat reflects red (looks Red); the green jacket receives no green light (looks Black).',
  },
  {
    id: 'q59', topic: 'filters', paper: 'A', difficulty: 'Core',
    q: 'What happens to the light energy that is ABSORBED by a black car roof or dark optical filter?',
    opts: ['It is destroyed completely', 'It is converted into thermal (heat) energy', 'It turns into sound waves', 'It refracts downwards into the tyres'],
    ans: 1,
    exp: 'Absorbed light wavelengths transfer their energy to the material, warming it up (thermal energy).',
  },
  {
    id: 'q60', topic: 'filters', paper: 'B', difficulty: 'Challenge',
    q: 'A cyan car (reflects Green + Blue) is driven into a tunnel lit ONLY by YELLOW sodium lamps (Red + Green). What colour does the car look?',
    opts: ['Cyan', 'Yellow', 'Green', 'Black'],
    ans: 2,
    exp: 'Yellow light contains Red + Green. The cyan car absorbs Red and reflects Green, so it appears Green!',
  },
];

export interface MockPaperPreset {
  id: string;
  label: string;
  subtitle: string;
  questionIds: string[];
  timedSeconds: number | null;
}

export const MOCK_AFL_PAPERS: MockPaperPreset[] = [
  {
    id: 'quick-10',
    label: 'Quick 10 Mixed',
    subtitle: '10 random questions across all 4 optics topics',
    questionIds: [],
    timedSeconds: null,
  },
  {
    id: 'paper-a',
    label: 'Mock AFL Paper A (25 Qs)',
    subtitle: 'Core Curriculum Assessment · 15 min optional timer',
    questionIds: QUIZ_BANK.filter((q) => q.paper === 'A').slice(0, 25).map((q) => q.id),
    timedSeconds: 15 * 60,
  },
  {
    id: 'paper-b',
    label: 'Mock AFL Paper B (25 Qs)',
    subtitle: 'Extended Diagrams, Double Filters & Applications · 18 min',
    questionIds: QUIZ_BANK.filter((q) => q.paper === 'B').slice(0, 25).map((q) => q.id),
    timedSeconds: 18 * 60,
  },
  {
    id: 'marathon-50',
    label: 'Full Syllabus Mock (50 Qs)',
    subtitle: 'Comprehensive 50-question pre-exam simulation',
    questionIds: QUIZ_BANK.slice(0, 50).map((q) => q.id),
    timedSeconds: 30 * 60,
  },
];

// ================= CHALLENGE DATASETS =================

export interface SpotlightRow {
  id: string;
  label: OpticalColorName;
  swatch: string;
}

export const SPOTLIGHT_ROWS: SpotlightRow[] = [
  { id: 'white', label: 'White', swatch: 'var(--spec-white)' },
  { id: 'red', label: 'Red', swatch: 'var(--spec-red)' },
  { id: 'green', label: 'Green', swatch: 'var(--spec-green)' },
  { id: 'blue', label: 'Blue', swatch: 'var(--spec-blue)' },
  { id: 'yellow', label: 'Yellow', swatch: 'var(--spec-yellow)' },
  { id: 'cyan', label: 'Cyan', swatch: 'var(--spec-cyan)' },
  { id: 'magenta', label: 'Magenta', swatch: 'var(--spec-magenta)' },
  { id: 'black', label: 'Black', swatch: 'var(--spec-black)' },
];

export const SPOTLIGHT_COLUMNS: { id: FilterChoice; label: string; swatch: string }[] = [
  { id: 'red', label: 'Red Spotlight', swatch: 'var(--spec-red)' },
  { id: 'green', label: 'Green Spotlight', swatch: 'var(--spec-green)' },
  { id: 'blue', label: 'Blue Spotlight', swatch: 'var(--spec-blue)' },
  { id: 'yellow', label: 'Yellow Spotlight (R+G)', swatch: 'var(--spec-yellow)' },
];

export interface DensityCase {
  id: string;
  title: string;
  note: string;
  speed: 'slows' | 'speeds';
  bend: 'towards' | 'away' | 'straight';
}

export const DENSITY_DRILLS: DensityCase[] = [
  { id: 'd1', title: 'Air → Glass (at 40°)', note: 'n = 1.00 → n = 1.50', speed: 'slows', bend: 'towards' },
  { id: 'd2', title: 'Glass → Air (at 30°)', note: 'n = 1.50 → n = 1.00', speed: 'speeds', bend: 'away' },
  { id: 'd3', title: 'Water → Air (Submerged Pencil)', note: 'n = 1.33 → n = 1.00', speed: 'speeds', bend: 'away' },
  { id: 'd4', title: 'Air → Water (at 0° to Normal)', note: 'Hits boundary squarely at 90°', speed: 'slows', bend: 'straight' },
  { id: 'd5', title: 'Water → Glass (at 35°)', note: 'n = 1.33 → n = 1.50', speed: 'slows', bend: 'towards' },
  { id: 'd6', title: 'Diamond → Glass (at 20°)', note: 'n = 2.42 → n = 1.50', speed: 'speeds', bend: 'away' },
  { id: 'd7', title: 'Glass → Diamond (at 45°)', note: 'n = 1.50 → n = 2.42', speed: 'slows', bend: 'towards' },
  { id: 'd8', title: 'Glass → Water (at 0° to Normal)', note: 'Enters along the normal line', speed: 'speeds', bend: 'straight' },
];

export interface RayPathPuzzle {
  id: string;
  title: string;
  preset: BoundaryPresetId;
  incAngle: number;
  prompt: string;
  correctPath: 'A' | 'B' | 'C' | 'D';
  paths: { key: 'A' | 'B' | 'C' | 'D'; outAngle: number; isReflection?: boolean; desc: string }[];
  explanation: string;
}

export const RAY_PATH_PUZZLES: RayPathPuzzle[] = [
  {
    id: 'rp1',
    title: 'Case 1: Air → Glass at 50°',
    preset: 'air-glass',
    incAngle: 50,
    prompt: 'Which outgoing ray (A, B, C, or D) shows the true refracted path inside the glass block?',
    correctPath: 'B',
    paths: [
      { key: 'A', outAngle: 0, desc: 'Ray A (straight along normal 0°)' },
      { key: 'B', outAngle: 31, desc: 'Ray B (~31°, bent towards normal)' },
      { key: 'C', outAngle: 50, desc: 'Ray C (50°, unbent straight line)' },
      { key: 'D', outAngle: 70, desc: 'Ray D (70°, bent away from normal)' },
    ],
    explanation: 'Entering denser glass slows light down, so it bends towards the normal (50° → ~31°).',
  },
  {
    id: 'rp2',
    title: 'Case 2: Water → Air at 35°',
    preset: 'water-air',
    incAngle: 35,
    prompt: 'Light exits water (n = 1.33) into air (n = 1.00) at 35°. Pick the true refracted ray.',
    correctPath: 'D',
    paths: [
      { key: 'A', outAngle: 15, desc: 'Ray A (15°, bent towards normal)' },
      { key: 'B', outAngle: 35, desc: 'Ray B (35°, unbent straight line)' },
      { key: 'C', outAngle: 0, desc: 'Ray C (0°, along normal)' },
      { key: 'D', outAngle: 50, desc: 'Ray D (~50°, bent away from normal)' },
    ],
    explanation: 'Exiting denser water into air speeds light up, bending it away from the normal (35° → ~50°).',
  },
  {
    id: 'rp3',
    title: 'Case 3: Glass → Air at 55° (Beyond Critical Angle)',
    preset: 'glass-air',
    incAngle: 55,
    prompt: 'The critical angle for glass → air is ~42°. If light hits at 55°, which ray occurs?',
    correctPath: 'A',
    paths: [
      { key: 'A', outAngle: 55, isReflection: true, desc: 'Ray A (Total Internal Reflection at 55°)' },
      { key: 'B', outAngle: 33, desc: 'Ray B (33°, bent towards normal)' },
      { key: 'C', outAngle: 55, desc: 'Ray C (55°, straight into air)' },
      { key: 'D', outAngle: 78, desc: 'Ray D (78°, refracted into air)' },
    ],
    explanation: 'Since 55° > 42° critical angle, light cannot escape into air and undergoes Total Internal Reflection.',
  },
];

export interface StackedFilterPuzzle {
  id: string;
  label: string;
  f1: FilterChoice;
  f2: FilterChoice;
  expected: OpticalColorName;
  hint: string;
}

export const STACKED_FILTER_PUZZLES: StackedFilterPuzzle[] = [
  { id: 'sf1', label: 'White Light → Red Filter → Blue Filter', f1: 'red', f2: 'blue', expected: 'Black', hint: 'Red filter passes only Red; Blue filter absorbs Red.' },
  { id: 'sf2', label: 'White Light → Magenta Filter → Red Filter', f1: 'magenta', f2: 'red', expected: 'Red', hint: 'Magenta passes Red + Blue; Red filter keeps Red.' },
  { id: 'sf3', label: 'White Light → Yellow Filter → Cyan Filter', f1: 'yellow', f2: 'cyan', expected: 'Green', hint: 'Yellow passes R+G; Cyan passes G+B.' },
  { id: 'sf4', label: 'White Light → Cyan Filter → Magenta Filter', f1: 'cyan', f2: 'magenta', expected: 'Blue', hint: 'Cyan passes G+B; Magenta passes R+B.' },
  { id: 'sf5', label: 'White Light → Yellow Filter → Blue Filter', f1: 'yellow', f2: 'blue', expected: 'Black', hint: 'Yellow absorbs Blue; Blue absorbs Red & Green.' },
  { id: 'sf6', label: 'White Light → Clear Glass → Green Filter', f1: 'none', f2: 'green', expected: 'Green', hint: 'Clear glass passes all wavelengths to the Green filter.' },
];

export interface PhenomenonMatchItem {
  id: string;
  phenomenon: string;
  correctMechanism: string;
}

export const PHENOMENON_MECHANISMS = [
  'Light leaves water into air, speeds up, and bends away from the normal',
  'Hot low-density air near sand refracts sky light gradually upwards',
  'Repeated Total Internal Reflection inside a high-index glass core',
  'Different wavelengths slow down by different amounts in a glass prism',
  'Curved glass converges parallel rays to focus at a single focal point',
  'Selective transmission of matching wavelengths and absorption of others',
];

export const PHENOMENON_ITEMS: PhenomenonMatchItem[] = [
  { id: 'pm1', phenomenon: 'Bent pencil & shallow pool illusion', correctMechanism: PHENOMENON_MECHANISMS[0] },
  { id: 'pm2', phenomenon: 'UAE summer desert water mirage', correctMechanism: PHENOMENON_MECHANISMS[1] },
  { id: 'pm3', phenomenon: 'High-speed fibre-optic internet cables', correctMechanism: PHENOMENON_MECHANISMS[2] },
  { id: 'pm4', phenomenon: '7-colour rainbow spectrum from white light', correctMechanism: PHENOMENON_MECHANISMS[3] },
  { id: 'pm5', phenomenon: 'Camera lens & human eye focusing on retina', correctMechanism: PHENOMENON_MECHANISMS[4] },
  { id: 'pm6', phenomenon: 'Garden gnome jacket looking black in red filter', correctMechanism: PHENOMENON_MECHANISMS[5] },
];
