# AIR HOCKEY

## Run

    npm run serve

## Why redux?

    - It's observable, so works well with RxJS
    - It collects all the state changes in one place, so it's easier to debug
    - We get redux dev tools for free

## TODO

### Game features

    - Add gates
    - Add score
    - Add beginning and end states for the game
    - Improve opponent's ai
    - Improve the UI

### Bugs

    - Puck can nail circle into two corners.
    - When you hit the puck from above, the circle appears to teleport up
    - You can hit the puck through the middle line
    - Look into firefox performance issues
    - denormalize doesn't get return type correctly

### Technical debt

    - Fix markup
    - TODOs
    - Refactor types: actions should be typed
    - Refactor actions, split the reducer
    - Think about module architecture
    - Unit & e2e tests
    - Documentation
    - Pretty readme

### Future ideas

    - Make the game start by inserting a coin?
      (game field lights up, friction for the puck changes, sound of an air pump starts)
    - Rewrite the view layer using pure canvas api
    - Rewrite computationally expensive parts of the game
      (e.g. math, collisions) in rust + web assembly
