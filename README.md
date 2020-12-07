# AIR HOCKEY

## Run

    npm run serve

## Why redux?

    - It's observable, so works well with RxJS
    - It collects all the state changes in one place, so it's easier to debug
    - We get redux dev tools for free

## TODO

### Game features:

-   Circle can jump through a little space between the other circle and a wall
    Also two moving circles may collide poorly (jump through each other).
    I think this could be fixed with checks for collisions in intermediate points.
-   Add a puck & make it possible to push it with circle
-   Puck should collide with outer walls and rounded corners. Not with the middle line
-   When puck is colliding with things, it's movement direction should change
-   Calculate collisions for two players and a puck
-   Add gates
-   Add score

### Technical debt:

-   Fix markup
-   TODOs
-   Refactor types: actions should be typed, move types to separate files (e.g. from initial-state.ts)
    Also maybe collisions.ts shouldn't contain those type definitions
-   Think about module architecture
-   Unit & e2e tests
-   Documentation
-   Pretty readme
-   Look into firefox performance issues
