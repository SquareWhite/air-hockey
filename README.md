# AIR HOCKEY

## Run

    npm run serve

## Why redux?

    - It's observable, so works well with RxJS
    - It collects all the state changes in one place, so it's easier to debug
    - We get redux dev tools for free

## TODO

### Game features:

-   Circle should follow mouse precisely
-   Circle can jump through a little space between the other circle and a wall
    Also two moving circles may collide poorly (jump through each other).
    I think this could be fixed with checks for collisions in intermediate points.
-   Add a puck & make it possible to push it with circle
-   Puck should collide with outer walls and rounded corners. Not with the middle line
-   When puck is colliding with things, it's movement direction should change

### Technical debt:

-   Refactor if (!state) {...}
-   Render the state, and not just the circle.
    Different layers for static/dynamic stuff.
    Render diffs! If something's not moving - don't render it!
    Orrr.. maybe not. I could make reducer pure, and detect changes
    in .subscribe, sort of how react-redux does it.

-   Same for calculating collisions
-   All state should live in `model`. Magic numbers should be constants or settings
-   Refactor types
-   Think about module architecture
-   Unit & e2e tests
-   Documentation
-   Pretty readme
