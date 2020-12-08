# AIR HOCKEY

## Run

    npm run serve

## Why redux?

    - It's observable, so works well with RxJS
    - It collects all the state changes in one place, so it's easier to debug
    - We get redux dev tools for free

## TODO

### Game features:

-   Make puck collide with walls
-   Make puck bounce off the walls
-   Same for arcs
-   Make puck collide with player and move on impact
-   Add gates
-   Add score
-   Circle can jump through a little space between the other circle and a wall
    Also two moving circles may collide poorly (jump through each other).
    I think this could be fixed with checks for collisions in intermediate points.

### Technical debt:

-   Should movements live in state tree?
-   Fix markup
-   TODOs
-   Refactor types: actions should be typed, move types to separate files (e.g. from initial-state.ts)
    Also maybe collisions.ts shouldn't contain those type definitions
-   Think about module architecture
-   Unit & e2e tests
-   Documentation
-   Pretty readme
-   Look into firefox performance issues
