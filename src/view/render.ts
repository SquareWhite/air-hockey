import Konva from 'konva';
import {
    StateTree,
    FIELD_MARGIN,
    FIELD_WIDTH,
    FIELD_HEIGHT
} from '../model/initial-state';
import { Node } from 'konva/types/Node';

const stage = new Konva.Stage({
    container: 'container', // id of container <div>
    width: FIELD_WIDTH + FIELD_MARGIN * 2,
    height: FIELD_HEIGHT + FIELD_MARGIN * 2
});
const mainLayer = new Konva.Layer();

export const renderTree = (tree: StateTree) => {
    mainLayer.removeChildren();

    if (!tree) {
        return;
    }

    const { circle, otherCircle, gameField } = tree;

    const player = new Konva.Circle({
        x: circle.x,
        y: circle.y,
        radius: circle.radius,
        fill: 'red',
        id: circle.id
    });
    const opponent = new Konva.Circle({
        x: otherCircle.x,
        y: otherCircle.y,
        radius: otherCircle.radius,
        fill: 'green',
        id: otherCircle.id
    });

    const fieldLines = gameField.lines.map(
        (line) =>
            new Konva.Line({
                points: line.points,
                stroke: 'black',
                strokeWidth: 1
            })
    );

    const fieldRoundedCorners = gameField.arcs.map(
        (arc) =>
            new Konva.Arc({
                x: arc.x,
                y: arc.y,
                innerRadius: arc.radius,
                outerRadius: arc.radius,
                angle: arc.angle,
                rotation: arc.rotation,
                stroke: 'black',
                strokeWidth: 1
            })
    );

    mainLayer.add(player);
    mainLayer.add(opponent);
    mainLayer.add(...fieldLines);
    mainLayer.add(...fieldRoundedCorners);
    stage.add(mainLayer);
    mainLayer.draw();
};

export const updateTree = (diff: StateTree) => {
    if (!diff) {
        return;
    }

    const { x, y, id } = diff.circle;

    const player = mainLayer.findOne((node: Node) => node.attrs.id === id);
    player.absolutePosition({ x, y });
    mainLayer.draw();
};
