# System Diagram: Genre Hallway Curator

The diagram source is also in [system_diagram.mmd](system_diagram.mmd).

```mermaid
flowchart TD
    subgraph Browser["Browser: Genre Hallway game (Three.js)"]
        USER(["Player (human)"])
        CHAT["Chat panel"]
        SLIDERS["Taste sliders + room songs + match %"]
        BUTLER["3D butler walks to the picked room"]
        INFO["Info panel: score breakdown"]
    end

    subgraph Server["Python server: src/serve_game.py"]
        API["POST /api/curator<br/>size check, JSON check"]
    end

    subgraph Curator["Curator pipeline: src/curator.py"]
        GUARD["Input guardrails<br/>300-char cap, rate limit, call budget"]
        INTERP["1. INTERPRET (model call 1)<br/>message to taste profile + intent"]
        RETR["2. RETRIEVE (no model)<br/>score every song, keep the best<br/>with score breakdowns"]
        GEN["3. GENERATE (model call 2)<br/>reply + pick using ONLY retrieved songs"]
        VALID["4. VALIDATE<br/>clamp numbers, check mood,<br/>pick must be a retrieved song"]
        FALLBACK["Fallback: retrieval-only reply<br/>(no key, API error, bad output)"]
    end

    subgraph Data["Original project: VibeFinder 1.0 logic layer"]
        CSV[("data/game_songs.csv<br/>100 songs")]
        SCORE["src/recommender.py<br/>score_song"]
    end

    LLM[["Claude Haiku 5.5 (Anthropic API)<br/>key lives in .env on the server only"]]
    LOG[/"logs/curator.log<br/>requests, retrievals, tokens, fallbacks"/]

    subgraph Checks["Testing and human review"]
        PYTEST["pytest: mocked model<br/>20 tests: validation, retrieval,<br/>failures, HTTP endpoint"]
        EVAL["src/eval_curator.py<br/>6 fixed prompts on the real model"]
        HUMAN{{"Human check: compare reply numbers<br/>with the info panel breakdown"}}
    end

    USER -->|"types a request or a why-question"| CHAT
    CHAT -->|"message, taste, song on screen"| API
    API --> GUARD
    GUARD --> INTERP
    INTERP <-->|"JSON schema output"| LLM
    INTERP -->|"new taste (or current taste if explaining)"| RETR
    CSV --> RETR
    SCORE --> RETR
    RETR -->|"candidate songs + breakdowns"| GEN
    GEN <-->|"JSON schema output"| LLM
    GEN --> VALID
    GUARD -.->|"over budget / too soon"| FALLBACK
    INTERP -.->|"error"| FALLBACK
    GEN -.->|"error"| FALLBACK
    VALID -->|"reply, validated taste, pick"| API
    FALLBACK -->|"reply, no taste change"| API
    API -->|"JSON"| CHAT
    CHAT -->|"apply taste"| SLIDERS
    CHAT -->|"pick's genre"| BUTLER
    SLIDERS --> INFO
    INFO --> HUMAN
    HUMAN -.->|"mismatch found: tighten prompt"| GEN
    INTERP -.-> LOG
    RETR -.-> LOG
    GEN -.-> LOG
    VALID -.-> LOG
    FALLBACK -.-> LOG
    PYTEST -.->|"tests"| Curator
    EVAL -.->|"measures"| Curator
    LOG -.->|"reviewed by"| HUMAN
```

## How to read it

- **Input to process to output:** the player types in the chat panel. The server checks the request, then the Curator pipeline runs four steps: interpret, retrieve, generate, validate. The validated result goes back to the browser, which moves the taste sliders (so every room's song and match percentage change) and sends the butler to the picked genre's room.
- **Retrieval:** step 2 reuses `score_song` and the song catalog from the original VibeFinder 1.0 project. It is the only place songs are chosen; the model can only talk about what retrieval returned.
- **Where the AI is:** two calls to Claude Haiku 5.5, both with a JSON schema so the output is machine-readable. The API key stays on the server.
- **Dashed lines:** error paths and logging. If anything fails, the fallback gives a retrieval-only answer so the game keeps working.
- **Testing and humans:** `pytest` runs the pipeline against a mocked model (no key needed). `src/eval_curator.py` runs six fixed prompts on the real model. A human reads the log and compares the butler's numbers with the info panel's score breakdown; mismatches led to prompt changes (see the Testing Summary in the README).
