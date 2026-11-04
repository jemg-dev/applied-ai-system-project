# 🎧 Model Card: Music Recommender Simulation

## 1. Model Name  

**VibeFinder 1.0**

---

## 2. Goal and Intended Use  

**Goal.** VibeFinder suggests the 5 songs from a small catalog that best fit a user's taste. The user gives a favorite genre, a mood, and targets for energy, valence (how happy a song sounds) and acousticness. The model gives each song a score from 0 to 1 and shows why.

**Intended use.**

- Classroom learning about how recommenders work.
- Trying out profiles and seeing how the scores change.
- Showing a clear explanation for every pick.

**Not intended for.**

- Real listeners or a real music app. The catalog is only 20 songs.
- Anything that needs fairness across many kinds of users. It was only tested on 12 made-up profiles.
- Judging a person's mood or mental state. The "sad" test shows it cannot even handle that word.
- Choosing which artists get exposure or money.

---

## 3. How the Model Works  

**The big idea.** The recommender compares each song to a "taste profile" the user gives it, and picks the songs that look most like that profile. This is called content-based filtering: it only looks at what the songs are like. It does not look at what other listeners did, because the dataset has no data about other users.

**What it looks at.** Each song is described by five things:

- **Energy**: how intense or lively the song feels (0 to 1)
- **Valence**: how happy or positive it sounds (0 to 1)
- **Acousticness**: how acoustic (versus electronic) it sounds (0 to 1)
- **Genre**: for example pop or reggae
- **Mood**: for example happy or chill

The user's profile holds a target for each of the same five things, such as "pop, happy, high energy, very positive, fairly acoustic."

**How a song gets a score.**

1. For energy, valence and acousticness, the model checks how close the song is to the user's target. A perfect match earns full credit, and the further away it is, the less credit it earns.
2. For genre and mood, it is all or nothing. An exact match earns full credit, and anything else earns none.
3. Not every attribute counts equally. Each one is multiplied by a weight, and the results are added up into one final score between 0 and 1:

| Attribute | Weight |
|---|---|
| Energy | 30% |
| Valence | 30% |
| Genre | 15% |
| Mood | 15% |
| Acousticness | 10% |

**Why those weights.** Energy and valence count the most because they are smooth scales. They get a song into the right general "vibe" without being thrown off by labels. Genre and mood are labels with sharp edges: "chill" and "relaxed" are nearly the same feeling, but the model treats them as a total mismatch. Giving them less weight stops a near-miss on a label from sinking a song that otherwise fits well. Acousticness has the lowest weight because it tends to matter least when people look for music.

**Picking the results.** The model scores every song in the catalog, sorts them from highest to lowest, and returns the top few (five by default). Each result comes with a short list of reasons showing how many points each attribute added, so the user can see why a song was recommended.

**What changed from the starter logic.** Two things:

- **Added valence.** The starter profile only tracked genre, mood, energy and acoustic taste. I added valence (how happy or positive a song sounds) as a fifth preference, since it describes the feel of a song in a way the other attributes don't.
- **Made acoustic taste a number instead of a yes/no.** At first the profile stored acoustic taste as true or false, and I turned that into a stand-in number (0.8 for "likes acoustic", 0.2 for "doesn't") so it could use the same closeness math as energy and valence. That was a workaround. Now the user gives an actual target between 0 and 1, the same way they do for energy and valence. This lets someone say "a little acoustic" or "very acoustic" instead of being forced into one of two buckets, and it lets all three numeric attributes be scored the same way.

**Trade-offs to be aware of.** Because it only compares attributes, a fan of one genre can still be shown songs from a different genre that happen to match on energy and valence. For example, a metal fan might get high-energy pop. Someone whose taste is built around a specific genre, like dubstep or house, may also not see what they want near the top.

---

## 4. Data  

- **Size:** 20 songs in `data/songs.csv`. I did not add or remove any.
- **Columns:** title, artist, genre, mood, energy, tempo, valence, danceability, acousticness.
- **Used in scoring:** genre, mood, energy, valence, acousticness. Tempo and danceability are loaded but ignored.
- **Genres:** 12. Lofi has 4 songs, pop 3, rock 2, jazz 2, synthwave 2. Seven genres have just one song.
- **Moods:** 10, such as chill (4), happy (3), intense (3) and moody (3). There is no "sad".
- **Missing:** lyrics, language, artist, decade, and most of the world's genres (no k-pop, metal, EDM or R&B). The numbers look hand-made, not measured.

---

## 5. Strengths  

- Clear profiles get sensible results. Chill Lofi gets calm lofi, ambient and classical. Deep Intense Rock gets the two rock songs first.
- Very different profiles give very different lists, with almost no overlap.
- Every score comes with reasons, so you can see exactly where each point came from.
- Odd input (empty profile, wrong genre, numbers out of range) did not crash it.

---

## 6. Limitations and Bias

**One weakness I found: the "energy gap" calculation treats every user the same, so it shapes who gets good results.** Energy is scored as `1 - |song - target|` and carries 30% of the score, but the catalog is lopsided: 9 songs have energy of 0.75 or higher, 8 have 0.45 or lower, and only 3 sit in the middle. A user with a medium-energy target (like "Dead Center") has few songs close by, while loud-pop and quiet-lofi fans have plenty, so they get a more confident top 5. The same gap hides a filter bubble: every song with acousticness above 0.6 also has energy of 0.48 or less, so a user who wants acoustic *and* high energy can never get both, and the loud songs win because energy outweighs acousticness three to one. Because the gap math is linear and never penalizes a miss harshly, a far-off song still keeps most of its points, which is why a classical piece (0.66) nearly beat the rock song (0.67) for the "Calm Metal Fan".

Other biases I noticed:

- **Gym Hero shows up too often.** It appeared in the top 5 for 7 of the 12 profiles, including ones that have nothing to do with the gym. It is a pop song with very high energy and fairly high valence, which makes it "close enough" to many different targets.
- **Scores are squashed together.** Closeness is `1 - gap`, so even a far-off song keeps most of its points. In "Conflict: Calm Metal Fan", a classical piece (0.66) nearly ties the rock song (0.67), even though the user asked for rock.
- **Small catalog, uneven genres.** 7 of the 12 genres have exactly one song, while lofi has 4. A lofi fan gets real variety; a classical or country fan gets one good match, then filler.
- **Exact-match labels.** `"Lofi "` or `"CHILL"` count as a miss, and the top score dropped from 0.96 to 0.66 for that reason alone.
- **Missing preferences count as a perfect match.** An empty profile gives every song 1.00, and the "ranking" is just the order of the file.
- **Out-of-range numbers are not rejected.** An energy target of 1.5 is accepted and quietly changes the math.

---

## 7. Evaluation

**Profiles tested.** Twelve in total (full terminal output is in the README):

- Four normal taste profiles: Starter Happy Pop, High-Energy Pop, Chill Lofi, Deep Intense Rock.
- Eight stress tests: Energetic but Sad, Calm Metal Fan, Unknown Genre ("k-pop"), Out-of-Range Numbers, Dead Center (all 0.5), Case/Whitespace Mismatch, Empty Profile, Genre Only.

**What I looked for.** Whether #1 matched what I would pick by ear, whether the explanations added up to the score, and whether strange input broke anything or just gave odd results. Nothing crashed.

**Does it feel right?** For the normal profiles, yes. Chill Lofi returns Library Rain and Midnight Coding first (both lofi and chill), then calm ambient and classical songs. Deep Intense Rock returns the two rock songs first. High-Energy Pop returns Pulse Horizon (pop, euphoric, energy 0.95) first with a 0.98 score. I would pick the same.

**Why does Sunrise City rank first for Happy Pop?** It earns points on every line: energy 0.82 vs 0.80 (+0.29 of a possible 0.30), valence 0.84 vs 0.90 (+0.28), acousticness 0.18 vs 0.60 (+0.06), genre pop (+0.15) and mood happy (+0.15). Total 0.93. The only weak spot is acousticness, and that carries just 10% of the score.

**Why does "Gym Hero" keep showing up for people who just want Happy Pop?** Think of the score as a report card with five subjects. Gym Hero is a pop song, so it gets full marks for genre (+0.15). It is also loud and bright, so it does well on energy (0.93 vs a target of 0.80) and valence (0.77 vs 0.90). It fails only mood: it is "intense", not "happy", so it loses the 0.15 mood points. Total 0.72, which is still enough for 5th place in a 20-song catalog. The system never asks whether a workout anthem is something a happy-pop listener wants at breakfast. It only asks how close the numbers are, and mood is only 15% of the grade. A bigger catalog would have many better songs pushing Gym Hero out.

**Experiment: double energy, halve genre.** (Weights re-scaled to total exactly 1.0; see the README.)

- Happy Pop: Gym Hero dropped out of the top 5 and a latin song, Fuego en la Calle, came in. That is a small improvement: Gym Hero was never happy, Fuego at least is bright and upbeat. The top 3 did not move.
- Energetic but Sad: rock songs now lead (Iron Cathedral 0.71). This fits "high energy" better.
- Calm Metal Fan: the rock songs vanished and Moonlit Sonata (classical) took #1 at 0.76. That matches the quiet numbers but ignores that the user said "rock".
- Dead Center: a country song beat the jazz song even though the user asked for jazz.

My verdict: the change made the lists different, not clearly better. It rewards listeners whose numbers are the point and punishes listeners whose genre is the point. I kept the original weights as the default.

**What surprised me.**

- "Sad" is not a mood in my catalog, so no song can match it, and the system did not complain.
- The Empty Profile gives every song 1.00, so the "top 5" is just the first songs in the file.
- A single trailing space in `"Lofi "` cost 0.30 of the score.
- The "Calm Metal Fan" ended up with classical music in its top 3, which is a reasonable guess but not what anyone would call "metal".

**Profile-to-profile comparisons.**

- **Happy Pop vs High-Energy Pop:** both lead with pop, but High-Energy Pop puts Pulse Horizon (euphoric, energy 0.95) on top while Happy Pop prefers Sunrise City (happy, energy 0.82). The only differences are a higher energy target and a different mood, so this is correct.
- **High-Energy Pop vs Chill Lofi:** no song appears in both lists. One wants loud and electronic, the other quiet and acoustic. This is the clearest sign the scoring works.
- **Chill Lofi vs Deep Intense Rock:** opposite ends of energy (0.3 vs 0.92) and valence (0.55 vs 0.3), and again no overlap. Rock gets Iron Cathedral and Storm Runner; lofi gets Library Rain.
- **Happy Pop vs Chill Lofi:** no song in common. Happy Pop gets bright, mid-to-high energy songs (Sunrise City, Rooftop Lights); Chill Lofi gets quiet, acoustic ones (Library Rain, Midnight Coding). Different energy and genre targets, so completely different lists is the right answer.
- **Happy Pop vs Deep Intense Rock:** the only overlap is Gym Hero, which is loud enough for rock fans and pop enough for pop fans. Otherwise Happy Pop gets happy songs and Rock gets dark, heavy ones (Iron Cathedral, Storm Runner), because their valence targets are 0.9 and 0.3.
- **High-Energy Pop vs Deep Intense Rock:** both want very loud songs, so Gym Hero lands in both lists (#2 and #3). They split on feel: Pulse Horizon, Sunrise City and Fuego (bright) for pop, Iron Cathedral and Storm Runner (dark) for rock. That is the valence target doing its job.
- **Deep Intense Rock vs Energetic but Sad:** both want loud songs, so Iron Cathedral and Gym Hero show up in each. The difference is that Rock has two songs matching genre and mood, so it scores 0.96, while the "sad" profile tops out at 0.59 because mood can never match.
- **Deep Intense Rock vs Calm Metal Fan:** same genre and mood, opposite energy. Rock's list is all loud; the Calm Metal Fan's list is two rock songs mixed with quiet classical, ambient and lofi. That is the numbers fighting the labels.
- **Happy Pop vs Unknown Genre ("k-pop"):** the lists are almost the same (Sunrise City, Rooftop Lights, Island Breeze), but the top score falls from 0.93 to 0.83 because the genre points are lost. It makes sense, but the user is never told.
- **Chill Lofi vs Case/Whitespace Mismatch:** same listener, different capitalization. The top song is still Library Rain, but the score falls from 0.96 to 0.66 and Midnight Coding drops down. The user did nothing wrong, so this is a bug.
- **Dead Center vs Chill Lofi:** a middle-of-the-road target pulls in jazz, country and lofi (relaxed, mellow songs) rather than the quietest ones. This is sensible.
- **Empty Profile vs Genre Only:** the Empty Profile returns the first songs in the file, all at 1.00. Genre Only (classical) puts Moonlit Sonata first, then the same file-order songs. With nothing to compare, the system just lists the file.
- **Out-of-Range Numbers vs Happy Pop:** same top two pop songs (Sunrise City, Pulse Horizon), but lower scores overall because a target of 1.5 can never be reached. The ranking looks sane, the scores don't.

(All six pairs of the four normal profiles are compared above. For the eight stress tests I compared each one with the normal profile it bends, rather than all 66 combinations.)

---

## 8. Future Work  

1. **Clean up the input.** Lowercase and trim genre and mood, clamp numbers to 0 to 1, and warn the user when a genre or mood is not in the catalog (like "sad").
2. **Add more songs and more moods.** Aim for a few hundred songs, with several per genre, so the top 5 is not most of the catalog.
3. **Make it more varied and fairer.** Give partial credit to similar moods ("chill" and "relaxed"), add tempo and danceability, and avoid repeating the same song, like Gym Hero, in every list.

---

## 9. Personal Reflection  

**Biggest learning moment.** My biggest learning moment was seeing how content-based filtering actually works. Before I started, I could not picture how a system decides what to recommend and what to leave out. After building a simple version and experimenting with it, I understood what goes into that decision: which features to use, how to compare them, and how much each one should count.

**How AI tools helped, and when I double-checked them.** AI tools gave me a quick start on what to do and how to do it. But in longer chats, the code it wrote often became complicated and hard for me to follow. When that happened, I opened a new chat and asked for the same thing in simpler code that I could understand. The AI also made assumptions about edge cases. For example, when a test profile left out an attribute like mood, it wanted to skip that attribute, which lowered every song's score a lot. I decided that a missing preference should count as full credit instead. If someone does not name a mood, they are open to anything, and songs should still rank well if the other attributes fit. That decision was mine, not the AI's, and it is a good reminder to check how AI-written code handles the unusual cases.

**What surprised me.** I was surprised that just giving weights to a few attributes can produce recommendations that feel good. This is nowhere near as sophisticated as Spotify, but it was fun to change the weights and see how they could match real-life tastes and situations.

**What I would try next.** I would build a more sophisticated scoring system. I would also like to try collaborative filtering, which uses what other listeners enjoy and not just the songs' own attributes.
