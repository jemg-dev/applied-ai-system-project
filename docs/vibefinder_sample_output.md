# VibeFinder 1.0: Sample Recommendation Output

Terminal output of the original command-line recommender (`python -m src.main`, 20-song `data/songs.csv`). Moved here from the README; the game and the Curator use the separate 100-song catalog.

## All 12 profiles

Output of `python -m src.main` (default weights) for all 12 profiles. The first four are normal taste profiles; the rest are adversarial or edge-case profiles. Each block is the exact terminal output.

### Starter: Happy Pop - Top 5

```
========================================================================
                       STARTER: HAPPY POP - TOP 5                       
========================================================================
Tests:   baseline example
Profile: genre='pop', mood='happy', energy=0.8, valence=0.9, acousticness=0.6

------------------------------------------------------------------------
#1  Sunrise City  by Neon Echo  [pop/happy]
    Score: 0.93 / 1.00   [################### ]
    Why:
      - energy closeness 0.98 (song 0.82 vs target 0.80) (+0.29)
      - valence closeness 0.94 (song 0.84 vs target 0.90) (+0.28)
      - acousticness closeness 0.58 (song 0.18 vs target 0.60) (+0.06)
      - genre match: pop (+0.15)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#2  Rooftop Lights  by Indigo Parade  [indie pop/happy]
    Score: 0.79 / 1.00   [################    ]
    Why:
      - energy closeness 0.96 (song 0.76 vs target 0.80) (+0.29)
      - valence closeness 0.91 (song 0.81 vs target 0.90) (+0.27)
      - acousticness closeness 0.75 (song 0.35 vs target 0.60) (+0.08)
      - genre mismatch: indie pop vs pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#3  Island Breeze  by Jah Sunrise  [reggae/happy]
    Score: 0.75 / 1.00   [###############     ]
    Why:
      - energy closeness 0.78 (song 0.58 vs target 0.80) (+0.23)
      - valence closeness 0.96 (song 0.86 vs target 0.90) (+0.29)
      - acousticness closeness 0.80 (song 0.40 vs target 0.60) (+0.08)
      - genre mismatch: reggae vs pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#4  Pulse Horizon  by Helix Drop  [pop/euphoric]
    Score: 0.75 / 1.00   [###############     ]
    Why:
      - energy closeness 0.85 (song 0.95 vs target 0.80) (+0.26)
      - valence closeness 1.00 (song 0.90 vs target 0.90) (+0.30)
      - acousticness closeness 0.43 (song 0.03 vs target 0.60) (+0.04)
      - genre match: pop (+0.15)
      - mood mismatch: euphoric vs happy (+0.00)

------------------------------------------------------------------------
#5  Gym Hero  by Max Pulse  [pop/intense]
    Score: 0.72 / 1.00   [##############      ]
    Why:
      - energy closeness 0.87 (song 0.93 vs target 0.80) (+0.26)
      - valence closeness 0.87 (song 0.77 vs target 0.90) (+0.26)
      - acousticness closeness 0.45 (song 0.05 vs target 0.60) (+0.05)
      - genre match: pop (+0.15)
      - mood mismatch: intense vs happy (+0.00)

========================================================================
```

### High-Energy Pop - Top 5

```
========================================================================
                        HIGH-ENERGY POP - TOP 5                         
========================================================================
Tests:   upbeat, electronic, danceable
Profile: genre='pop', mood='euphoric', energy=0.95, valence=0.85, acousticness=0.1

------------------------------------------------------------------------
#1  Pulse Horizon  by Helix Drop  [pop/euphoric]
    Score: 0.98 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (song 0.95 vs target 0.95) (+0.30)
      - valence closeness 0.95 (song 0.90 vs target 0.85) (+0.28)
      - acousticness closeness 0.93 (song 0.03 vs target 0.10) (+0.09)
      - genre match: pop (+0.15)
      - mood match: euphoric (+0.15)

------------------------------------------------------------------------
#2  Gym Hero  by Max Pulse  [pop/intense]
    Score: 0.81 / 1.00   [################    ]
    Why:
      - energy closeness 0.98 (song 0.93 vs target 0.95) (+0.29)
      - valence closeness 0.92 (song 0.77 vs target 0.85) (+0.28)
      - acousticness closeness 0.95 (song 0.05 vs target 0.10) (+0.10)
      - genre match: pop (+0.15)
      - mood mismatch: intense vs euphoric (+0.00)

------------------------------------------------------------------------
#3  Sunrise City  by Neon Echo  [pop/happy]
    Score: 0.80 / 1.00   [################    ]
    Why:
      - energy closeness 0.87 (song 0.82 vs target 0.95) (+0.26)
      - valence closeness 0.99 (song 0.84 vs target 0.85) (+0.30)
      - acousticness closeness 0.92 (song 0.18 vs target 0.10) (+0.09)
      - genre match: pop (+0.15)
      - mood mismatch: happy vs euphoric (+0.00)

------------------------------------------------------------------------
#4  Fuego en la Calle  by Los Cometas  [latin/energetic]
    Score: 0.66 / 1.00   [#############       ]
    Why:
      - energy closeness 0.93 (song 0.88 vs target 0.95) (+0.28)
      - valence closeness 0.96 (song 0.89 vs target 0.85) (+0.29)
      - acousticness closeness 0.95 (song 0.15 vs target 0.10) (+0.10)
      - genre mismatch: latin vs pop (+0.00)
      - mood mismatch: energetic vs euphoric (+0.00)

------------------------------------------------------------------------
#5  Rooftop Lights  by Indigo Parade  [indie pop/happy]
    Score: 0.61 / 1.00   [############        ]
    Why:
      - energy closeness 0.81 (song 0.76 vs target 0.95) (+0.24)
      - valence closeness 0.96 (song 0.81 vs target 0.85) (+0.29)
      - acousticness closeness 0.75 (song 0.35 vs target 0.10) (+0.08)
      - genre mismatch: indie pop vs pop (+0.00)
      - mood mismatch: happy vs euphoric (+0.00)

========================================================================
```

### Chill Lofi - Top 5

```
========================================================================
                           CHILL LOFI - TOP 5                           
========================================================================
Tests:   low energy, mellow, fairly acoustic
Profile: genre='lofi', mood='chill', energy=0.3, valence=0.55, acousticness=0.8

------------------------------------------------------------------------
#1  Library Rain  by Paper Lanterns  [lofi/chill]
    Score: 0.96 / 1.00   [################### ]
    Why:
      - energy closeness 0.95 (song 0.35 vs target 0.30) (+0.28)
      - valence closeness 0.95 (song 0.60 vs target 0.55) (+0.29)
      - acousticness closeness 0.94 (song 0.86 vs target 0.80) (+0.09)
      - genre match: lofi (+0.15)
      - mood match: chill (+0.15)

------------------------------------------------------------------------
#2  Midnight Coding  by LoRoom  [lofi/chill]
    Score: 0.95 / 1.00   [################### ]
    Why:
      - energy closeness 0.88 (song 0.42 vs target 0.30) (+0.26)
      - valence closeness 0.99 (song 0.56 vs target 0.55) (+0.30)
      - acousticness closeness 0.91 (song 0.71 vs target 0.80) (+0.09)
      - genre match: lofi (+0.15)
      - mood match: chill (+0.15)

------------------------------------------------------------------------
#3  Focus Flow  by LoRoom  [lofi/focused]
    Score: 0.81 / 1.00   [################    ]
    Why:
      - energy closeness 0.90 (song 0.40 vs target 0.30) (+0.27)
      - valence closeness 0.96 (song 0.59 vs target 0.55) (+0.29)
      - acousticness closeness 0.98 (song 0.78 vs target 0.80) (+0.10)
      - genre match: lofi (+0.15)
      - mood mismatch: focused vs chill (+0.00)

------------------------------------------------------------------------
#4  Spacewalk Thoughts  by Orbit Bloom  [ambient/chill]
    Score: 0.80 / 1.00   [################    ]
    Why:
      - energy closeness 0.98 (song 0.28 vs target 0.30) (+0.29)
      - valence closeness 0.90 (song 0.65 vs target 0.55) (+0.27)
      - acousticness closeness 0.88 (song 0.92 vs target 0.80) (+0.09)
      - genre mismatch: ambient vs lofi (+0.00)
      - mood match: chill (+0.15)

------------------------------------------------------------------------
#5  Moonlit Sonata  by Elena Varga  [classical/chill]
    Score: 0.80 / 1.00   [################    ]
    Why:
      - energy closeness 0.88 (song 0.18 vs target 0.30) (+0.26)
      - valence closeness 1.00 (song 0.55 vs target 0.55) (+0.30)
      - acousticness closeness 0.83 (song 0.97 vs target 0.80) (+0.08)
      - genre mismatch: classical vs lofi (+0.00)
      - mood match: chill (+0.15)

========================================================================
```

### Deep Intense Rock - Top 5

```
========================================================================
                       DEEP INTENSE ROCK - TOP 5                        
========================================================================
Tests:   loud, aggressive, dark, not acoustic
Profile: genre='rock', mood='intense', energy=0.92, valence=0.3, acousticness=0.1

------------------------------------------------------------------------
#1  Iron Cathedral  by Black Tide Rising  [rock/intense]
    Score: 0.96 / 1.00   [################### ]
    Why:
      - energy closeness 0.95 (song 0.97 vs target 0.92) (+0.29)
      - valence closeness 0.95 (song 0.25 vs target 0.30) (+0.28)
      - acousticness closeness 0.94 (song 0.04 vs target 0.10) (+0.09)
      - genre match: rock (+0.15)
      - mood match: intense (+0.15)

------------------------------------------------------------------------
#2  Storm Runner  by Voltline  [rock/intense]
    Score: 0.94 / 1.00   [################### ]
    Why:
      - energy closeness 0.99 (song 0.91 vs target 0.92) (+0.30)
      - valence closeness 0.82 (song 0.48 vs target 0.30) (+0.25)
      - acousticness closeness 1.00 (song 0.10 vs target 0.10) (+0.10)
      - genre match: rock (+0.15)
      - mood match: intense (+0.15)

------------------------------------------------------------------------
#3  Gym Hero  by Max Pulse  [pop/intense]
    Score: 0.70 / 1.00   [##############      ]
    Why:
      - energy closeness 0.99 (song 0.93 vs target 0.92) (+0.30)
      - valence closeness 0.53 (song 0.77 vs target 0.30) (+0.16)
      - acousticness closeness 0.95 (song 0.05 vs target 0.10) (+0.10)
      - genre mismatch: pop vs rock (+0.00)
      - mood match: intense (+0.15)

------------------------------------------------------------------------
#4  Night Drive Loop  by Neon Echo  [synthwave/moody]
    Score: 0.58 / 1.00   [############        ]
    Why:
      - energy closeness 0.83 (song 0.75 vs target 0.92) (+0.25)
      - valence closeness 0.81 (song 0.49 vs target 0.30) (+0.24)
      - acousticness closeness 0.88 (song 0.22 vs target 0.10) (+0.09)
      - genre mismatch: synthwave vs rock (+0.00)
      - mood mismatch: moody vs intense (+0.00)

------------------------------------------------------------------------
#5  Concrete Crown  by Kid Meridian  [hip hop/confident]
    Score: 0.56 / 1.00   [###########         ]
    Why:
      - energy closeness 0.86 (song 0.78 vs target 0.92) (+0.26)
      - valence closeness 0.68 (song 0.62 vs target 0.30) (+0.20)
      - acousticness closeness 0.98 (song 0.12 vs target 0.10) (+0.10)
      - genre mismatch: hip hop vs rock (+0.00)
      - mood mismatch: confident vs intense (+0.00)

========================================================================
```

### Conflict: Energetic But Sad - Top 5

```
========================================================================
                  CONFLICT: ENERGETIC BUT SAD - TOP 5                   
========================================================================
Tests:   high energy + 'sad' mood; no song has mood 'sad', so mood can never match
Profile: genre='pop', mood='sad', energy=0.9, valence=0.1, acousticness=0.5

------------------------------------------------------------------------
#1  Gym Hero  by Max Pulse  [pop/intense]
    Score: 0.59 / 1.00   [############        ]
    Why:
      - energy closeness 0.97 (song 0.93 vs target 0.90) (+0.29)
      - valence closeness 0.33 (song 0.77 vs target 0.10) (+0.10)
      - acousticness closeness 0.55 (song 0.05 vs target 0.50) (+0.06)
      - genre match: pop (+0.15)
      - mood mismatch: intense vs sad (+0.00)

------------------------------------------------------------------------
#2  Iron Cathedral  by Black Tide Rising  [rock/intense]
    Score: 0.59 / 1.00   [############        ]
    Why:
      - energy closeness 0.93 (song 0.97 vs target 0.90) (+0.28)
      - valence closeness 0.85 (song 0.25 vs target 0.10) (+0.26)
      - acousticness closeness 0.54 (song 0.04 vs target 0.50) (+0.05)
      - genre mismatch: rock vs pop (+0.00)
      - mood mismatch: intense vs sad (+0.00)

------------------------------------------------------------------------
#3  Sunrise City  by Neon Echo  [pop/happy]
    Score: 0.57 / 1.00   [###########         ]
    Why:
      - energy closeness 0.92 (song 0.82 vs target 0.90) (+0.28)
      - valence closeness 0.26 (song 0.84 vs target 0.10) (+0.08)
      - acousticness closeness 0.68 (song 0.18 vs target 0.50) (+0.07)
      - genre match: pop (+0.15)
      - mood mismatch: happy vs sad (+0.00)

------------------------------------------------------------------------
#4  Pulse Horizon  by Helix Drop  [pop/euphoric]
    Score: 0.55 / 1.00   [###########         ]
    Why:
      - energy closeness 0.95 (song 0.95 vs target 0.90) (+0.29)
      - valence closeness 0.20 (song 0.90 vs target 0.10) (+0.06)
      - acousticness closeness 0.53 (song 0.03 vs target 0.50) (+0.05)
      - genre match: pop (+0.15)
      - mood mismatch: euphoric vs sad (+0.00)

------------------------------------------------------------------------
#5  Storm Runner  by Voltline  [rock/intense]
    Score: 0.54 / 1.00   [###########         ]
    Why:
      - energy closeness 0.99 (song 0.91 vs target 0.90) (+0.30)
      - valence closeness 0.62 (song 0.48 vs target 0.10) (+0.19)
      - acousticness closeness 0.60 (song 0.10 vs target 0.50) (+0.06)
      - genre mismatch: rock vs pop (+0.00)
      - mood mismatch: intense vs sad (+0.00)

========================================================================
```

### Conflict: Calm Metal Fan - Top 5

```
========================================================================
                    CONFLICT: CALM METAL FAN - TOP 5                    
========================================================================
Tests:   genre/mood say aggressive, numbers say quiet and acoustic
Profile: genre='rock', mood='intense', energy=0.1, valence=0.5, acousticness=0.95

------------------------------------------------------------------------
#1  Storm Runner  by Voltline  [rock/intense]
    Score: 0.67 / 1.00   [#############       ]
    Why:
      - energy closeness 0.19 (song 0.91 vs target 0.10) (+0.06)
      - valence closeness 0.98 (song 0.48 vs target 0.50) (+0.29)
      - acousticness closeness 0.15 (song 0.10 vs target 0.95) (+0.02)
      - genre match: rock (+0.15)
      - mood match: intense (+0.15)

------------------------------------------------------------------------
#2  Moonlit Sonata  by Elena Varga  [classical/chill]
    Score: 0.66 / 1.00   [#############       ]
    Why:
      - energy closeness 0.92 (song 0.18 vs target 0.10) (+0.28)
      - valence closeness 0.95 (song 0.55 vs target 0.50) (+0.28)
      - acousticness closeness 0.98 (song 0.97 vs target 0.95) (+0.10)
      - genre mismatch: classical vs rock (+0.00)
      - mood mismatch: chill vs intense (+0.00)

------------------------------------------------------------------------
#3  Spacewalk Thoughts  by Orbit Bloom  [ambient/chill]
    Score: 0.60 / 1.00   [############        ]
    Why:
      - energy closeness 0.82 (song 0.28 vs target 0.10) (+0.25)
      - valence closeness 0.85 (song 0.65 vs target 0.50) (+0.26)
      - acousticness closeness 0.97 (song 0.92 vs target 0.95) (+0.10)
      - genre mismatch: ambient vs rock (+0.00)
      - mood mismatch: chill vs intense (+0.00)

------------------------------------------------------------------------
#4  Library Rain  by Paper Lanterns  [lofi/chill]
    Score: 0.59 / 1.00   [############        ]
    Why:
      - energy closeness 0.75 (song 0.35 vs target 0.10) (+0.22)
      - valence closeness 0.90 (song 0.60 vs target 0.50) (+0.27)
      - acousticness closeness 0.91 (song 0.86 vs target 0.95) (+0.09)
      - genre mismatch: lofi vs rock (+0.00)
      - mood mismatch: chill vs intense (+0.00)

------------------------------------------------------------------------
#5  Iron Cathedral  by Black Tide Rising  [rock/intense]
    Score: 0.57 / 1.00   [###########         ]
    Why:
      - energy closeness 0.13 (song 0.97 vs target 0.10) (+0.04)
      - valence closeness 0.75 (song 0.25 vs target 0.50) (+0.22)
      - acousticness closeness 0.09 (song 0.04 vs target 0.95) (+0.01)
      - genre match: rock (+0.15)
      - mood match: intense (+0.15)

========================================================================
```

### Unknown Genre - Top 5

```
========================================================================
                         UNKNOWN GENRE - TOP 5                          
========================================================================
Tests:   genre not in the catalog ('k-pop'); does the 0.15 genre weight just vanish?
Profile: genre='k-pop', mood='happy', energy=0.8, valence=0.8, acousticness=0.3

------------------------------------------------------------------------
#1  Rooftop Lights  by Indigo Parade  [indie pop/happy]
    Score: 0.83 / 1.00   [#################   ]
    Why:
      - energy closeness 0.96 (song 0.76 vs target 0.80) (+0.29)
      - valence closeness 0.99 (song 0.81 vs target 0.80) (+0.30)
      - acousticness closeness 0.95 (song 0.35 vs target 0.30) (+0.10)
      - genre mismatch: indie pop vs k-pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#2  Sunrise City  by Neon Echo  [pop/happy]
    Score: 0.82 / 1.00   [################    ]
    Why:
      - energy closeness 0.98 (song 0.82 vs target 0.80) (+0.29)
      - valence closeness 0.96 (song 0.84 vs target 0.80) (+0.29)
      - acousticness closeness 0.88 (song 0.18 vs target 0.30) (+0.09)
      - genre mismatch: pop vs k-pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#3  Island Breeze  by Jah Sunrise  [reggae/happy]
    Score: 0.76 / 1.00   [###############     ]
    Why:
      - energy closeness 0.78 (song 0.58 vs target 0.80) (+0.23)
      - valence closeness 0.94 (song 0.86 vs target 0.80) (+0.28)
      - acousticness closeness 0.90 (song 0.40 vs target 0.30) (+0.09)
      - genre mismatch: reggae vs k-pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#4  Fuego en la Calle  by Los Cometas  [latin/energetic]
    Score: 0.63 / 1.00   [#############       ]
    Why:
      - energy closeness 0.92 (song 0.88 vs target 0.80) (+0.28)
      - valence closeness 0.91 (song 0.89 vs target 0.80) (+0.27)
      - acousticness closeness 0.85 (song 0.15 vs target 0.30) (+0.09)
      - genre mismatch: latin vs k-pop (+0.00)
      - mood mismatch: energetic vs happy (+0.00)

------------------------------------------------------------------------
#5  Gym Hero  by Max Pulse  [pop/intense]
    Score: 0.63 / 1.00   [#############       ]
    Why:
      - energy closeness 0.87 (song 0.93 vs target 0.80) (+0.26)
      - valence closeness 0.97 (song 0.77 vs target 0.80) (+0.29)
      - acousticness closeness 0.75 (song 0.05 vs target 0.30) (+0.08)
      - genre mismatch: pop vs k-pop (+0.00)
      - mood mismatch: intense vs happy (+0.00)

========================================================================
```

### Out-Of-Range Numbers - Top 5

```
========================================================================
                      OUT-OF-RANGE NUMBERS - TOP 5                      
========================================================================
Tests:   energy=1.5 and acousticness=-0.5 are impossible; closeness can go below zero
Profile: genre='pop', mood='happy', energy=1.5, valence=0.9, acousticness=-0.5

------------------------------------------------------------------------
#1  Sunrise City  by Neon Echo  [pop/happy]
    Score: 0.71 / 1.00   [##############      ]
    Why:
      - energy closeness 0.32 (song 0.82 vs target 1.50) (+0.10)
      - valence closeness 0.94 (song 0.84 vs target 0.90) (+0.28)
      - acousticness closeness 0.32 (song 0.18 vs target -0.50) (+0.03)
      - genre match: pop (+0.15)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#2  Pulse Horizon  by Helix Drop  [pop/euphoric]
    Score: 0.63 / 1.00   [#############       ]
    Why:
      - energy closeness 0.45 (song 0.95 vs target 1.50) (+0.13)
      - valence closeness 1.00 (song 0.90 vs target 0.90) (+0.30)
      - acousticness closeness 0.47 (song 0.03 vs target -0.50) (+0.05)
      - genre match: pop (+0.15)
      - mood mismatch: euphoric vs happy (+0.00)

------------------------------------------------------------------------
#3  Gym Hero  by Max Pulse  [pop/intense]
    Score: 0.58 / 1.00   [############        ]
    Why:
      - energy closeness 0.43 (song 0.93 vs target 1.50) (+0.13)
      - valence closeness 0.87 (song 0.77 vs target 0.90) (+0.26)
      - acousticness closeness 0.45 (song 0.05 vs target -0.50) (+0.04)
      - genre match: pop (+0.15)
      - mood mismatch: intense vs happy (+0.00)

------------------------------------------------------------------------
#4  Rooftop Lights  by Indigo Parade  [indie pop/happy]
    Score: 0.52 / 1.00   [##########          ]
    Why:
      - energy closeness 0.26 (song 0.76 vs target 1.50) (+0.08)
      - valence closeness 0.91 (song 0.81 vs target 0.90) (+0.27)
      - acousticness closeness 0.15 (song 0.35 vs target -0.50) (+0.02)
      - genre mismatch: indie pop vs pop (+0.00)
      - mood match: happy (+0.15)

------------------------------------------------------------------------
#5  Island Breeze  by Jah Sunrise  [reggae/happy]
    Score: 0.47 / 1.00   [#########           ]
    Why:
      - energy closeness 0.08 (song 0.58 vs target 1.50) (+0.02)
      - valence closeness 0.96 (song 0.86 vs target 0.90) (+0.29)
      - acousticness closeness 0.10 (song 0.40 vs target -0.50) (+0.01)
      - genre mismatch: reggae vs pop (+0.00)
      - mood match: happy (+0.15)

========================================================================
```

### Dead Center - Top 5

```
========================================================================
                          DEAD CENTER - TOP 5                           
========================================================================
Tests:   every numeric target is 0.5, so many songs should tie
Profile: genre='jazz', mood='relaxed', energy=0.5, valence=0.5, acousticness=0.5

------------------------------------------------------------------------
#1  Coffee Shop Stories  by Slow Stereo  [jazz/relaxed]
    Score: 0.86 / 1.00   [#################   ]
    Why:
      - energy closeness 0.87 (song 0.37 vs target 0.50) (+0.26)
      - valence closeness 0.79 (song 0.71 vs target 0.50) (+0.24)
      - acousticness closeness 0.61 (song 0.89 vs target 0.50) (+0.06)
      - genre match: jazz (+0.15)
      - mood match: relaxed (+0.15)

------------------------------------------------------------------------
#2  Late Set Smoke  by Fern & Ash  [jazz/moody]
    Score: 0.79 / 1.00   [################    ]
    Why:
      - energy closeness 0.95 (song 0.45 vs target 0.50) (+0.28)
      - valence closeness 0.95 (song 0.45 vs target 0.50) (+0.28)
      - acousticness closeness 0.70 (song 0.80 vs target 0.50) (+0.07)
      - genre match: jazz (+0.15)
      - mood mismatch: moody vs relaxed (+0.00)

------------------------------------------------------------------------
#3  Dust Road Home  by Willow Creek Band  [country/relaxed]
    Score: 0.77 / 1.00   [###############     ]
    Why:
      - energy closeness 0.98 (song 0.48 vs target 0.50) (+0.29)
      - valence closeness 0.82 (song 0.68 vs target 0.50) (+0.25)
      - acousticness closeness 0.76 (song 0.74 vs target 0.50) (+0.08)
      - genre mismatch: country vs jazz (+0.00)
      - mood match: relaxed (+0.15)

------------------------------------------------------------------------
#4  Midnight Coding  by LoRoom  [lofi/chill]
    Score: 0.64 / 1.00   [#############       ]
    Why:
      - energy closeness 0.92 (song 0.42 vs target 0.50) (+0.28)
      - valence closeness 0.94 (song 0.56 vs target 0.50) (+0.28)
      - acousticness closeness 0.79 (song 0.71 vs target 0.50) (+0.08)
      - genre mismatch: lofi vs jazz (+0.00)
      - mood mismatch: chill vs relaxed (+0.00)

------------------------------------------------------------------------
#5  Velvet Evening  by Sade Monroe  [synthwave/romantic]
    Score: 0.62 / 1.00   [############        ]
    Why:
      - energy closeness 0.98 (song 0.52 vs target 0.50) (+0.29)
      - valence closeness 0.78 (song 0.72 vs target 0.50) (+0.23)
      - acousticness closeness 0.88 (song 0.38 vs target 0.50) (+0.09)
      - genre mismatch: synthwave vs jazz (+0.00)
      - mood mismatch: romantic vs relaxed (+0.00)

========================================================================
```

### Case/Whitespace Mismatch - Top 5

```
========================================================================
                    CASE/WHITESPACE MISMATCH - TOP 5                    
========================================================================
Tests:   'Lofi ' and 'CHILL' differ from 'lofi'/'chill' under exact matching
Profile: genre='Lofi ', mood='CHILL', energy=0.3, valence=0.55, acousticness=0.8

------------------------------------------------------------------------
#1  Library Rain  by Paper Lanterns  [lofi/chill]
    Score: 0.66 / 1.00   [#############       ]
    Why:
      - energy closeness 0.95 (song 0.35 vs target 0.30) (+0.28)
      - valence closeness 0.95 (song 0.60 vs target 0.55) (+0.29)
      - acousticness closeness 0.94 (song 0.86 vs target 0.80) (+0.09)
      - genre mismatch: lofi vs Lofi  (+0.00)
      - mood mismatch: chill vs CHILL (+0.00)

------------------------------------------------------------------------
#2  Focus Flow  by LoRoom  [lofi/focused]
    Score: 0.66 / 1.00   [#############       ]
    Why:
      - energy closeness 0.90 (song 0.40 vs target 0.30) (+0.27)
      - valence closeness 0.96 (song 0.59 vs target 0.55) (+0.29)
      - acousticness closeness 0.98 (song 0.78 vs target 0.80) (+0.10)
      - genre mismatch: lofi vs Lofi  (+0.00)
      - mood mismatch: focused vs CHILL (+0.00)

------------------------------------------------------------------------
#3  Midnight Coding  by LoRoom  [lofi/chill]
    Score: 0.65 / 1.00   [#############       ]
    Why:
      - energy closeness 0.88 (song 0.42 vs target 0.30) (+0.26)
      - valence closeness 0.99 (song 0.56 vs target 0.55) (+0.30)
      - acousticness closeness 0.91 (song 0.71 vs target 0.80) (+0.09)
      - genre mismatch: lofi vs Lofi  (+0.00)
      - mood mismatch: chill vs CHILL (+0.00)

------------------------------------------------------------------------
#4  Spacewalk Thoughts  by Orbit Bloom  [ambient/chill]
    Score: 0.65 / 1.00   [#############       ]
    Why:
      - energy closeness 0.98 (song 0.28 vs target 0.30) (+0.29)
      - valence closeness 0.90 (song 0.65 vs target 0.55) (+0.27)
      - acousticness closeness 0.88 (song 0.92 vs target 0.80) (+0.09)
      - genre mismatch: ambient vs Lofi  (+0.00)
      - mood mismatch: chill vs CHILL (+0.00)

------------------------------------------------------------------------
#5  Moonlit Sonata  by Elena Varga  [classical/chill]
    Score: 0.65 / 1.00   [#############       ]
    Why:
      - energy closeness 0.88 (song 0.18 vs target 0.30) (+0.26)
      - valence closeness 1.00 (song 0.55 vs target 0.55) (+0.30)
      - acousticness closeness 0.83 (song 0.97 vs target 0.80) (+0.08)
      - genre mismatch: classical vs Lofi  (+0.00)
      - mood mismatch: chill vs CHILL (+0.00)

========================================================================
```

### Empty Profile - Top 5

```
========================================================================
                         EMPTY PROFILE - TOP 5                          
========================================================================
Tests:   no preferences at all; every song should score 1.00
Profile: (empty)

------------------------------------------------------------------------
#1  Sunrise City  by Neon Echo  [pop/happy]
    Score: 1.00 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre no preference, anything works (+0.15)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#2  Midnight Coding  by LoRoom  [lofi/chill]
    Score: 1.00 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre no preference, anything works (+0.15)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#3  Storm Runner  by Voltline  [rock/intense]
    Score: 1.00 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre no preference, anything works (+0.15)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#4  Library Rain  by Paper Lanterns  [lofi/chill]
    Score: 1.00 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre no preference, anything works (+0.15)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#5  Gym Hero  by Max Pulse  [pop/intense]
    Score: 1.00 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre no preference, anything works (+0.15)
      - mood no preference, anything works (+0.15)

========================================================================
```

### Genre Only - Top 5

```
========================================================================
                           GENRE ONLY - TOP 5                           
========================================================================
Tests:   only genre given; unspecified fields count as a perfect match
Profile: genre='classical'

------------------------------------------------------------------------
#1  Moonlit Sonata  by Elena Varga  [classical/chill]
    Score: 1.00 / 1.00   [####################]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre match: classical (+0.15)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#2  Sunrise City  by Neon Echo  [pop/happy]
    Score: 0.85 / 1.00   [#################   ]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre mismatch: pop vs classical (+0.00)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#3  Midnight Coding  by LoRoom  [lofi/chill]
    Score: 0.85 / 1.00   [#################   ]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre mismatch: lofi vs classical (+0.00)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#4  Storm Runner  by Voltline  [rock/intense]
    Score: 0.85 / 1.00   [#################   ]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre mismatch: rock vs classical (+0.00)
      - mood no preference, anything works (+0.15)

------------------------------------------------------------------------
#5  Library Rain  by Paper Lanterns  [lofi/chill]
    Score: 0.85 / 1.00   [#################   ]
    Why:
      - energy closeness 1.00 (no preference, anything works) (+0.30)
      - valence closeness 1.00 (no preference, anything works) (+0.30)
      - acousticness closeness 1.00 (no preference, anything works) (+0.10)
      - genre mismatch: lofi vs classical (+0.00)
      - mood no preference, anything works (+0.15)

========================================================================
```
