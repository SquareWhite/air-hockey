# AIR HOCKEY

## Run

    npm run serve

## Why redux?

    - It's observable, so works well with RxJS
    - It collects all the state changes in one place, so it's easier to debug
    - We get redux dev tools for free

## TODO

### Game features:

-   Make puck bounce off the walls
-   Same for circles and arcs
-   Make puck move, when it collides with player
-   Add gates
-   Add score

### Bugs:

-   Circle can jump through a little space between the other circle and a wall
    Also two moving circles may collide poorly (jump through each other).
    I think this could be fixed with checks for collisions in intermediate points.
-   Try to fix all collision errors
-   Add handlers for unfixable edge-case errors (e.g. restart the game instead of blowing up)
-   Look into firefox performance issues

### Technical debt:

-   Fix markup
-   Unify different direction representations
-   TODOs
-   Refactor types: actions should be typed
-   Refactor actions, split the reducer
-   Think about module architecture
-   Unit & e2e tests
-   Documentation
-   Pretty readme

### Future ideas:

-   Rewrite the view layer using pure canvas api
-   Rewrite computationally expensive parts of the game
    (e.g. math, collisions) in rust + web assembly
