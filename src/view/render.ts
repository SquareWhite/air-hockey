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

    const objects = [];
    const { circles, lines, arcs } = tree;

    for (const key in circles) {
        if (circles.hasOwnProperty(key)) {
            const circle = circles[key];
            const position = tree.positions.current[circle.position];
            objects.push(
                new Konva.Circle({
                    x: position.x,
                    y: position.y,
                    radius: circle.radius,
                    stroke: 'black',
                    strokeWidth: 1,
                    id: key
                })
            );
        }
    }

    for (const key in lines) {
        if (lines.hasOwnProperty(key)) {
            const line = lines[key];
            objects.push(
                new Konva.Line({
                    points: line.points,
                    stroke: 'black',
                    strokeWidth: 1
                })
            );
        }
    }

    for (const key in arcs) {
        if (arcs.hasOwnProperty(key)) {
            const arc = arcs[key];
            objects.push(
                new Konva.Arc({
                    ...tree.positions.current[arc.position],
                    innerRadius: arc.radius,
                    outerRadius: arc.radius,
                    angle: arc.angle,
                    rotation: arc.rotation,
                    stroke: 'black',
                    strokeWidth: 1
                })
            );
        }
    }

    mainLayer.add(...objects);
    stage.add(mainLayer);
    mainLayer.draw();
};

export const updateTree = (diff: StateTree) => {
    if (!diff) {
        return;
    }

    const id = 'circle';
    const circle = diff.circles[id];
    const newPosition = diff.positions.current[circle.position];

    const player = mainLayer.findOne((node: Node) => node.attrs.id === id);
    player.absolutePosition(newPosition);
    mainLayer.draw();
};
