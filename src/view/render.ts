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

    const rect = new Konva.Circle({
        x: circle.x,
        y: circle.y,
        radius: circle.radius,
        fill: 'red',
        id: circle.id
    });
    const rect2 = new Konva.Circle({
        x: otherCircle.x,
        y: otherCircle.y,
        radius: otherCircle.radius,
        fill: 'green',
        id: otherCircle.id
    });

    const lines = gameField.lines.map(
        (line) =>
            new Konva.Line({
                points: line.points,
                stroke: 'black',
                strokeWidth: 1
            })
    );

    mainLayer.add(rect);
    mainLayer.add(rect2);
    mainLayer.add(...lines);
    stage.add(mainLayer);
    mainLayer.draw();
};

export const updateTree = (diff: StateTree) => {
    if (!diff) {
        return;
    }

    const { x, y, id } = diff.circle;

    const rect = mainLayer.findOne((node: Node) => node.attrs.id === id);
    rect.absolutePosition({ x, y });
    mainLayer.draw();
};
