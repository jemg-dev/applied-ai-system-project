# VibeFinder 1.0: Profile-to-Profile Comparisons

Part of the original project's evaluation (Modules 1-3), moved here from the model card. It compares the 12 test profiles run through `python -m src.main` against the 20-song `data/songs.csv`. See the [model card](../model_card.md) for the summary.

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
