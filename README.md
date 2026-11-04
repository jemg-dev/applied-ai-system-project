# 🎵 Music Recommender Simulation

## Project Summary

In this project you will build and explain a small music recommender system.

Your goal is to:

- Represent songs and a user "taste profile" as data
- Design a scoring rule that turns that data into recommendations
- Evaluate what your system gets right and wrong
- Reflect on how this mirrors real world AI recommenders

Replace this paragraph with your own summary of what your version does.

---

## How The System Works

Explain your design in plain language.


Some prompts to answer: 

- What features does each `Song` use in your system
  - For example: genre, mood, energy, tempo
- What information does your `UserProfile` store
- How does your `Recommender` compute a score for each song
- How do you choose which songs to recommend

You can include a simple diagram or bullet list if helpful.

There are many ways that AI recommendation systems work at YouTube, TikTok, and Spotify, and although they may not use the same recommendation system, the properties and attributes that make up their systems often have a lot of overlap. At a high-level, recommendation systems often have content-based filtering, that is, matching content attributes like mood, genre, energy to user taste profile. Another way these algorithms recommend content is collaborative-filtering, that is, using engagement behavior between user profiles to recommend content. 

For this project, I will start with a simple content-based approach to match songs to a user's taste profile. It is a better fit here than collaborative filtering because my dataset describes songs by their attributes but has no multi-user engagement data, and content-based methods work with less user activity. Each song attribute (energy, valence, acousticness, mood, genre) gets a 0-to-1 score for how closely it matches the user's target for that attribute: closeness for numeric attributes, and an exact match for categorical ones. The attribute scores are combined with weights into one match score per song, and the songs are then ranked by that score, with the top few returned along with a short explanation

The song attributes that will be used are: genre, mood, energy, valence, and acousticness to score a song

The UserProfile will store these same attributes as fields.

The five categories observed are given a score from 0 to 1. These categories are then weighted and each category score * weight is summed to reach one final song score. This represents how close the song matches the user taste profile.

The breakdown of attributes and weight is as follows:

| Attribute | Type | Closeness formula (0 to 1) | Weight |
|---|---|---|---|
| Energy | Numeric | `1 - abs(song_energy - target_energy)` | 30% |
| Valence | Numeric | `1 - abs(song_valence - target_valence)` | 30% |
| Genre | Categorical | `1` if `song_genre == favorite_genre`, else `0` | 15% |
| Mood | Categorical | `1` if `song_mood == favorite_mood`, else `0` | 15% |
| Acousticness | Numeric | `1 - abs(song_acousticness - acoustic_preference)` | 10% |

Energy and valence are given the highest weights because their attributes are independent from any strict rules or categorization. These two values can take us to the general region or direction a song is in, we can then refine it with the genre and mood categorization. This is so that songs that are in the same general vibe are not placed far apart due to similar genres not strictly matching each other. For example, Chill and Relaxed moods could be scored very different even though they are kind of the same thing. Acousticness was given the lowest weight simply because this is not as emphasized in real-world scenarios when it comes to exploring music in my experience. Of course this means some biases are introduced. Someone who prefers dubstep, house, and other electronic types of music may not immediately be given what they are looking for when it comes to the recommended songs. Furthermore, the algorithm may recommend different types of genres and moods to users who prefer to remain within a genre or particular mood. Thus someone who preferes high energy metal music, may also be recommended high energy pop which is almost the opposite of what a lot of real world metal fans like.
---

## Getting Started

### Setup

1. Create a virtual environment (optional but recommended):

   ```bash
   python -m venv .venv
   source .venv/bin/activate      # Mac or Linux
   .venv\Scripts\activate         # Windows

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Run the app:

```bash
python -m src.main
```

### Running Tests

Run the starter tests with:

```bash
pytest
```

You can add more tests in `tests/test_recommender.py`.

---

## Sample Recommendation Output

Paste a sample of your recommender's output here as a text block so a reader can see what it produces:

```
# e.g.:
# User profile: genre=indie, mood=chill, energy=low
# Recommendations:
#   1. ...
#   2. ...
#   3. ...
```

========================================================================
Profile: genre=pop, mood=happy, energy=0.8, valence=0.9, acousticness=0.6

------------------------------------------------------------------------
#1  Sunrise City  by Neon Echo
    Score: 0.93 / 1.00   [################### ]
    Why:
      - energy closeness 0.98 (song 0.82 vs target 0.80) (+0.29)
      - valence closeness 0.94 (song 0.84 vs target 0.90) (+0.28)
      - acousticness closeness 0.58 (song 0.18 vs target 0.60) (+0.06)
      - genre match: pop (+0.15)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#2  Rooftop Lights  by Indigo Parade
    Score: 0.79 / 1.00   [################    ]
    Why:
      - energy closeness 0.96 (song 0.76 vs target 0.80) (+0.29)
      - valence closeness 0.91 (song 0.81 vs target 0.90) (+0.27)
      - acousticness closeness 0.75 (song 0.35 vs target 0.60) (+0.08)
      - genre mismatch: indie pop vs pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#3  Island Breeze  by Jah Sunrise
    Score: 0.75 / 1.00   [###############     ]
    Why:
      - energy closeness 0.78 (song 0.58 vs target 0.80) (+0.23)
      - valence closeness 0.96 (song 0.86 vs target 0.90) (+0.29)
      - acousticness closeness 0.80 (song 0.40 vs target 0.60) (+0.08)
      - genre mismatch: reggae vs pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#4  Pulse Horizon  by Helix Drop
    Score: 0.75 / 1.00   [###############     ]
    Why:
      - energy closeness 0.85 (song 0.95 vs target 0.80) (+0.26)
      - valence closeness 1.00 (song 0.90 vs target 0.90) (+0.30)
      - acousticness closeness 0.43 (song 0.03 vs target 0.60) (+0.04)
      - genre match: pop (+0.15)
      - mood mismatch: euphoric vs happy (+0.00)

------------------------------------------------------------------------
#5  Gym Hero  by Max Pulse
    Score: 0.72 / 1.00   [##############      ]
    Why:
      - energy closeness 0.87 (song 0.93 vs target 0.80) (+0.26)
      - valence closeness 0.87 (song 0.77 vs target 0.90) (+0.26)
      - acousticness closeness 0.45 (song 0.05 vs target 0.60) (+0.05)
      - genre match: pop (+0.15)
      - mood mismatch: intense vs happy (+0.00)

========================================================================

**Screenshot or video** *(optional)*: <!-- Insert a screenshot or demo video link here -->

---

## Experiments You Tried

Use this section to document the experiments you ran. For example:

- What happened when you changed the weight on genre from 2.0 to 0.5
- What happened when you added tempo or valence to the score
- How did your system behave for different types of users

---

## Limitations and Risks

Summarize some limitations of your recommender.

Examples:

- It only works on a tiny catalog
- It does not understand lyrics or language
- It might over favor one genre or mood

You will go deeper on this in your model card.

---

## Reflection

Read and complete `model_card.md`:

[**Model Card**](model_card.md)

Write 1 to 2 paragraphs here about what you learned:

- about how recommenders turn data into predictions
- about where bias or unfairness could show up in systems like this



