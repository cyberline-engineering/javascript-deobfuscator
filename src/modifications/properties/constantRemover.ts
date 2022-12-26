import Modification from '../../modification';
import * as Shift from 'shift-ast';
import isValid from 'shift-validator';
import { traverse } from '../../helpers/traverse';
import TraversalHelper from '../../helpers/traversalHelper';

export default class ConstantRemover extends Modification {
    /**
     * Creates a new modification.
     * @param ast The AST.
     */
    constructor(ast: Shift.Script) {
        super('Replace and Remove constant variable', ast);
    }

    /**
     * Executes the modification.
     */
    execute(): void {
        this.simplifyComputedMembers(this.ast);
    }

    /**
     * Simplifies all computed members to static members within a given node.
     * @param node The AST node.
     */
    private simplifyComputedMembers(node: Shift.Node): void {
        const self = this;

        traverse(node, {
            enter(node: Shift.Node, parent: Shift.Node) {
                if (self.isVariableLiteralMember(node)) {
                    const replacement = new Shift.StaticMemberExpression({
                        object: (node as any).object,
                        property: (node as any).expression.value
                    });
                    self.simplifyComputedMembers(replacement);

                    if (isValid(replacement)) {
                        TraversalHelper.replaceNode(parent, node, replacement);
                    }
                }
            }
        });
    }

    /**
     * Returns whether a node is a literal declaration variable
     * and should be replace in source code by static literal
     * @param node The AST node.
     */
    private isVariableLiteralMember(node: Shift.Node): boolean {
        return (
            node.type === 'VariableDeclarator' &&
            node.init.type === 'LiteralNumericExpression'                 
        );
    }
}
