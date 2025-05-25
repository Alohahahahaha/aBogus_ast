/*
@Author: Aloha
@Time: 2025/5/18 13:49
@ProjectName: aBogus_ast
@FileName: ast.py
@Software: PyCharm
*/

const files = require('fs');
const {minify} = require("terser");
const types = require("@babel/types");
const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const NodePath = require("@babel/traverse").NodePath;


class Bogus {
    constructor(filename, outputName) {
        this.ast = parser.parse(files.readFileSync(`./${filename}.js`, "utf-8"));
        this.outputName = outputName;
        this.mainSwitchValue = '';
        this.mainFunc = ''
    }

    save_file() {
        const {code: newCode} = generator(this.ast);

        files.writeFileSync(`./${this.outputName}.js`, newCode, "utf-8");
    }

    lll() {
        traverse(this.ast, {
            ConditionalExpression(path) {
                let {parentPath, node} = path;
                let {test, consequent, alternate} = node;
                if (types.isExpressionStatement(parentPath)) {
                    if (!types.isExpressionStatement(consequent)) {
                        consequent = types.blockStatement([types.expressionStatement(consequent)]);
                    }
                    if (!types.isExpressionStatement(alternate)) {
                        alternate = types.blockStatement([types.expressionStatement(alternate)]);
                    }
                    parentPath.replaceWith(types.ifStatement(test, consequent, alternate));
                }
            }
        })
    }

    pcp() {
        const wrapIfStatement = (path) => {
            const node = path.node;
            if (!types.isBlockStatement(node.consequent)) {
                node.consequent = types.blockStatement([node.consequent]);
            }

            if (node.alternate) {
                if (types.isIfStatement(node.alternate)) {
                    wrapIfStatement({node: node.alternate});
                } else if (!types.isBlockStatement(node.alternate)) {
                    node.alternate = types.blockStatement([node.alternate]);
                }
            }
        };

        traverse(this.ast, {
            "ForStatement|WhileStatement|ForInStatement|ForOfStatement|DoWhileStatement"(path) {
                if (!types.isBlockStatement(path.node.body)) {
                    path.node.body = types.blockStatement([path.node.body]);
                }
            },
            IfStatement(path) {
                wrapIfStatement(path);
            }
        });
    }

    opq(mainFunc, mainSwitchValue) {
        traverse(mainFunc.node, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isBinaryExpression(test)) return;
                if (test.operator === '===') return;
                if (!types.isIdentifier(test.left)) return;
                if (test.left.name !== mainSwitchValue) return;
                if (!types.isNumericLiteral(test.right)) return;
                if (test.operator === '<') {
                    var newTest = types.binaryExpression('>', types.numericLiteral(test.right.value), types.identifier(test.left.name))
                } else if (test.operator === '>') {
                    var newTest = types.binaryExpression('<', types.numericLiteral(test.right.value), types.identifier(test.left.name))
                }
                const statement = types.ifStatement(newTest, consequent, alternate);
                path.replaceWith(statement);
            }
        }, mainFunc.scope)
    }

    usb(mainFunc, mainSwitchValue) {
        traverse(mainFunc.node, {
            ExpressionStatement: (path) => {
                if (!types.isAssignmentExpression(path.node.expression)) return;
                let {left, operator, right} = path.node.expression;
                if (operator !== '=') return;
                if (!types.isConditionalExpression(right)) return;
                if (!types.isBinaryExpression(right.test)) return;
                if (!types.isIdentifier(right.test.right)) return;
                if (!types.isNumericLiteral(right.test.left)) return;
                if (right.test.right.name !== mainSwitchValue) return;
                const con = types.expressionStatement(types.assignmentExpression('=', left, right.consequent));
                const alt = types.expressionStatement(types.assignmentExpression('=', left, right.alternate));
                const altTest = types.binaryExpression('===', types.numericLiteral(right.test.left.value + 1), types.identifier(right.test.right.name));
                // const altIfStatement = types.ifStatement(altTest, types.blockStatement([alt]), null);
                const ifStatement = types.ifStatement(right.test, types.blockStatement([con]), types.blockStatement([alt]));
                path.replaceWith(ifStatement);
            }
        }, mainFunc.scope)
    }

    qaz(mainFunc, mainSwitchValue, cases) {
        traverse(mainFunc.node, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isBinaryExpression(test)) return;
                if (!types.isNumericLiteral(test.left)) return;
                if (!types.isIdentifier(test.right) || test.right.name !== mainSwitchValue) return;
                if (path.node.isHandle) return;
                if (test.operator !== '===') {
                    if (consequent.body.length === 1 && types.isIfStatement(consequent.body[0])) return;
                    if (consequent.body.length !== 1 && types.isIfStatement(consequent.body[0])) {
                        const altTest = types.binaryExpression('===', types.numericLiteral(consequent.body[0].test.left.value + 1), types.identifier(test.right.name));
                        const altStatement = types.ifStatement(altTest, types.blockStatement([consequent.body[consequent.body.length - 1]]), null);
                        altStatement.isHandle = true;
                        altStatement.isHandleLine = 129;
                        const conStatement = types.ifStatement(consequent.body[0].test, consequent.body[0].consequent, types.blockStatement([altStatement]));
                        conStatement.isHandle = true;
                        conStatement.isHandleLine = 132;
                        const ygd = types.binaryExpression('===', types.numericLiteral(alternate.alternate.test.left.value + 1), types.identifier(test.right.name));
                        const ujn = types.ifStatement(ygd, alternate.alternate.alternate, null);
                        ujn.isHandle = true;
                        ujn.isHandleLine = 137;
                        const qsd = types.ifStatement(alternate.alternate.test, alternate.alternate.consequent, types.blockStatement([ujn]));
                        qsd.isHandle = true;
                        qsd.isHandleLine = 140;
                        const att = types.binaryExpression('===', types.numericLiteral(alternate.test.left.value - 1), types.identifier(test.right.name));
                        const tgv = types.ifStatement(att, alternate.consequent, types.blockStatement([qsd]));
                        tgv.isHandle = true;
                        tgv.isHandleLine = 144;
                        const bsu = types.ifStatement(test, conStatement, types.blockStatement([tgv]));
                        bsu.isHandle = true;
                        bsu.isHandleLine = 147;
                        bsu.tvb = 1;
                        path.replaceWith(bsu);
                        cases.push(path);
                        return;
                    }
                    if (alternate === null) {
                        const newTest = types.binaryExpression('===', types.numericLiteral(test.left.value - 1), types.identifier(test.right.name));
                        const statement = types.ifStatement(newTest, consequent, null);
                        statement.isHandle = true;
                        statement.isHandleLine = 140;
                        path.replaceWith(statement);
                        cases.push(path);
                        return;
                    }
                    if (alternate.hasOwnProperty('body')) {
                        let {test, consequent, alternate} = path.node;
                        if (test.operator === '===') return;
                        if (test.right.name !== mainSwitchValue) return;
                        if (alternate.body[0].test.operator === '!==') {
                            const nt = types.binaryExpression('===', types.numericLiteral(test.left.value - 1), types.identifier(test.right.name));
                            const bd = alternate.body.at(-1);
                            const altTest = types.binaryExpression('===', types.numericLiteral(alternate.body[0].test.left.value), types.identifier(test.right.name));
                            const altIfStatement = types.ifStatement(altTest, types.blockStatement([bd]), null);
                            altIfStatement.isHandle = true;
                            altIfStatement.isHandleLine = 155;
                            const conTest = types.binaryExpression('===', types.numericLiteral(alternate.body[0].test.left.value + 1), types.identifier(test.right.name));
                            const conIfStatement = types.ifStatement(conTest, alternate.body[0].consequent, types.blockStatement([altIfStatement]));
                            conIfStatement.isHandle = true;
                            conIfStatement.isHandleLine = 159;
                            const statement = types.ifStatement(nt, consequent, types.blockStatement([conIfStatement]));
                            statement.isHandle = true;
                            statement.isHandleLine = 162;
                            path.replaceWith(statement);
                            cases.push(path);
                            return;
                        }
                        const newTest = types.binaryExpression('===', types.numericLiteral(test.left.value - 1), types.identifier(test.right.name));
                        const altTest = types.binaryExpression('===', types.numericLiteral(test.left.value + 1), types.identifier(test.right.name));
                        const aa = alternate.body[0].alternate;
                        const altStatement = aa !== null ? types.ifStatement(altTest, alternate.body[0].alternate, null) : null;
                        aa !== null ? (altStatement.isHandle = true, altStatement.isHandleLine = 172) : 0;
                        const conStatement = aa !== null ? types.ifStatement(alternate.body[0].test, alternate.body[0].consequent, types.blockStatement([altStatement])) : types.ifStatement(alternate.body[0].test, alternate.body[0].consequent, null);
                        conStatement.isHandle = true;
                        conStatement.isHandleLine = 175;
                        const statement = types.ifStatement(newTest, consequent, types.blockStatement([conStatement]));
                        statement.isHandle = true;
                        statement.isHandleLine = 178;
                        path.replaceWith(statement);
                        cases.push(path);
                        return;
                    }
                    if (!types.isIfStatement(alternate)) {
                        const upTest = types.binaryExpression('===', types.numericLiteral(test.left.value - 1), types.identifier(test.right.name));
                        const cpc = alternate.alternate === null ? null : types.isBlockStatement(alternate.alternate) ? alternate.alternate : types.blockStatement([alternate.alternate]);
                        const altNum = alternate.test.left.value + 1;
                        const altTest = types.binaryExpression('===', types.numericLiteral(altNum), types.identifier(mainSwitchValue));
                        const altIfStatement = cpc !== null ? types.ifStatement(altTest, cpc, null) : null;
                        altIfStatement.isHandle = true;
                        altIfStatement.isHandleLine = 190;
                        const elseIfStatement = types.ifStatement(alternate.test, alternate.consequent, types.blockStatement([altIfStatement]));
                        elseIfStatement.isHandle = true;
                        elseIfStatement.isHandleLine = 192;
                        const statement = types.ifStatement(upTest, consequent, elseIfStatement);
                        statement.isHandle = true;
                        statement.isHandleLine = 196;
                        path.replaceWith(statement);
                        cases.push(path);
                        return;
                    }
                    const newTest = types.binaryExpression('===', types.numericLiteral(test.left.value - 1), types.identifier(test.right.name));
                    const altTest = types.binaryExpression('===', types.numericLiteral(alternate.test.left.value + 1), types.identifier(test.right.name));
                    const altStatement = types.ifStatement(altTest, alternate.alternate, null);
                    altStatement.isHandle = true;
                    altStatement.isHandleLine = 205;
                    const conStatement = types.ifStatement(alternate.test, alternate.consequent, types.blockStatement(([altStatement])));
                    conStatement.isHandle = true;
                    conStatement.isHandleLine = 208;
                    const statement = types.ifStatement(newTest, consequent, types.blockStatement([conStatement]));
                    statement.isHandle = true;
                    statement.isHandleLine = 211;
                    path.replaceWith(statement);
                    cases.push(path);
                    return;
                }
                const cpc = alternate === null ? null : types.isBlockStatement(alternate) ? alternate : types.blockStatement([alternate]);
                const elseNum = test.left.value + 1;
                const elseTest = types.binaryExpression('===', types.numericLiteral(elseNum), types.identifier(mainSwitchValue));
                const elseIfStatement = cpc === null ? null : types.ifStatement(elseTest, cpc, null);
                const newIfStatement = elseIfStatement === null ? types.ifStatement(test, consequent, elseIfStatement) : types.ifStatement(test, consequent, types.blockStatement([elseIfStatement]));
                path.replaceWith(newIfStatement);
                path.skip();
                cases.push(path)
            }
        }, mainFunc.scope);
    }

    jkl() {
        const cases = [];
        traverse(this.ast, {
            ForStatement: (path) => {
                const {init, test, body} = path.node;
                if (init !== null || test !== null) return;
                if (!types.isBlockStatement(body)) return;
                if (body.body.length !== 2) return;
                this.mainFunc = path.getFunctionParent();
                const [declStmt, ifStmt] = body.body;

                if (!types.isVariableDeclaration(declStmt) || !types.isIfStatement(ifStmt)) return;

                const varName = declStmt.declarations[0].id.name;
                this.mainSwitchValue = varName;

                this.opq(this.mainFunc, this.mainSwitchValue);
                this.usb(this.mainFunc, this.mainSwitchValue);
                this.qaz(this.mainFunc, this.mainSwitchValue, cases);

                if (cases.length >= 2) {
                    const case_switch = [];
                    cases.forEach(statement => {
                        let {test, consequent, alternate} = statement.node;
                        if (statement.node.isHandle && statement.node.tvb === 1) {
                            consequent.consequent.body.push(types.breakStatement());
                            const sc = types.switchCase(types.numericLiteral(consequent.test.left.value), consequent.consequent.body);
                            case_switch.push(sc);
                            consequent.alternate.body[0].consequent.body.push(types.breakStatement());
                            const scc = types.switchCase(types.numericLiteral(consequent.alternate.body[0].test.left.value), consequent.alternate.body[0].consequent.body);
                            case_switch.push(scc);
                            alternate.body[0].consequent.body.push(types.breakStatement());
                            const sbc = types.switchCase(types.numericLiteral(alternate.body[0].test.left.value), alternate.body[0].consequent.body);
                            case_switch.push(sbc);
                            alternate.body[0].alternate.body[0].consequent.body.push(types.breakStatement());
                            const ssc = types.switchCase(types.numericLiteral(alternate.body[0].alternate.body[0].test.left.value), alternate.body[0].alternate.body[0].consequent.body);
                            case_switch.push(ssc);
                            alternate.body[0].alternate.body[0].alternate.body[0].consequent.body.push(types.breakStatement());
                            const soc = types.switchCase(types.numericLiteral(alternate.body[0].alternate.body[0].alternate.body[0].test.left.value), alternate.body[0].alternate.body[0].alternate.body[0].consequent.body);
                            case_switch.push(soc);
                            return;
                        }
                        if (statement.node.isHandle && statement.node.tvb === undefined) {
                            consequent.body.push(types.breakStatement());
                            const sc = types.switchCase(types.numericLiteral(test.left.value), consequent.body);
                            case_switch.push(sc);
                            if (alternate === null) return;
                            if (types.isIfStatement(alternate.body[0])) {
                                alternate.body[0].consequent.body.push(types.breakStatement());
                                const sa = types.switchCase(types.numericLiteral(alternate.body[0].test.left.value), alternate.body[0].consequent.body);
                                case_switch.push(sa);
                                if (alternate.body[0].alternate === null) return;
                                alternate.body[0].alternate.body[0].consequent.body.push(types.breakStatement());
                                const saa = types.switchCase(types.numericLiteral(alternate.body[0].alternate.body[0].test.left.value), alternate.body[0].alternate.body[0].consequent.body);
                                case_switch.push(saa);
                                return;
                            }
                            return;
                        }
                        consequent.body.push(types.breakStatement());
                        const switchCase_c = types.switchCase(types.numericLiteral(test.left.value), consequent.body);
                        case_switch.push(switchCase_c);
                        if (types.isIfStatement(alternate)) {
                            alternate.consequent.body.push(types.breakStatement());
                            const switchCase_a = types.switchCase(types.numericLiteral(alternate.test.left.value), alternate.consequent.body);
                            case_switch.push(switchCase_a);
                            alternate.alternate.body[0].consequent.body.push(types.breakStatement());
                            const switchCase_a_a = types.switchCase(types.numericLiteral(alternate.alternate.body[0].test.left.value), alternate.alternate.body[0].consequent.body);
                            case_switch.push(switchCase_a_a);
                            return
                        }
                        const switchCase_a = alternate !== null ? (alternate.body[0].consequent.body.push(types.breakStatement()), types.switchCase(types.numericLiteral(alternate.body[0].test.left.value), alternate.body[0].consequent.body)) : 0;
                        switchCase_a !== 0 ? case_switch.push(switchCase_a) : 0;
                    });
                    const switchNode = types.switchStatement(types.identifier(varName), case_switch);

                    body.body = [declStmt, switchNode];
                }
            }
        });
    }

    wbg() {
        traverse(this.mainFunc.node, {
            ExpressionStatement: (path) => {
                let {expression} = path.node;
                if (!types.isSequenceExpression(expression)) return;
                const tsd = [];
                expression.expressions.forEach(r => {
                    const es = types.expressionStatement(r);
                    tsd.push(es)
                });
                path.replaceWithMultiple(tsd)
            }
        }, this.mainFunc.scope)
    }

    start() {
        this.lll();
        this.pcp();
        this.jkl();
        this.wbg();
        this.save_file()
    }
}


console.time('处理完毕，耗时');

let ab_ast = new Bogus("bdms", "decode");
ab_ast.start();

console.timeEnd('处理完毕，耗时');



