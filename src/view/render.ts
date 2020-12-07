import Konva from 'konva';
import {
    StateTree,
    FIELD_MARGIN,
    FIELD_WIDTH,
    FIELD_HEIGHT
} from '../model/initial-state';
import { Node } from 'konva/types/Node';
import { denormalize } from '../model/denormalize';
import { Shape } from 'konva/types/Shape';

const stage = new Konva.Stage({
    container: 'container', // id of container <div>
    width: FIELD_WIDTH + FIELD_MARGIN * 2,
    height: FIELD_HEIGHT + FIELD_MARGIN * 2
});
const mainLayer = new Konva.Layer();

export const renderTree = (tree: StateTree) => {
    mainLayer.removeChildren();

    const objects: Shape[] = [];

    denormalize(tree, tree.circles).forEach((circle) =>
        objects.push(
            new Konva.Circle({
                ...circle.position,
                radius: circle.radius,
                stroke: 'black',
                strokeWidth: 1,
                id: circle.id
            })
        )
    );

    denormalize(tree, tree.lines).forEach((line) =>
        objects.push(
            new Konva.Line({
                points: line.points,
                stroke: 'black',
                strokeWidth: 1
            })
        )
    );

    denormalize(tree, tree.arcs).forEach((arc) =>
        objects.push(
            new Konva.Arc({
                ...arc.position,
                innerRadius: arc.radius,
                outerRadius: arc.radius,
                angle: arc.angle,
                rotation: arc.rotation,
                stroke: 'black',
                strokeWidth: 0.5
            })
        )
    );

    mainLayer.add(...objects);
    stage.add(mainLayer);
    mainLayer.draw();
};

export const updateTree = (diff: StateTree) => {
    const circle = denormalize(diff, diff.circles.circle);

    const player = mainLayer.findOne(
        (node: Node) => node.attrs.id === circle.id
    );
    player.absolutePosition(circle.position);
    mainLayer.draw();
};
