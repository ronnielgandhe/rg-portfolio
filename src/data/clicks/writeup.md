## the problem

how many clicks is the wikipedia game. two articles, say pizza and albert einstein, and you get from one to the other only by clicking links. a bot does it live on the page, then you try to beat it.

the first bot i shipped reads the titles of the links on a page, scores them by shared words with the target plus a hand-written list of about 23 related-word groups and about 40 hub pages, and keeps going with the best ones. "god mode" is the same thing with a wider beam: 20 links per page instead of 8, 200 pages instead of 100. it never reads an article, never looks backward from the target, and it stops at the first path it trips over.

so the question was simple. how good is god mode actually, measured on a real benchmark? and can i train my own models that beat it?

## the strategies

the hand-written baselines, all running the exact same typescript in your browser:

- **random walk**: clicks a random unseen link. the floor.
- **keyword**: the original bot, unchanged (it is literally the game's pathfinder).
- **god mode**: the original bot, wider beam.
- **hub-first**: climb to the biggest hub you can see (united states, world war ii, england), then walk down with the keyword scorer.
- **semantic**: score links by meaning with a tiny embedding of titles, no word lists.
- **bidirectional**: search forward from the start and backward from the target ("what links here") until the two sides touch.

and mine:

- **my model**: one search, steered by a model i trained on real player clicks.
- **my model, both ends**: the god model. both-ends search where my model decides which page each side opens next.

{{chart:leaderboard}}

## the data

i did not want to hammer wikipedia with thousands of test races, and i wanted ground truth. so the benchmark runs on [wikispeedia](https://snap.stanford.edu/data/wikispeedia.html) from stanford snap: a frozen 4,604-article slice of wikipedia with all 119,882 links, the true shortest path between every pair of articles, and 51,318 games real people finished (plus 24,875 they gave up on). it comes from robert west and jure leskovec, "human wayfinding in information networks" (www 2012), and west, pineau and precup, "wikispeedia: an online game for inferring semantic distances between concepts" (ijcai 2009). the article content is wikipedia, cc by-sa.

i split the 4,604 articles 70 / 15 / 15 into train, validation and test **by article**, not by pair, so every test is on articles a model never saw. the 450 test races (150 easy, 150 medium, 150 hard; easy means the true shortest path is 2 clicks, medium 3, hard 4 or more) use a start and a target from the held-out test articles. about half of each bucket are pairs real people played, 226 pairs from 467 human games, so humans get a line on the chart. every knob, including which model ships, got picked on 120 separate validation races. the test races were never used to tune anything.

the harness runs the same strategy code as the page, it just swaps the wikipedia fetcher for one that reads the graph from memory. keyword and god mode are the game's own pathfinder with its fetch pointed at the graph, not a copy.

## the models

every model answers one question: given a link title and the target title, how many clicks away is the target? the search then opens whatever looks closest.

they all share one shape, small on purpose so it runs in a browser with plain typescript math:

- every title becomes a bag of tokens: its whole words plus every three-letter chunk of each word ("<vo", "vol", "olc" and so on), hashed into buckets.
- each bucket has a small embedding. a title is the average of its tokens.
- one little layer for the link side, one for the target side, then a layer on top of [link, target, link times target, 6 hand features] that outputs clicks.
- the hand features are dumb on purpose: word overlap, chunk overlap, link word count, whether the target sits inside the link title, whether it has a number, exact match.

i trained a family of four:

- **tiny**: 4,096 buckets of 16 numbers. 67,873 parameters, 91 kb on disk, 41 seconds to train.
- **base**: 16,384 buckets of 32 numbers. 533,057 parameters, 625 kb, 97 seconds.
- **imitation**: base size, but trained on nothing except real people. 157,519 clicks from wikispeedia games, and the only lesson is "the link the player clicked should look closer than a random other link on that page". 210 seconds.
- **base + human clicks**: base, then fine-tuned on shortest paths and player clicks together. 214 seconds including the base run.

the distance models learn from 1.2 million (link, target) pairs labelled with the true shortest path, all from train articles. the player clicks are split the same way, by the article the player was heading to: 157,519 train, 30,977 validation, 34,923 test. embeddings ship as 8-bit integers with one scale per row, and quantizing changed the test numbers by nothing measurable.

## training

numpy only, no gpu, one process, two blas threads, on my laptop. huber loss on clicks for the distance models, a pairwise logistic loss for the imitation one, adam with a cosine learning rate, batch 1,024, 4,000 steps, 30% dropout on the embeddings and a little weight decay. the whole script, all four models plus five ablations plus the semantic embedding, takes 652 seconds.

{{chart:loss}}

the curves are honest about what these models are. training loss keeps falling while the error on unseen articles bottoms out early and drifts up: they memorize the 3,222 train articles. what keeps improving is the thing that matters for the game, picking the right link.

## what worked

the metric that matters is not "how close is the guess" but "does it pick a good link". so i measure next-click accuracy: stand on a random page with a held-out target, let the scorer pick its favourite link, and check whether that link is on a true shortest path. on the test articles:

- random link: 0.288
- word overlap with the target: 0.286 (validation)
- semantic embedding: 0.386
- tiny: 0.595
- base: 0.595
- base + human clicks: 0.535
- imitation: 0.523

so the distance models pick a shortest-path link about twice as often as random, on targets they never saw. and tiny ties base at an eighth of the size.

{{chart:ablations}}

the ablations (base size, validation) say where it comes from. hand features alone get 0.315. the learned embeddings are the jump to 0.561. whole words alone (0.563) and three-letter chunks alone (0.553) are both fine, and the hand features add nothing once the embeddings are there.

then the races, where it actually counts:

- **my model** (playing alone, with the imitation model) solved 82.2% of the 450 test races. god mode solved 66.4%. its paths were 0.75 clicks over optimal against god mode's 1.15, and it opened 54.0 pages on average against god mode's 85.6 (median 11 against 34). on hard races: 62.7% against 35.3%.
- the funny part: the imitation model has the worst next-click accuracy of the family and is the best solo player. copying people teaches it to head for safe, well-linked pages instead of the theoretically perfect link, and that keeps a greedy search out of dead ends. the pure distance models solo at 72.2%, with shorter paths (0.16 to 0.18 over) but more pages (81 to 85).
- **my model, both ends** solved all 450, found the true shortest path 96.2% of the time, ended 0.04 clicks over optimal on average, and opened 4.6 pages. god mode: 66.4%, 25.6% shortest, 85.6 pages. on hard races it opened 6.6 pages; god mode opened 147.3.

{{chart:tradeoff}}

## what did not

- **the raw guesses are bad.** the base model's mean error on unseen pairs is 0.75 clicks, worse than just always saying 3 (0.55), because most pairs here are 3 apart and the model spreads its guesses. it is good at ranking links against each other, not at the absolute number.
- **both-ends search does most of the work, not my model.** plain bidirectional, no model at all, also solved 450 of 450, hit the shortest path 93.8% of the time and opened 5.4 pages. my model on top takes that to 96.2% shortest and 4.6 pages: about 14% fewer pages, and 20% fewer on hard races (6.6 against 8.2). real, but the headline idea is "search from both ends".
- **which model guides both ends barely matters.** tiny, base and base + human clicks all land between 4.59 and 4.63 pages and 94 to 96% shortest. i shipped base + human clicks because it won the validation races by a hair; on the test races base did about as well (4.59 pages, 95.1% shortest).
- **the solo model still wanders on hard races.** 99 pages on average there, and 37% of hard races not solved.
- **semantic was a half win.** it solves more than god mode (77.3%) but takes the longest paths of anything with a brain (2.67 clicks over optimal). related is not the same as close.
- **hub-first barely helps** (65.3% against keyword's 63.8%), and **random walk** solves 61.8% here because a 4,604-article world flatters wandering. its paths are 49 clicks long.
- **the live check got cut short.** wikipedia's api rate-limited this network after a handful of calls. my model, both ends finished pizza to albert einstein in 3 clicks with 5 pages and mount everest to jazz in 2 clicks with 3 pages before it stopped, which is too little to call a ranking on today's wikipedia.

## the numbers

on the 450 test races (true shortest path averages 3.04 clicks):

{{chart:difficulty}}

- my model, both ends: 100% solved, 0.04 clicks over optimal, 4.6 pages opened
- bidirectional: 100% solved, 0.06 over, 5.4 pages
- my model: 82.2% solved, 0.75 over, 54.0 pages
- semantic: 77.3% solved, 2.67 over, 76.4 pages
- god mode: 66.4% solved, 1.15 over, 85.6 pages
- hub-first: 65.3% solved, 0.75 over, 48.4 pages
- keyword: 63.8% solved, 1.07 over, 49.1 pages
- random walk: 61.8% solved, 46.9 over, 107.6 pages

people, on the 226 test pairs they played: 83.7% of games finished, median 4 clicks, about 1.8 clicks over optimal. on those pairs my model, both ends was as short as or shorter than the human median 99.6% of the time.

## how to run it

the code lives in the how-many-clicks repo on the `lab` branch, in `lab/`. the strategies are the typescript files under `src/tools/clicks/strategies/` on this site, and the weights are in `public/clicks-model/`.

- `./reproduce.sh` downloads wikispeedia, builds the arrays, trains all four models, picks the shipped ones on validation races, runs the benchmark, the live check and the tests.
- `./reproduce.sh bench` reruns only the offline benchmark with the weights already shipped.
- `node --test test/` runs the strategy tests on toy graphs with known answers.

data: [wikispeedia](https://snap.stanford.edu/data/wikispeedia.html) (west and leskovec 2012; west, pineau and precup 2009). article content from [wikipedia](https://en.wikipedia.org) under [cc by-sa 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
