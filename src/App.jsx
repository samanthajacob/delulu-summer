import { useState, useRef, useEffect } from "react";

// ── Fonts (Avenir native on Apple, Nunito Sans fallback elsewhere) ────────
if (!document.getElementById("delulu-fonts")) {
  const l = document.createElement("link");
  l.id = "delulu-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

// ── Northwest Pool (official 2026) ────────────────────────────────────────
const POOL_HOURS = { 0:"1–4 PM", 1:"1–4 PM (lunch: 3–4 PM)", 2:"1–4 PM (lunch: 3–4 PM)", 3:"1–4 PM (lunch: 3–4 PM)", 4:"1–4 PM (lunch: 3–4 PM)", 5:"1–4 PM  ·  7–9 PM", 6:null };
const POOL_OPENS = "2026-05-30";

// ── Wednesday color walks ─────────────────────────────────────────────────
const COLOR_WALKS = {
  "2026-06-10":"Red", "2026-06-17":"Yellow", "2026-06-24":"Green",
  "2026-07-01":"Blue", "2026-07-08":"Purple", "2026-07-15":"Orange",
  "2026-08-12":"Pink", "2026-08-19":"White", "2026-08-26":"Brown", "2026-09-02":"Your Favorite",
};

// ── Markets ───────────────────────────────────────────────────────────────
const MARKETS = {
  2: { name:"Gulfport Tuesday Market", note:"Beach Blvd S · 9am–2pm · produce, crafts, live music" },
  6: { name:"Williams Park Summer Market", note:"Williams Park · 9am–1pm · 170+ vendors, dog-friendly" },
  0: { name:"Corey Ave Sunday Market", note:"Corey Ave, St. Pete Beach · 9am–1pm · coffee, pastries, crafts" },
};

// ── Real confirmed events ─────────────────────────────────────────────────
const REAL_EVENTS = {
  "2026-07-04": { name:"4th of July Fireworks + Annual Sleepover", note:"Hosting friends tonight! 🎉 Vinoy Park fireworks at dusk — get there early for the waterfront spot." },
  "2026-07-11": { name:"Ice Cream Festival", note:"St. Pete Pier · National Ice Cream Day · local vendors + live music" },
  "2026-08-29": { name:"GeckoFest", note:"Gulfport Beach Blvd · 10am–10pm · 200+ vendors, costume parade, free" },
};

// ── First Fridays ────────────────────────────────────────────────────────
const FIRST_FRIDAYS = {
  "2026-06-05": { place:"Bodega", note:"2044 Central Ave · Cuban sandwiches, craft beer, cool courtyard. The one everyone keeps telling you about.", url:"https://www.bodegastpete.com/" },
  "2026-07-03": { place:"Kahwa Coffee", note:"204 2nd Ave NE · Locally roasted, tucked behind downtown. A St. Pete institution. Don't leave without a cortado.", url:"https://kahwacoffee.com/" },
  "2026-08-07": { place:"Locale Market", note:"179 2nd Ave N · Local vendors, butcher counter, oyster bar. This is the one you take out-of-towners to.", url:"https://www.localestpete.com/" },
  "2026-09-04": { place:"The Chattaway", note:"358 22nd Ave S · Cash only, thatched roof, fish tacos since 1946. Feels like a secret even though everyone knows it.", url:"https://thechattaway.com/" },
};

const FF_PROMPTS = [
  "would you return? be honest. the algorithm is watching.",
  "rate the vibe on a scale of 'fine i guess' to 'i'm telling everyone'.",
  "what did you order and would you defend it in court?",
  "describe the energy in three words. no cop-outs like 'chill' or 'nice'.",
  "did it live up to the hype? (there was hype. there's always hype.)",
];

// ── Teresa ────────────────────────────────────────────────────────────────
const TERESA = new Set(["2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13"]);

// ── Travel ────────────────────────────────────────────────────────────────
const isTraveling = k =>
  (k >= "2026-06-26" && k <= "2026-06-29") ||
  (k >= "2026-07-24" && k <= "2026-08-08");

// ── Week theme (shown ONLY on Monday, as a banner) ────────────────────────
const WEEK_THEMES = {
  "2026-06-08":"🎉 Kick Off Party!",
  "2026-06-15":"🌿 Slow Living",
  "2026-06-22":"🎨 Arts Week",
  "2026-06-29":"🚗 Road Trip Week",
  "2026-07-06":"💦 Water Week",
  "2026-07-13":"👯 Teresa Visit",
  "2026-07-20":"✂️ Make & Create",
  "2026-07-27":"🇬🇧 UK Adventure",
  "2026-08-03":"🇬🇧 UK Adventure",
  "2026-08-10":"🇬🇧 UK Adventure",
  "2026-08-17":"☀️ Re-Entry",
  "2026-08-24":"🌊 Late Summer",
  "2026-08-31":"🎉 Festival Finale",
  "2026-09-07":"🏕️ Labor Day",
};

// ── Every day has a unique note ───────────────────────────────────────────
// Weekdays = after-work / evening activities. Sat/Sun = outings.
// trip:true = Saturday or Sunday only (verified).
const DAYS = {
  // JUNE WEEK 1
  "2026-06-04": { e:"🍹", h:"Open Season", n:"Kick off Delulu Summer the right way — stock your favorite drinks, pull out a board game or a deck of cards, and make tonight a proper at-home celebration.\n\nWrite your summer bucket list too: 10 specific things before Labor Day. Post it on the fridge so you'll see it every morning.", m:"This is the summer everything I've been dreaming about becomes real." },
  "2026-06-05": { e:"🪀", h:"Pogo Stick Season Opener", n:"Get the pogo stick out tonight. No context needed. Also: scope a new coffee shop in Grand Central or Kenwood you've been meaning to try. Sit in it like you belong there.", m:"I move through the world like someone who has exactly what they need." },
  "2026-06-06": { e:"🏛️", h:"Five Thousand Years for Lunch", n:"[[Museum of Fine Arts|https://www.fine-arts.org]] — 255 Beach Dr NE. French Impressionism, Georgia O'Keeffe, ancient Greek works, 20,000+ pieces across 5,000 years. Pair with lunch on Beach Drive after. Take your time in every room.", m:"Beauty finds me everywhere I go.", trip:true },
  "2026-06-07": { e:"🐕", h:"The Dog Park at the Bay", n:"[[North Shore Dog Park|https://www.stpeteparksrec.org/parks___facilities/dog_parks.php]] — 901 N Shore Dr NE, right on the Tampa Bay waterfront. Off-leash, fenced, separate large and small dog areas, rinse station. Your pup deserves a morning out too. Stay for the waterfront walk after.", m:"I am exactly where I am supposed to be.", trip:true },
  "2026-06-08": { e:"🗓️", h:"Kick Off Party Week", n:"Tonight: walk Central Ave after dinner. Browse gallery windows, grab a scoop at a local spot, and let yourself feel like a local — because you are.", m:"Every version of my life that led here was worth it." },
  "2026-06-09": { e:"🏊", h:"Lunch at the Pool", n:"Northwest Pool opens for summer! Swim on your lunch break — 3–4 PM, $2. Flume slide, diving boards, real cold water. A $2 afternoon reset is one of summer's best small luxuries.", m:"I deserve every small luxury Florida has to offer." },
  "2026-06-10": { e:"🌈", h:"See Red (Literally)", n:"Color walk: photograph everything red in your neighborhood. Your dog counts, the mailbox counts — the more unexpected the find, the better.", m:"I notice magic in ordinary things." },
  // JUNE WEEK 2
  "2026-06-11": { e:"🌸", h:"Padmé U-Pick Tonight!", n:"[[Padmé Flower Farm|https://www.padmeflowerfarm.com]] U-Pick — tonight 4:30–6:30 PM at 22nd St & 3rd Ave S, Warehouse Arts District. You have tickets — this is it. Grown by hand, pesticide-free, right here in St. Pete. Bring a jar.", m:"I find beauty growing in the most unexpected places." },
  "2026-06-12": { e:"🎳", h:"Friday Night Strikes", n:"Bowling night! Sunrise Lanes (6720 54th Ave N) is the classic local option right in St. Pete. Or try Ten Pin Lanes nearby. Shoes on, no skills required, good food at the bar. This is summer.", m:"I romanticize my actual life, not a hypothetical one." },
  "2026-06-13": { e:"🏖️", h:"Best Beach in the Country", n:"[[Fort De Soto|https://www.pinellascounty.org/park/05_ft_desoto.htm]] — one of the best beaches in the US, 30 minutes away. Shell Key swim, nature trail, dog-friendly throughout. Go early before it gets hot. Bring snacks, stay all morning.", m:"I live somewhere people save up to visit.", trip:true },
  "2026-06-14": { e:"☕", h:"Gulfport Sunday", n:"Gulfport village wander — 15 minutes south, completely different energy. Waterfront arts district, galleries, colorful docks, good brunch. Stay longer than you plan to. Find a bookshop or a vintage spot.", m:"Wandering is not wasting time. It's how I find things.", trip:true },
  "2026-06-15": { e:"📚", h:"Comedy + Craft Night", n:"Slow Living week intention check: tonight, pull up a comedy special and sew something at the same time. Ali Wong's Baby Cobra, Nate Bargatze's Greatest Average American, or John Mulaney's Kid Gorgeous — pick your mood.", m:"I know how to make an ordinary Tuesday feel like a gift." },
  "2026-06-16": { e:"🧵", h:"Make Something for No Reason", n:"Free sew night — no goal, no deadline, no pressure. Pull out fabric you love and just make something. Podcast or audiobook on. This is the creative version of a bath.", m:"My hands know things my brain doesn't." },
  "2026-06-17": { e:"🌈", h:"Follow the Yellow", n:"Color walk: find and photograph everything yellow. Flowers, signs, doors, cars, citrus. Nothing too expected. The challenge is the point.", m:"There is more beauty in my neighborhood than I've noticed yet." },
  // JUNE WEEK 3 – Arts
  "2026-06-18": { e:"🎨", h:"The Open-Air Gallery", n:"Arts week. Tonight: walk the SHINE murals around Central Ave and the Warehouse Arts District at golden hour. Download the map at stpetecatalyst.com. Bring your camera and take your time.", m:"I live in one of the most art-saturated cities in the country." },
  "2026-06-19": { e:"🕊️", h:"Spend Where It Matters", n:"Juneteenth — support a Black-owned St. Pete business today. [[Green Bench Brewing|https://www.greenbenchbrewing.com]] (1133 Baum Ave N, co-founded by Black head brewer Khris Johnson) is right in the neighborhood. Or try [[Copa|https://www.copastpete.com]] (1047 Central Ave) for Caribbean-fusion dinner, or find [[Cultured Books|https://www.culturedbooks.com]] — a Black-owned pop-up bookstore celebrating diverse stories. Full guide: [[visitstpeteclearwater.com|https://www.visitstpeteclearwater.com/article/black-owned-businesses]]", m:"How I spend my money is how I vote for the world I want." },
  "2026-06-20": { e:"🏺", h:"The Only One of Its Kind in the World", n:"[[Museum of the American Arts & Crafts Movement|https://www.museumaacm.org]] — 355 4th St N. The only museum in the world dedicated exclusively to the Arts & Crafts movement. Frank Lloyd Wright, Gustav Stickley, Newcomb Pottery — five floors of extraordinary work with a stunning spiral staircase. Grab the free docent tour at 11am.", m:"I seek out beauty that surprises me.", trip:true },
  "2026-06-21": { e:"🌞", h:"The Longest Day", n:"Summer Solstice. Sunset at the St. Pete Pier or North Shore Park — this is the most daylight you get all year. Blanket, something cold to drink, no agenda. Watch the whole thing.", m:"I make time for the things that don't take long but mean everything.", trip:true },
  "2026-06-22": { e:"🖼️", h:"Golden Hour and Good Walls", n:"Evening mural walk in the Warehouse Arts District or Grand Central — quieter on a weeknight, the light is better, and the murals are less crowded. Bring your camera. Pick a direction and walk.", m:"I am the kind of person who pays attention." },
  "2026-06-23": { e:"🌿", h:"Facial at the Bungalow", n:"[[Beauty Bungalow|https://www.beautybungalowspa.com]] — 1717 Dr. MLK Jr St N, tonight at 7 PM. Holistic facial in an iconic 1920s bungalow. Arrive early to savor their signature beauty tea before your service. You absolutely deserve this.", m:"I know how to end a week on a high note." },
  "2026-06-24": { e:"🌈", h:"Fifty Shades of Green", n:"Color walk: find every shade of green — leaves, tiles, painted doors, sea glass, moss. Subtler finds make better photos. This city has more green than it gets credit for.", m:"I have trained my eyes to see what others miss." },
  // JUNE WEEK 4
  "2026-06-25": { e:"✨", h:"Live Glassblowing and Good Vibes", n:"[[Chihuly Collection|https://moreanartscenter.org/chihuly]] + [[Morean Arts|https://moreanartscenter.org]] glassblowing demo — 400 Beach Dr. Glass sculpture unlike anything else in St. Pete, then a live demo across the street. Combo ticket. One of the best afternoons this city offers.", m:"I invest in experiences that live in my memory.", trip:true },
  "2026-06-26": { e:"🎨", h:"Creative Mornings, Then the Road", n:"[[Creative Mornings at FloridaRAMA|https://www.floridarama.art]] — 2606 Fairfield Ave S, 8:30–10am (free, ticketed). Community creative breakfast event in an immersive art space. You're out by 10, on the road to Port St. Lucie by 10:30. Best possible way to start a road trip Friday.", m:"I am always traveling toward something good." },
  "2026-06-27": { e:"🌴", h:"Away", n:"PSL Day 2. You're away from home and that's the whole point. Note one thing you want to remember about this trip.", m:"I deserve rest, adventure, and everything in between." },
  "2026-06-28": { e:"🌴", h:"Still Away", n:"PSL Day 3. Slow it all the way down. What's the best thing about this trip?", m:"I am someone who takes trips and feels the full benefit of them." },
  "2026-06-29": { e:"🏡", h:"The Drive Home", n:"Drive home to St. Pete. Good playlist, good snacks. Notice how happy you are to see your neighborhood.", m:"Home is one of my favorite places in the world." },
  "2026-06-30": { e:"🛁", h:"Sanctioned Recovery", n:"Unpack slowly, do laundry. Tonight: order from somewhere local you haven't tried — Bodega on Central Ave (Cuban), Meze 119 (Mediterranean), or Baba (Asian fusion on 1st Ave N). Nothing is required of you but eating well.", m:"I give myself permission to do exactly as much as I can." },
  // JULY WEEK 1 – Water Week
  "2026-07-01": { e:"🌈", h:"All the Blues", n:"Color walk: every shade of blue. Sky, water, tile, painted shutters, glass, signage. This city has an unreasonable amount of blue in it.", m:"Noticing is a form of gratitude." },
  "2026-07-02": { e:"🏊", h:"Midweek Dip", n:"Swim at your lunch break — Northwest Pool 3–4 PM, $2. A midday pool reset is one of the great small luxuries of living in Florida. Return to your afternoon completely reset.", m:"My lunch breaks can be extraordinary." },
  "2026-07-03": { e:"🎨", h:"Unstructured Marks + Local Coffee", n:"Sketch something before the holiday weekend — 20 minutes, no judgment, no erasing. Do it at Kahwa Coffee (680 Central Ave) or Bandit Coffee (2662 Central Ave) for the atmosphere. Design brains need unstructured mark-making time.", m:"I am creative even when I'm not producing anything." },
  "2026-07-04": { e:"🎆", h:"Annual Sleepover Party!", n:"Hosting friends for the annual 4th of July sleepover! Stock the fridge, set up the good vibes, and plan the Vinoy Park fireworks run. Fireworks at dusk — the waterfront reflection off the bay is worth fighting for a spot. Bring a blanket for everyone.", m:"I live in a place that knows how to celebrate.", trip:true },
  "2026-07-05": { e:"🐕", h:"Post-Fireworks Dog Morning", n:"[[North Shore Dog Park|https://www.stpeteparksrec.org/parks___facilities/dog_parks.php]] after the 4th — 901 N Shore Dr NE. Off-leash waterfront park, rinse station, separate big and small dog areas. Great way to spend a slow holiday Sunday morning.", m:"The best days start before the crowds.", trip:true },
  "2026-07-06": { e:"💦", h:"Water Week, Day 1", n:"Every outing this week involves water. Tonight: walk to Coffee Pot Bayou at sunset. Watch for roseate spoonbills — they're a shocking, impossible pink and turn up there regularly.", m:"I am paying attention to everything." },
  "2026-07-07": { e:"🏡", h:"Home Project Tuesday", n:"Pick one small home project you've been putting off — hang a print, swap out a throw, research a piece of furniture, or style a shelf. An hour of intentional home attention changes a space.", m:"I make time for the things that make me feel alive." },
  // JULY WEEK 2 – Teresa
  "2026-07-08": { e:"🌈", h:"The Purple Hunt", n:"Color walk: find every shade of purple — bougainvillea, murals, shadows, painted gates, jacaranda. Do it before Teresa arrives tomorrow. Lunch break or walk home a different way.", m:"I find things when I'm actually looking." },
  "2026-07-09": { e:"👯", h:"Teresa Has Arrived", n:"Pick Teresa up at TPA at 4:30 PM — she's here! Bring her straight into downtown St. Pete. First stop: [[Wildflower Ice Cream|https://www.wildflowericecreamshop.com]] (2603 MLK St N, open til 9 PM) — New Zealand-style real-fruit soft serve, family-owned, completely St. Pete. Then: walk Beach Drive, show her the waterfront and the Pier at golden hour. Easy dinner somewhere outside. She came to see your life. Show her.", m:"The people I love deserve the best version of where I live." },
  "2026-07-10": { e:"📖", h:"Books, Wine, and the Good Stuff", n:"Morning at [[Book + Bottle|https://www.bookandbottlestpete.com]] (17 6th St N, open 10am–9pm) — a bookstore and wine bar in one, with the best staff in downtown St. Pete. Browse, sip coffee or wine, stay as long as you want. Then swing by [[The Book Lounge|https://www.thebooklounge.com]] (631 Central Ave) — mother-daughter-run, three rooms of curated books, wine, coffee, and comfy couches. Afternoon: take Teresa to Gulfport. Evening: [[Cococello|https://www.cococello.com]] on Central — coconut ice cream served in an actual coconut, topped with fresh tropical fruit. It will change her life.", m:"Hospitality is a love language." },
  "2026-07-11": { e:"🍦", h:"Ice Cream Festival + The Best of St. Pete", n:"Morning: [[Museum of the American Arts & Crafts Movement|https://www.museumaacm.org]] — five floors, free docent tour at 11am, Teresa will love the furniture and craftsmanship. Afternoon: Ice Cream Festival at the St. Pete Pier — National Ice Cream Day, local vendors, live music, waterfront. This is the most St. Pete day possible. Evening: walk the SHINE murals.", m:"Some things are exactly as good as they sound.", trip:true },
  "2026-07-12": { e:"🚣", h:"Mangroves and One Last Wander", n:"Morning: [[Sweetwater Kayaks|https://www.sweetwaterkayaks.com]] at Coffee Pot Bayou — paddle through the mangroves before the heat. She will lose her mind over the roseate spoonbills. After: [[The Book Lounge|https://www.thebooklounge.com]] (631 Central Ave) — mother-daughter-run, three rooms of books, wine, games, comfy couches. Buy each other one book. Then: last dinner out somewhere you both love.", m:"I curate extraordinary experiences for the people I love.", trip:true },
  "2026-07-13": { e:"👋", h:"See You Soon", n:"Last morning — long breakfast at somewhere you both loved this week. One final walk. Then drop her at TPA. Drive home with the windows down and the music loud. You gave her a great trip.", m:"I know how to hold on to a feeling." },
  "2026-07-14": { e:"✍️", h:"Capture It While It's Fresh", n:"Write about the Teresa visit — best meal, funniest moment, something she said that stuck. 15 minutes. You'll be glad you have it in six months.", m:"Memory is something I actively tend." },
  // JULY WEEK 3 – Make & Create
  "2026-07-15": { e:"🌈", h:"Everything Orange", n:"Color walk: find everything orange — citrus, bougainvillea, sunsets, construction equipment, doors. Florida orange is its own specific, saturated shade.", m:"This city keeps giving me things to photograph." },
  "2026-07-16": { e:"💆", h:"Massage Thursday", n:"Book a massage this week — you've been carrying things. [[Cortiva Institute Spa|https://www.cortiva.edu/locations/florida/st-pete]] offers affordable massages from supervised student therapists, or try one of the wellness spas along 4th St N. Your body deserves an hour of full attention.", m:"Beginning is the hardest part and I do it anyway." },
  "2026-07-17": { e:"🧵", h:"Mise en Place", n:"Cut and prep your fabric. Audiobook or podcast on in the background. This is the mise en place of making and it matters more than people realize.", m:"I take the process as seriously as the outcome." },
  "2026-07-18": { e:"🕹️", h:"Insert Coin", n:"[[The Potion Portal|https://www.thepotionportal.com]] Bar & Game Room (downtown St. Pete) — retro and modern arcade, board games, beer and wine, smoke-free, air conditioned. Exactly right for a Saturday afternoon in July.", m:"I play. Grown adults are allowed to play.", trip:true },
  "2026-07-19": { e:"🌿", h:"The Preserve You Keep Driving Past", n:"[[Boyd Hill Nature Preserve|https://www.stpeteparksrec.org/parks___facilities/boyd_hill.php]] — 1101 Country Club Way S, $3. 400 acres of wild Florida in the middle of the city: gopher tortoises, alligators, marsh rabbits, 6 miles of boardwalk trails through five distinct ecosystems, and a bird of prey aviary. Open until 7pm Tue–Sun. Pack water — the heat is real.", m:"The best things don't always announce themselves.", trip:true },
  "2026-07-20": { e:"✂️", h:"Make Week Is Halfway Done", n:"Full sewing session tonight. No half-measures, no distractions. Put everything else away. This is the week you actually finish something.", m:"I follow through. That is one of my qualities." },
  "2026-07-21": { e:"🧵", h:"Finish It", n:"Finish whatever you started this week. Wear it, use it, photograph it. The satisfaction of completing a handmade thing is genuinely hard to replicate.", m:"I am someone who makes things and finishes them." },
  // UK COUNTDOWN
  "2026-07-22": { e:"🧳", h:"Pre-Trip Admin", n:"UK prep: finalize your itinerary, research one great restaurant per city, download offline maps on Google Maps, charge everything, and make a packing list tonight. You're almost there.", m:"I prepare well because I know how to take care of myself." },
  "2026-07-23": { e:"🧳", h:"Everything is Ready", n:"Final pack. Set your out-of-office. Lay out your travel outfit. Get to bed early. You are completely ready and this trip is going to be extraordinary.", m:"I trust myself completely when I travel." },
  // SCOTLAND – with your sister
  "2026-07-24": { e:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", h:"Scotland, Day 1", n:"You made it. You're here with your sister.", m:"Before you sleep: What was the first moment today that felt real — like you're actually here? What did your sister say or do that you want to remember?" },
  "2026-07-25": { e:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", h:"Scotland, Day 2", n:"A full day in Scotland with your person.", m:"Before you sleep: What's something your sister noticed or found funny today that you wouldn't have seen alone? What's a moment you'd tell someone about when you get home?" },
  "2026-07-26": { e:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", h:"Scotland, Day 3", n:"Somewhere in the middle of it now.", m:"Before you sleep: Where did you go today that surprised you? What did you two talk about that felt important — even if you weren't trying to be deep?" },
  "2026-07-27": { e:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", h:"Scotland, Day 4", n:"Last full day in Scotland together.", m:"Before you sleep: What will you miss about being here? What does this trip remind you of about your sister that you forget to appreciate in ordinary life?" },
  // WALES – with family
  "2026-07-28": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 1", n:"A new country. Now family around you.", m:"Before you sleep: Who said something today that made you feel at home even somewhere unfamiliar? What does it feel like to have everyone together like this?" },
  "2026-07-29": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 2", n:"Settling in with family.", m:"Before you sleep: What moment today — a meal, a walk, a laugh — felt like the kind of thing you'll be nostalgic for years from now? Who did you see a side of today that you don't always get to see?" },
  "2026-07-30": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 3", n:"Family everywhere.", m:"Before you sleep: What did you notice about yourself today — how you fit into this group, what you bring, what you feel? What does Wales look like through their eyes?" },
  "2026-07-31": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 4", n:"Halfway through the trip.", m:"Before you sleep: What's a quiet ordinary moment from today — not a highlight — that you want to hold onto? What do you want to tell people about this trip when you're back home?" },
  "2026-08-01": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 5", n:"More time together.", m:"Before you sleep: Is there someone on this trip you've gotten to know differently? What have you learned about your family just by watching them be somewhere new?" },
  "2026-08-02": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 6", n:"Still here. Still all together.", m:"Before you sleep: What's the thing you're already looking forward to telling someone at home? What's the feeling of this place that you're not sure you can describe but want to try?" },
  "2026-08-03": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 7", n:"One more week to go.", m:"Before you sleep: Where did you go today that felt like it couldn't exist anywhere else? What's something a family member said or did that you want to write down before you forget it?" },
  "2026-08-04": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 8", n:"Deep in it now.", m:"Before you sleep: What does it feel like to be unhurried for this many days? What part of this — the landscape, the people, the pace — do you most want to bring home with you?" },
  "2026-08-05": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 9", n:"Getting close to the end.", m:"Before you sleep: Who have you been closest to on this trip? What's a conversation or a shared silence that mattered more than it would have at home?" },
  "2026-08-06": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 10", n:"Almost time to go home.", m:"Before you sleep: What are you going to miss most — the place, or the particular version of your family that only exists when you're all here together? What do you want to remember exactly as it is right now?" },
  "2026-08-07": { e:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", h:"Wales, Day 11", n:"Final night. Last sleep before the journey home.", m:"Before you sleep: Look at where you are and who is here. What is the feeling of this exact moment? Write one sentence in your head that describes it — not for anyone else, just for you." },
  "2026-08-08": { e:"✈️", h:"Homeward", n:"Fly home. You'll sleep so well in your own bed tonight. St. Pete is going to look beautiful.", m:"I come home from trips more myself than I left." },
  // AUG – RE-ENTRY
  "2026-08-09": { e:"🛁", h:"Jet Lag Recovery Day", n:"You're home. That's enough. Unpack slowly, nap without guilt, eat something comforting, and let your body believe it's back in Florida. Don't plan anything. Order from somewhere local and watch something easy tonight.", m:"I return to my life with fresh eyes every time." },
  "2026-08-10": { e:"📸", h:"Capture Before It Fades", n:"Sort UK photos while memories are vivid — pick your top 20. Then: return to your favorite local coffee spot. If you haven't been to Intermezzo Coffee (1133 Baum Ave N) yet, today is the day. Let the routine feel like a luxury.", m:"Ordinary life is extraordinary when I pay attention." },
  "2026-08-11": { e:"🎨", h:"Maker Monday at FloridaRAMA", n:"[[FloridaRAMA|https://www.floridarama.art]] on 2606 Fairfield Ave S is running Maker Mondays this summer — local artists, hands-on workshops, interactive art space. Check their site for this week's session. One block from the bike trail, 5 minutes from downtown.", m:"I find magic in my own city." },
  "2026-08-12": { e:"🌈", h:"The Pink Hunt", n:"Color walk: find everything pink. Bougainvillea is everywhere right now. Murals, doors, flamingos, crepe myrtle. August pink is its own specific mood.", m:"This city gives me gifts if I go looking for them." },
  "2026-08-13": { e:"✍️", h:"Write the UK Down", n:"Write about the trip while the details are still vivid — the best meal, the most unexpected moment, the thing that surprised you most. Don't let it fade into general memory.", m:"I hold my experiences close and tend them like something precious." },
  "2026-08-14": { e:"😂", h:"Fully Earned Mindless Friday", n:"Stand-up special, no thinking required. John Mulaney's Kid Gorgeous, Bo Burnham's Inside, or Mike Birbiglia's The New One. Pick your mood. This is the correct use of a Friday night after travel recovery week.", m:"Rest looks different every day and all of it counts." },
  "2026-08-15": { e:"🏝️", h:"Honeymoon Island", n:"[[Honeymoon Island|https://www.floridastateparks.org/honeymoon-island]] — pristine Gulf beach 45 minutes north, real nature trail, consistently beautiful water. Dog-friendly, quieter than the city beaches. Go early, take the trail, then the water.", m:"I support the arts in my own city.", trip:true },
  "2026-08-16": { e:"🐕", h:"Waterfront Dog Morning", n:"[[North Shore Dog Park|https://www.stpeteparksrec.org/parks___facilities/dog_parks.php]] — 901 N Shore Dr NE. Off-leash fenced park on the Tampa Bay waterfront. Rinse station, shade, separate small and large dog sections. Stay for the walk along the shoreline after.", m:"I choose the unhurried version whenever I can.", trip:true },
  // LATE SUMMER
  "2026-08-17": { e:"🌊", h:"Late Summer Awareness", n:"Florida in August is at its most saturated — the air, the greens, the afternoon light. Go outside tonight for even 10 minutes. Walk the block and actually pay attention to what summer feels like at the end.", m:"I am nostalgic for things while they're still happening." },
  "2026-08-18": { e:"🧵", h:"Sewing in the Storm", n:"Florida afternoon storm incoming — this is peak sewing weather. Something with good storytelling on in the background, watch the rain out the window, make something with your hands.", m:"I turn every kind of weather into the right conditions." },
  "2026-08-19": { e:"🌈", h:"Find the White", n:"Color walk: find white — architecture, egrets, shells, clouds, white bougainvillea, herons. Trickier than it sounds, and better for it.", m:"I rise to the challenge of the subtle." },
  "2026-08-20": { e:"🦅", h:"Sunrise at the Preserve", n:"Weedon Island Preserve at sunrise — binoculars, coffee, bug spray. Roseate spoonbills, ospreys, great blue herons. The most peaceful 45 minutes of the entire summer.", m:"I make time for the mornings that change my day." },
  "2026-08-21": { e:"🏊", h:"End the Week in the Water", n:"Friday evening pool swim at Northwest Pool — 7–9 PM, $2. Swimming in the Florida evening in August is one of the most pleasant things a person can do.", m:"I know exactly how to finish a week." },
  "2026-08-22": { e:"🏺", h:"Arts & Crafts Saturday", n:"[[Museum of the American Arts & Crafts Movement|https://www.museumaacm.org]] — 355 4th St N. If you didn't make it in June, now's the time. Five floors, docent tours free with admission, café on-site. Take the full morning.", m:"Returning somewhere deepens the love for it.", trip:true },
  "2026-08-23": { e:"🏖️", h:"Pass-a-Grille", n:"The quietest, most genuinely beautiful stretch of beach in the St. Pete area — old Florida architecture, no big resorts, a real neighborhood feeling. 8th Ave and the Gulf. Walk to Murdock's Bistro or the Hurricane for lunch. Dog-friendly on most stretches.", m:"I live in a place people dream of visiting.", trip:true },
  // FESTIVAL FINALE
  "2026-08-24": { e:"🎉", h:"Last Full Week", n:"Look at your bucket list right now — anything still undone? Pick one thing and commit to it this week. Text a friend, make a reservation, say yes to something.", m:"I finish what I start and I start what matters." },
  "2026-08-25": { e:"🎙️", h:"The Neighborhood You Haven't Walked Yet", n:"Podcast walk through Kenwood bungalows, Old Northeast, or Crescent Lake. Find one local spot — a boutique, a café, a plant shop — that you want to come back to. End at The Craft Kafe (art supply + coffee on 9th St N) if you're in the area.", m:"There is always more to discover exactly where I am." },
  "2026-08-26": { e:"🌈", h:"Warm Tones", n:"Color walk: find warmth in brown — wood grain, bark, coffee cups, brick, straw, earth. Autumn is quietly arriving even in Florida.", m:"I find the season even when the season is subtle." },
  "2026-08-27": { e:"🏺", h:"Make Something at Morean", n:"[[Morean Arts Center|https://moreanartscenter.org]] on Central Ave — drop-in clay or painting class on a Thursday evening. No experience needed. Making something with your hands at the end of summer is exactly right.", m:"My home is a place I'm always making more beautiful." },
  "2026-08-28": { e:"🎳", h:"One More Strike Before Summer Ends", n:"Bowling for the last summer Friday — Sunrise Lanes (6720 54th Ave N) or Splitsville at Sparkman Wharf in Tampa for the fancier night out. Order the nachos. Don't keep score seriously.", m:"Joy requires no justification." },
  "2026-08-29": { e:"🦎", h:"GeckoFest", n:"[[GeckoFest|https://gulfportflorida.us/geckofest]] in Gulfport — Beach Blvd, 10am–10pm, free admission, 25th year. 200+ vendors, live music, costume parade, pure Gulfport energy. 15 minutes from your door.", m:"I show up for my community.", trip:true },
  "2026-08-30": { e:"⛸️", h:"Skates on the Waterfront", n:"Rollerblade the waterfront loop — Vinoy Park to North Shore and back is one of the best paved paths in St. Pete, right on Tampa Bay. Dust yours off or rent a pair. Wind in your face, bay to your left, summer almost over.", m:"I end things the same way I want to begin them.", trip:true },
  // LABOR DAY
  "2026-08-31": { e:"🎉", h:"Final Stretch", n:"Text someone you haven't seen all summer and make a plan this week — even just coffee. Make it happen before the season officially closes.", m:"I reach toward the people I love." },
  "2026-09-01": { e:"✍️", h:"The Summer in Review", n:"Write 10 specific things you loved about this summer — not general, specific moments, meals, views, conversations. Review your bucket list. Feel the wins.", m:"This summer was one of the good ones. I know it because I was paying attention." },
  "2026-09-02": { e:"🌈", h:"Your Favorite Color", n:"Final color walk — choose any color you love and find it absolutely everywhere. Make this one count.", m:"I save some of the best things for last." },
  "2026-09-03": { e:"🍽️", h:"The End-of-Summer Dinner", n:"Reserve the nicest dinner you've had in St. Pete yet. Research it properly, dress up, arrive on time. You have completely earned a proper end-of-summer meal.", m:"I celebrate myself and my seasons." },
  "2026-09-04": { e:"🎬", h:"The Saved Film", n:"Something you've been saving for the right moment — a film, a show, a documentary you've been putting off. Tonight is the right moment. Full screen, great snacks, phone away.", m:"I know when a moment has arrived and I take it." },
  "2026-09-05": { e:"🏖️", h:"One Last Full Day", n:"Madeira Beach — [[John's Pass Village|https://www.johnspass.com]] on the Gulf side has a great boardwalk, local seafood, and a completely different vibe from Fort De Soto. Rent a beach chair, eat something fried, stay til sunset. Dog-friendly.", m:"I have lived this summer completely.", trip:true },
  "2026-09-06": { e:"🎉", h:"Last Day of Delulu Summer", n:"Labor Day 🎉 You made it through an extraordinary summer. Class of 2026. See you next year.", m:"I came, I saw, I romanticized everything.", trip:true },
  "2026-09-07": { e:"🍂", h:"Hello, Fall", n:"Start your fall list. Summer set the bar impossibly high and that's exactly as it should be.", m:"Every season I enter is my favorite season." },
};

// ── Similar-to-Padmé local picks (Thursdays + alt activities) ────────────
// Padmé: Thursdays 4:30–6:30 PM at 22nd St & 3rd Ave S, Warehouse Arts District
// These rotate onto Thursday slots through summer
const PADME_ADJACENT = [
  { icon:"🌸", name:"Padmé Flower Farm U-Pick", note:"22nd St & 3rd Ave S, Warehouse Arts District · Thursdays 4:30–6:30 PM · Reserve: padmeflowerfarm.com" },
  { icon:"🎨", name:"Morean Arts Center workshop", note:"719 Central Ave · Drop-in classes in glass, clay, or painting · moreanartscenter.org" },
  { icon:"🌿", name:"Boyd Hill Nature Walk", note:"1101 Country Club Way S · Free after 5 PM some evenings · Boardwalk trails + wildlife" },
  { icon:"🪴", name:"Green Bench plant market", note:"Check local Instagram for pop-up plant markets in Grand Central and Kenwood neighborhoods" },
  { icon:"🎭", name:"Mezzo Market pop-up", note:"1133 Baum Ave N (Intermezzo) · Vintage, handmade, art, boutique clothing · mezzomarket.co for dates", url:"https://mezzomarket.co" },
];

// ── Build calendar ────────────────────────────────────────────────────────
const buildCalendar = () => {
  const all = [];
  const start = new Date("2026-06-04T12:00:00");
  const end = new Date("2026-09-07T12:00:00");
  let cur = new Date(start);

  while (cur <= end) {
    const key = cur.toISOString().split("T")[0];
    const dow = cur.getDay(); // 0=Sun 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const trav = isTraveling(key);
    const base = DAYS[key] || {};
    const colorWalk = COLOR_WALKS[key] || null;
    const market = !trav ? MARKETS[dow] || null : null;
    const realEvent = REAL_EVENTS[key] || null;
    const isTeresa = TERESA.has(key);
    const weekTheme = WEEK_THEMES[key] || null; // only on Monday
    const isTrip = !!(base.trip && isWeekend);
    const poolHours = key >= POOL_OPENS && POOL_HOURS[dow] ? POOL_HOURS[dow] : null;

    // hasExtra: has a market, real event, or color walk addon
    const hasExtra = !!(market || realEvent || colorWalk);

    // Short label derived from first 5 words of note
    const note = base.n || (trav ? "You're away — enjoy every moment." : isWeekend ? "Explore St. Pete." : "Something good today.");
    const heading = base.h || "";
    const mantra = base.m || "";
    const shortWords = (heading || note).replace(/\n[\s\S]*/,"").split(/\s+/).slice(0,4).join(" ").replace(/[—·,\.]+$/,"");

    all.push({
      date: key, dateObj: new Date(cur), dow, isWeekend, trav,
      e: base.e || (isWeekend ? "🌟" : "✨"),
      note,
      heading,
      mantra,
      short: shortWords,
      colorWalk, market, realEvent, isTeresa, weekTheme, isTrip,
      hasExtra, poolHours,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return all;
};

const ALL_DAYS = buildCalendar();

// ── Pastel colors — just 3: outing (teal), activity (cream), travel (mist) ─
const dayStyle = (d) => {
  if (d.trav) return { bg:"#e8eaf4", border:"#b8bce0", text:"#2a2a48" };
  if (d.isTrip || d.realEvent) return { bg:"#dae5f8", border:"#8faee0", text:"#1a2a5a" };
  return { bg:"#fef6ea", border:"#f5d8b8", text:"#3a2a10" };
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW_L = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DOW_S = ["S","M","T","W","T","F","S"];

export default function DeluluSummer() {
  const byMonth = {};
  ALL_DAYS.forEach(d => {
    const m = d.dateObj.getMonth();
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(d);
  });
  const mKeys = Object.keys(byMonth).map(Number).sort((a,b)=>a-b);

  const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const todayISO = getTodayISO();
  const todayInCal = ALL_DAYS.find(d => d.date === todayISO);
  const initialDate = todayInCal ? todayISO : ALL_DAYS[0].date;
  const initialMonth = todayInCal ? todayInCal.dateObj.getMonth() : mKeys[0];
  const initialMIdx = Math.max(0, mKeys.indexOf(initialMonth));

  const [mIdx, setMIdx] = useState(initialMIdx);
  const [selDate, setSelDate] = useState(initialDate);
  const [journals, setJournals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('delulu-journals') || '{}'); }
    catch { return {}; }
  });
  const saveJournal = (date, text) => {
    const updated = { ...journals, [date]: text };
    setJournals(updated);
    try { localStorage.setItem('delulu-journals', JSON.stringify(updated)); } catch {}
  };

  // Advance focus state to new day at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const timer = setTimeout(() => {
      const newISO = getTodayISO();
      const newDay = ALL_DAYS.find(d => d.date === newISO);
      if (newDay) {
        setSelDate(newISO);
        setMIdx(Math.max(0, mKeys.indexOf(newDay.dateObj.getMonth())));
      }
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [selDate]);

  const activeMonth = mKeys[mIdx];
  const monthDays = byMonth[activeMonth] || [];
  const firstDow = monthDays[0]?.dow || 0;
  const sel = ALL_DAYS.find(d => d.date === selDate);
  const selIdx = ALL_DAYS.findIndex(d => d.date === selDate);
  const firstFriday = sel ? FIRST_FRIDAYS[sel.date] : null;
  const ffPrompt = sel ? FF_PROMPTS[sel.dateObj.getDate() % FF_PROMPTS.length] : '';
  const journalKey = sel ? sel.date : null;
  const journalText = journalKey ? (journals[journalKey] || '') : '';

  // Month swipe — track both X and Y to avoid triggering on scroll
  const calX = useRef(null);
  const calY = useRef(null);
  const [slideDir, setSlideDir] = useState(0); // -1 left, 1 right, 0 none
  const calTS = e => {
    calX.current = e.touches[0].clientX;
    calY.current = e.touches[0].clientY;
  };
  const calTE = e => {
    if (calX.current === null) return;
    const dx = e.changedTouches[0].clientX - calX.current;
    const dy = e.changedTouches[0].clientY - calY.current;
    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
      if (dx < 0 && mIdx < mKeys.length - 1) {
        setSlideDir(-1);
        setTimeout(() => { setMIdx(i => i + 1); setSlideDir(0); }, 10);
      }
      if (dx > 0 && mIdx > 0) {
        setSlideDir(1);
        setTimeout(() => { setMIdx(i => i - 1); setSlideDir(0); }, 10);
      }
    }
    calX.current = null;
    calY.current = null;
  };

  // Detail swipe
  const detX = useRef(null);
  const detTS = e => { detX.current = e.touches[0].clientX; };
  const detTE = e => {
    if (detX.current === null) return;
    const dx = e.changedTouches[0].clientX - detX.current;
    if (Math.abs(dx) > 40) {
      const next = selIdx + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < ALL_DAYS.length) setSelDate(ALL_DAYS[next].date);
    }
    detX.current = null;
  };

  const navDet = dir => {
    const n = selIdx + dir;
    if (n >= 0 && n < ALL_DAYS.length) setSelDate(ALL_DAYS[n].date);
  };

  const fmtDate = d => `${DOW_L[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

  return (
    <div style={{
      fontFamily:"'Avenir','Avenir Next','Nunito Sans','Helvetica Neue',Arial,sans-serif",
      background:"linear-gradient(155deg,#fdfaf5 0%,#f0f4fd 50%,#fdf8f0 100%)",
      minHeight:"100vh", padding:"18px 12px 48px", boxSizing:"border-box",
    }}>
      <div style={{ maxWidth:460, margin:"0 auto", width:"100%" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#6a6a8a" }}>
            June 4 – Labor Day · St. Pete, FL
          </p>
            <svg width="100%" viewBox="0 0 2057 239" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth:272, display:"block", margin:"0 auto" }}>
              <defs>
                <linearGradient id="lgOut" x1="-6.91785" y1="119.5" x2="2059.08" y2="119.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#96B9FF"/>
                  <stop offset="0.5" stopColor="#F19F9E"/>
                  <stop offset="1" stopColor="#FFD76F"/>
                </linearGradient>
              </defs>
              <path d="M1966.17 55.77H2056.75V95.316H2005.04V236.6H1966.17V55.77Z" fill="url(#lgOut)"/>
              <path d="M1948.21 159.874H1819.43C1824.16 182.858 1842.75 199.758 1864.72 199.758C1881.28 199.758 1895.82 190.294 1903.93 175.76H1944.83C1934.01 211.588 1902.24 237.614 1864.72 237.614C1818.08 237.614 1780.56 197.392 1780.56 148.044C1780.56 98.696 1818.08 58.474 1864.72 58.474C1902.24 58.474 1934.01 84.5 1944.83 120.328C1947.53 129.116 1948.88 138.242 1948.88 148.044C1948.88 152.1 1948.88 155.818 1948.21 159.874ZM1825.51 120.328H1903.93C1895.82 105.794 1881.28 96.33 1864.72 96.33C1848.16 96.33 1833.63 105.794 1825.51 120.328Z" fill="url(#lgOut)"/>
              <path d="M1702.37 55.77C1736.84 55.77 1764.9 83.824 1764.9 117.962V236.938H1725.35V117.962C1725.35 105.456 1714.87 95.316 1702.37 95.316C1689.86 95.316 1679.72 105.456 1679.72 117.962V236.938H1640.18V117.962C1640.18 105.456 1629.7 95.316 1617.19 95.316C1604.69 95.316 1594.55 105.456 1594.55 117.962V236.938H1555V117.962C1555 83.824 1582.72 55.77 1617.19 55.77C1633.75 55.77 1648.63 62.192 1659.78 72.67C1670.93 62.192 1686.14 55.77 1702.37 55.77Z" fill="url(#lgOut)"/>
              <path d="M1471.06 55.77C1505.54 55.77 1533.59 83.824 1533.59 117.962V236.938H1494.05V117.962C1494.05 105.456 1483.57 95.316 1471.06 95.316C1458.56 95.316 1448.42 105.456 1448.42 117.962V236.938H1408.87V117.962C1408.87 105.456 1398.39 95.316 1385.89 95.316C1373.38 95.316 1363.24 105.456 1363.24 117.962V236.938H1323.7V117.962C1323.7 83.824 1351.41 55.77 1385.89 55.77C1402.45 55.77 1417.32 62.192 1428.48 72.67C1439.63 62.192 1454.84 55.77 1471.06 55.77Z" fill="url(#lgOut)"/>
              <path d="M1265.07 56.108H1304.61V146.692C1304.61 196.378 1266.08 236.938 1219.44 236.938C1172.46 236.938 1134.26 196.378 1134.26 146.692V56.446H1173.47V146.692C1173.47 174.746 1194.09 197.73 1219.44 197.73C1244.45 197.73 1265.07 174.746 1265.07 146.692V56.108Z" fill="url(#lgOut)"/>
              <path d="M1118.85 179.816C1119.53 188.942 1116.15 202.8 1105 214.968C1095.53 224.77 1077.96 236.938 1046.86 236.938C1019.14 236.938 1002.24 225.784 993.118 216.658C981.288 204.49 974.528 187.59 974.866 170.014L1011.37 170.352C1011.37 174.07 1012.05 183.534 1019.14 190.97C1025.23 197.054 1034.69 200.096 1046.86 200.096C1066.13 200.096 1074.91 194.012 1078.97 188.942C1081.34 185.9 1080.32 181.168 1076.94 179.478C1068.15 174.746 1051.93 170.352 1042.13 167.31L1035.71 165.62C1003.93 156.156 974.866 143.312 974.866 110.864C974.528 99.034 980.274 86.866 990.076 77.064C1003.6 63.544 1023.2 56.446 1045.85 56.446H1046.18C1070.52 56.446 1089.45 63.544 1102.29 77.74C1117.16 94.64 1118.52 114.92 1118.18 123.37V127.764H1081.67V123.37C1081.67 123.37 1082.35 110.526 1074.58 102.076C1069.17 95.992 1059.37 92.95 1046.18 92.95H1045.85C1020.16 92.95 1014.07 107.146 1014.41 110.864C1015.09 114.582 1015.09 121.004 1045.85 130.13L1052.27 132.158C1082.69 140.946 1116.83 150.748 1118.85 179.816Z" fill="url(#lgOut)"/>
              <path d="M811.778 56.108H851.324V146.692C851.324 196.378 812.792 236.938 766.148 236.938C719.166 236.938 680.972 196.378 680.972 146.692V56.446H720.18V146.692C720.18 174.746 740.798 197.73 766.148 197.73C791.16 197.73 811.778 174.746 811.778 146.692V56.108Z" fill="url(#lgOut)"/>
              <path d="M659.612 236.938H620.742V0H659.612V236.938Z" fill="url(#lgOut)"/>
              <path d="M560.087 56.108H599.633V146.692C599.633 196.378 561.101 236.938 514.457 236.938C467.475 236.938 429.281 196.378 429.281 146.692V56.446H468.489V146.692C468.489 174.746 489.107 197.73 514.457 197.73C539.469 197.73 560.087 174.746 560.087 146.692V56.108Z" fill="url(#lgOut)"/>
              <path d="M407.921 236.938H369.051V0H407.921V236.938Z" fill="url(#lgOut)"/>
              <path d="M351.092 159.874H222.314C227.046 182.858 245.636 199.758 267.606 199.758C284.168 199.758 298.702 190.294 306.814 175.76H347.712C336.896 211.588 305.124 237.614 267.606 237.614C220.962 237.614 183.444 197.392 183.444 148.044C183.444 98.696 220.962 58.474 267.606 58.474C305.124 58.474 336.896 84.5 347.712 120.328C350.416 129.116 351.768 138.242 351.768 148.044C351.768 152.1 351.768 155.818 351.092 159.874ZM228.398 120.328H306.814C298.702 105.794 284.168 96.33 267.606 96.33C251.044 96.33 236.51 105.794 228.398 120.328Z" fill="url(#lgOut)"/>
              <path d="M126.75 0.337982H165.958V233.558H126.75V227.136C114.582 234.572 100.048 238.966 85.176 238.966C38.194 238.966 0 198.406 0 148.382C0 98.696 38.194 58.136 85.176 58.136C100.048 58.136 114.582 62.53 126.75 69.966V0.337982ZM126.75 148.382C126.75 148.044 126.75 148.044 126.75 148.044C126.75 146.692 126.75 145.34 126.75 143.988C126.75 143.312 126.75 142.636 126.412 141.96C126.412 141.622 126.412 140.946 126.412 140.608C125.736 135.876 124.722 131.482 123.032 127.426C118.638 115.596 109.85 104.104 94.978 99.372C91.936 98.358 88.556 97.682 85.176 97.682C84.838 97.682 84.838 97.682 84.5 97.682C84.162 97.682 83.486 97.344 83.148 97.344C82.81 97.344 82.134 97.344 81.796 97.682C80.782 97.682 79.768 97.682 78.754 97.682H78.416C72.67 98.358 67.262 100.386 62.192 103.428C62.192 103.766 62.192 103.766 61.854 103.766C60.84 104.442 59.826 105.118 58.812 105.794C58.136 106.47 57.46 107.146 56.446 107.822C56.446 108.16 56.108 108.16 55.77 108.498C45.63 117.962 39.208 132.158 39.208 148.382V148.72C39.208 175.76 57.46 197.73 80.444 199.42C81.12 199.42 82.134 199.42 83.148 199.42C83.486 199.42 83.486 199.42 83.824 199.42C84.162 199.42 84.5 199.42 85.176 199.42C85.852 199.42 86.528 199.42 87.542 199.082C95.992 198.406 103.09 195.026 108.498 189.956C119.652 180.83 126.75 165.62 126.75 148.382Z" fill="url(#lgOut)"/>
            </svg>
          <div style={{ margin:"12px auto 0", width:50, height:2, background:"linear-gradient(90deg,#96B9FF,#F19F9E,#FFD76F)", borderRadius:2 }} />
        </div>

        {/* Month nav + Calendar — full swipe zone */}
        <div
          onTouchStart={calTS}
          onTouchEnd={calTE}
          style={{ touchAction: "pan-y" }}
        >
        {/* Month nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <button onClick={() => mIdx > 0 && setMIdx(i=>i-1)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:mIdx===0?"#c8c4e8":"#5080c0", padding:"2px 8px" }}>‹</button>
          <span style={{ fontSize:15, fontWeight:600, color:"#2a2a40", letterSpacing:"0.04em" }}>{MONTHS[activeMonth]} 2026</span>
          <button onClick={() => mIdx < mKeys.length-1 && setMIdx(i=>i+1)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:mIdx===mKeys.length-1?"#c8c4e8":"#5080c0", padding:"2px 8px" }}>›</button>
        </div>

        {/* Calendar grid */}
        <div style={{
          background:"rgba(255,255,255,0.8)", borderRadius:16, padding:"12px 10px 14px",
          boxShadow:"0 2px 18px rgba(100,100,180,0.07)", border:"1px solid rgba(173,197,245,0.3)",
          backdropFilter:"blur(6px)", marginBottom:14, userSelect:"none",
        }}>
          {/* DOW */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:6 }}>
            {DOW_S.map((d,i) => (
              <div key={i} style={{ textAlign:"center", fontSize:10, fontWeight:600, color:(i===0||i===6)?"#9e4040":"#5060a8", letterSpacing:"0.04em", textTransform:"uppercase" }}>{d}</div>
            ))}
          </div>
          {/* Days */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
            {Array.from({length:firstDow}).map((_,i) => <div key={`p${i}`} />)}
            {monthDays.map(day => {
              const s = dayStyle(day);
              const isSel = selDate === day.date;
              const dn = day.dateObj.getDate();
              return (
                <button key={day.date} onClick={() => setSelDate(day.date)} style={{
                  background: isSel ? "linear-gradient(135deg, #96B9FF 0%, #F19F9E 50%, #FFD76F 100%)" : s.bg,
                  border:`1.5px solid ${isSel ? "transparent" : "transparent"}`,
                  borderRadius:9, minHeight:"clamp(60px,13.5vw,82px)", width:"100%", minWidth:0,
                  padding:"4px 2px 5px", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start",
                  gap:1, transition:"all 0.12s",
                  transform: isSel ? "scale(1.06)" : "scale(1)",
                  boxShadow: isSel ? "0 3px 14px rgba(241,159,158,0.45)" : "none",
                  position:"relative",
                }}>
                  {/* Red dot for extras */}
                  {day.hasExtra && (
                    <div style={{ position:"absolute", top:3, right:3, width:5, height:5, borderRadius:"50%", background:"#e8845a", boxShadow:"0 0 3px rgba(232,132,90,0.5)" }} />
                  )}
                  <span style={{ fontSize:"clamp(7px,1.6vw,9px)", fontWeight:600, color:isSel?"#2a1a20":s.text, opacity:isSel?0.9:0.55, lineHeight:1 }}>{dn}</span>
                  <span style={{ fontSize:"clamp(15px,3.4vw,20px)", lineHeight:1.1 }}>{day.e}</span>
                  <span style={{
                    fontSize:"clamp(7px,1.4vw,8.5px)", color:isSel?"#2a1a20":s.text, opacity:isSel?1:0.72,
                    lineHeight:1.2, textAlign:"center", padding:"0 2px", maxWidth:"100%", overflow:"hidden",
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", fontWeight:500,
                  }}>{day.short}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div> {/* end month swipe zone */}

        {/* Detail panel */}
        {sel && (
          <div onTouchStart={detTS} onTouchEnd={detTE} style={{ userSelect:"none", padding:"0 2px" }}>
            {/* Nav */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <button onClick={() => navDet(-1)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:"#b8c4e0", padding:"0 4px" }}>‹</button>
              <div style={{ textAlign:"center", flex:1 }}>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#5a5a7a" }}>
                  {fmtDate(sel.dateObj)}
                  {sel.isTeresa && <span style={{ color:"#e09090", marginLeft:6 }}>· Teresa here 👯</span>}
                </div>
                {/* Week theme banner ONLY on its Monday */}
                {sel.weekTheme && (
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"#9e3558", marginTop:2 }}>
                    {sel.weekTheme}
                  </div>
                )}
                {/* Color walk — show inline, no banner */}
                {sel.colorWalk && (
                  <div style={{ fontSize:11, fontWeight:600, color:"#4a52a8", marginTop:2 }}>
                    🌈 Color Walk: {sel.colorWalk}
                  </div>
                )}
              </div>
              <button onClick={() => navDet(1)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:"#b8c4e0", padding:"0 4px" }}>›</button>
            </div>

            {/* Emoji */}
            <div style={{ textAlign:"center", marginBottom:8 }}>
              <span style={{ fontSize:40 }}>{sel.e}</span>
            </div>

            {/* Heading */}
            {sel.heading && (
              <div style={{ textAlign:"center", marginBottom:8 }}>
                <span style={{ fontSize:17, fontWeight:600, color:"#2a2a40", letterSpacing:"0.01em" }}>{sel.heading}</span>
              </div>
            )}

            {/* Note — renders [[text|url]] as clickable links */}
            <div style={{ marginBottom:12 }}>
              {sel.note.split("\n\n").map((para, i) => {
                const parts = para.split(/(\[\[.*?\|.*?\]\])/g);
                return (
                  <p key={i} style={{ margin:i===0?"0 0 10px":"10px 0 0", fontSize:15, color:"#3a3858", lineHeight:1.75 }}>
                    {parts.map((part, j) => {
                      const m = part.match(/^\[\[(.*?)\|(.*?)\]\]$/);
                      return m
                        ? <a key={j} href={m[2]} target="_blank" rel="noopener noreferrer" style={{ color:"#7090c8", textDecoration:"underline", textDecorationColor:"rgba(112,144,200,0.4)", fontWeight:500, whiteSpace:"nowrap" }}>
                            {m[1]}<svg style={{ display:"inline", verticalAlign:"middle", marginLeft:2, opacity:0.7 }} width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1h4v4M5 7l6-6M3 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" stroke="#7090c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        : part;
                    })}
                  </p>
                );
              })}
            </div>

            {/* Real event addon */}
            {sel.realEvent && (
              <div style={{ borderTop:"1px solid rgba(150,185,255,0.2)", paddingTop:12, marginTop:4 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#c05878", marginBottom:3 }}>Real Event</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#3a1830" }}>{sel.realEvent.name}</div>
                <div style={{ fontSize:13, color:"#7a4860", marginTop:3, lineHeight:1.6 }}>{sel.realEvent.note}</div>
              </div>
            )}

            {/* Market addon */}
            {sel.market && (
              <div style={{ borderTop:"1px solid rgba(150,185,255,0.2)", paddingTop:12, marginTop:sel.realEvent?8:4 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#4a70b8", marginBottom:3 }}>Market Today</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#1a2a50" }}>{sel.market.name}</div>
                <div style={{ fontSize:13, color:"#3a4870", marginTop:3, lineHeight:1.6 }}>{sel.market.note}</div>
              </div>
            )}

            {/* First Friday */}
            {firstFriday && (
              <div style={{ borderTop:"1px solid rgba(150,185,255,0.2)", paddingTop:12, marginTop:8 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#c05878", marginBottom:4 }}>🍽️ First Friday</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#3a1830" }}>{firstFriday.place}</div>
                    <div style={{ fontSize:13, color:"#7a4860", marginTop:3, lineHeight:1.6 }}>{firstFriday.note}</div>
                  </div>
                  {firstFriday.url && (
                    <a href={firstFriday.url} target="_blank" rel="noopener noreferrer" style={{ background:"#c05878", color:"#fff", padding:"5px 8px", borderRadius:8, fontSize:10, fontWeight:700, textDecoration:"none", marginLeft:10, alignSelf:"center", flexShrink:0, display:"flex", alignItems:"center" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 1h4v4M5 7l6-6M3 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Swipe hint */}
            <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"#8080a0", letterSpacing:"0.06em" }}>← swipe to browse days →</div>

            {/* Mantra */}
            {sel.mantra && (
              <div style={{
                marginTop:16, padding:"12px 16px",
                background:"linear-gradient(135deg, rgba(150,185,255,0.6) 0%, rgba(241,159,158,0.6) 50%, rgba(255,215,111,0.6) 100%)",
                borderRadius:12, textAlign:"center",
              }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#2a1a20", opacity:0.7, marginBottom:5 }}>Today's Mantra</div>
                <div style={{ fontSize:14, color:"#2a1a20", lineHeight:1.65, fontStyle:"italic" }}>"{sel.mantra}"</div>
              </div>
            )}
          </div>
        )}

        {/* Glimmers journal */}
        {sel && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"#a06888", marginBottom:6, paddingLeft:2 }}>
              ✨ glimmers
            </div>
            {firstFriday ? (
              <textarea
                value={journalText}
                onChange={e => saveJournal(journalKey, e.target.value)}
                placeholder={ffPrompt}
                rows={4}
                style={{
                  width:"100%", boxSizing:"border-box", border:"1px solid rgba(192,88,120,0.25)",
                  borderRadius:12, padding:"12px 14px", fontSize:14, color:"#3a2030",
                  background:"rgba(255,240,245,0.7)", resize:"none", outline:"none",
                  fontFamily:"inherit", lineHeight:1.7, caretColor:"#c05878",
                }}
              />
            ) : (
              <textarea
                value={journalText}
                onChange={e => saveJournal(journalKey, e.target.value)}
                placeholder="what caught your eye today?"
                rows={4}
                style={{
                  width:"100%", boxSizing:"border-box", border:"1px solid rgba(150,185,255,0.25)",
                  borderRadius:12, padding:"12px 14px", fontSize:14, color:"#2a2040",
                  background:"rgba(245,242,255,0.7)", resize:"none", outline:"none",
                  fontFamily:"inherit", lineHeight:1.7, caretColor:"#7090c8",
                }}
              />
            )}
            {journalText.length > 0 && (
              <div style={{ fontSize:10, color:"#a0a0c0", marginTop:4, paddingLeft:2 }}>saved ✓</div>
            )}
          </div>
        )}

        {/* Nearby Today — pool + yoga links, below the daily content */}
        {sel && !sel.trav && (() => {
          const poolHours = sel.poolHours;
          const Card = ({ icon, title, col, bg, bdr, sub, href }) => (
            <div style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:13, padding:"11px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:col, marginBottom:3 }}>{icon} {title}</div>
                  {sub}
                </div>
                {href && (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ background:col, color:"#fff", padding:"5px 8px", borderRadius:8, fontSize:10, fontWeight:700, textDecoration:"none", marginLeft:10, alignSelf:"center", flexShrink:0, display:"flex", alignItems:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 1h4v4M5 7l6-6M3 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
          return (
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"#6a6a8a", marginBottom:8, paddingLeft:2, borderTop:"1px solid rgba(150,185,255,0.2)", paddingTop:14 }}>Nearby Today</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {poolHours && (
                  <Card icon="🏊" title="Northwest Pool" col="#5080c8" bg="#edf2fd" bdr="#adc5f5"
                    href="https://maps.app.goo.gl/JX11Q26hSotLdxF3A"
                    sub={<>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1a2850" }}>
                      {sel.dow === 5 ? `Open · ${poolHours}` : `Lunch swim · 3–4 PM · $2`}
                    </div>
                    <div style={{ fontSize:11, color:"#4a5888", marginTop:1 }}>2331 60th St N · $2 admission · flume slide, diving boards</div>
                    {sel.dow===5 && <div style={{ fontSize:11, color:"#5080c8", marginTop:3, fontWeight:600 }}>Evening session tonight: 7–9 PM</div>}
                    </>}
                  />
                )}
                <Card icon="🧘" title="Salty Souls Yoga" col="#7b52b0" bg="#f5f0fc" bdr="#c4a8e4"
                  href="https://www.momoyoga.com/saltysoulsyoga/schedule"
                  sub={<div style={{ fontSize:12, color:"#6a5080", lineHeight:1.6 }}>6798 Crosswinds Dr N, D-106 · 33710 · All levels · Check schedule</div>}
                />
                <Card icon="🧘" title="Beach Town Yoga" col="#7b52b0" bg="#f5f0fc" bdr="#c4a8e4"
                  href="https://www.beachtownyoga.com/locations/st-petersburg"
                  sub={<div style={{ fontSize:12, color:"#6a5080", lineHeight:1.6 }}>131 22nd St S · Donation-based · Drop-in · Heated infrared · Classes all day</div>}
                />
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
