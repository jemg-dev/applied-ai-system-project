# 🎧 Model Card: Music Recommender Simulation

## 1. Model Name  

Give your model a short, descriptive name.  
Example: **VibeFinder 1.0**  

---

## 2. Intended Use  

Describe what your recommender is designed to do and who it is for. 

Prompts:  

- What kind of recommendations does it generate  
- What assumptions does it make about the user  
- Is this for real users or classroom exploration  

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

Describe the dataset the model uses.  

Prompts:  

- How many songs are in the catalog  
- What genres or moods are represented  
- Did you add or remove data  
- Are there parts of musical taste missing in the dataset  

---

## 5. Strengths  

Where does your system seem to work well  

Prompts:  

- User types for which it gives reasonable results  
- Any patterns you think your scoring captures correctly  
- Cases where the recommendations matched your intuition  

---

## 6. Limitations and Bias 

Where the system struggles or behaves unfairly. 

Prompts:  

- Features it does not consider  
- Genres or moods that are underrepresented  
- Cases where the system overfits to one preference  
- Ways the scoring might unintentionally favor some users  

---

## 7. Evaluation  

How you checked whether the recommender behaved as expected. 

Prompts:  

- Which user profiles you tested  
- What you looked for in the recommendations  
- What surprised you  
- Any simple tests or comparisons you ran  

No need for numeric metrics unless you created some.

---

## 8. Future Work  

Ideas for how you would improve the model next.  

Prompts:  

- Additional features or preferences  
- Better ways to explain recommendations  
- Improving diversity among the top results  
- Handling more complex user tastes  

---

## 9. Personal Reflection  

A few sentences about your experience.  

Prompts:  

- What you learned about recommender systems  
- Something unexpected or interesting you discovered  
- How this changed the way you think about music recommendation apps  
