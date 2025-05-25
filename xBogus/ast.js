/*
@Author: Aloha
@Time: 2025/5/25 19:58
@ProjectName: dy_ast
@FileName: ast.py
@Software: PyCharm
*/

const files = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const NodePath = require("@babel/traverse").NodePath;


class Bogus {
    constructor(filename, save_path) {
        this.ast = parser.parse(files.readFileSync(`./${filename}.js`, "utf-8"));
        this.save_path = save_path;
        this.stringPool = [];
        this.stringPoolList = null;
        this.countValue = null;
        this.otr = null;
        this.transFunc = null;
        this.transFuncName = null;
        this.transCode = null;
        this.varName = null
    }

    save_file() {
        const {code: newCode} = generator(this.ast);
        files.writeFileSync(
            `./${this.save_path}.js`,
            newCode,
            "utf-8"
        );
    }

    fix_code() {
        let objn = {};

        function isConstantExpr(node) {
            if (types.isNumericLiteral(node)) return true;
            if (types.isUnaryExpression(node)) return isConstantExpr(node.argument);
            if (types.isBinaryExpression(node)) {
                return isConstantExpr(node.left) && isConstantExpr(node.right);
            }
            return false;
        }

        function HexLiteral(code) {
            return code.replace(/(_0x[a-zA-Z0-9]+)\((\d+)\)/g, (_, funcName, number) => {
                const hex = '0x' + parseInt(number, 10).toString(16);
                return `${funcName}(${hex})`;
            });
        }

        traverse(this.ast, {
            Literal(path) {
                const node = path.node;
                if (!types.isStringLiteral(node)) return;
                if (typeof node.value !== "string") return;
                if (!(node.extra.raw.includes('\\x'))) return;
                const decoded = eval(node.extra.raw);
                path.replaceWith(types.stringLiteral(decoded));
                path.skip()
            }
        });
        traverse(this.ast, {
            BinaryExpression(path) {
                if (!isConstantExpr(path.node)) return;

                const code = generator(path.node).code;
                try {
                    const result = eval(code);
                    path.replaceWith(types.numericLiteral(result));
                } catch (e) {
                    console.log("Eval failed:", code);
                }
            }
        });
        traverse(this.ast, {
            Literal(path) {
                let {parentPath, node} = path;
                if (!types.isNumericLiteral(node)) return;
                if (!types.isObjectProperty(parentPath.node)) return;
                if (types.isCallExpression(parentPath.parentPath.parent)) return;
                if (parentPath.parentPath.parent.id === undefined) return;
                let objNumLit = parentPath.parentPath.parent.id.name;
                let objs = {};
                parentPath.parentPath.parent.init.properties.forEach(res => {
                    if (!types.isNumericLiteral(res.value)) return;
                    objs[res.key.name] = res.value.extra.raw
                });
                objn[objNumLit] = objs;
            }
        });
        traverse(this.ast, {
            MemberExpression: (path) => {
                let {object, property} = path.node;
                if (!types.isIdentifier(object)) return;
                if (!types.isIdentifier(property)) return;
                let objName = object.name;
                if (!objn[objName]) return;
                let objValue = objn[objName][property.name];
                let num = parseInt(objValue, 16);
                if (objValue === undefined) return;
                const node = types.numericLiteral(num);
                node.extra = {raw: objValue, rawValue: num};
                path.replaceWith(node);
            }
        });
        traverse(this.ast, {
            CallExpression: (path) => {
                let {parent, node} = path;
                if (!types.isVariableDeclarator(parent)) return;
                let {callee, arguments: args} = node;
                if (!types.isIdentifier(callee)) return;
                if (callee.name !== 'eval') return;
            }
        })
    }

    convert_code() {
        let fn, sfn, func, strFunc, initFunc, initFuncName = 'g';
        traverse(this.ast, {
            CallExpression: (path) => {
                let {callee, arguments: args} = path.node;
                if (!types.isIdentifier(callee)) return;
                if (args.length !== 2) return;
                fn = callee.name;
                this.transFuncName = fn;
                path.stop()
            }
        });
        traverse(this.ast, {
            FunctionDeclaration: (path) => {
                let {id, params, body} = path.node;
                if (id.name !== fn) return;
                if (params.length === 0) return;
                func = generator(path.node).code;
                this.transFunc = func;
                sfn = body.body[0].declarations[0].init.callee.name;
                this.countValue = eval(generator(body.body[body.body.length - 1].argument.expressions[0].right.body.body[0].expression.right.right).code);
                this.otr = body.body[body.body.length - 1].argument.expressions[0].right.body.body[0].expression.right.operator
            }
        });
        traverse(this.ast, {
            FunctionDeclaration: (path) => {
                let {id, params, body} = path.node;
                if (id.name !== sfn) return;
                strFunc = generator(path.node).code;
                const ay = body.body[0].declarations[0].init.elements;
                ay.forEach(res => {
                    this.stringPool.push(res.value)
                })
            }
        });
        // init
        traverse(this.ast, {
            CallExpression: (path) => {
                let {parent, node} = path;
                if (!types.isExpressionStatement(parent)) return;
                let {callee, arguments: args} = node;
                if (!types.isFunctionExpression(callee)) return;
                if (args.length !== 2) return;
                let {id, params, body} = callee;
                if (id !== null) return;
                if (params.length === 0) return;
                if (!types.isBlockStatement(body)) return;
                if (!types.isWhileStatement(body.body[body.body.length - 1])) return;
                path.node.callee.id = types.identifier(initFuncName);
                const retValue = body.body[0].declarations[body.body[0].declarations.length - 1].id.name;
                const returnNode = types.returnStatement(types.identifier(retValue));
                const run = generator(types.expressionStatement(types.callExpression(types.identifier(initFuncName), args))).code;
                body.body.push(returnNode);
                const f = types.functionDeclaration(path.node.callee.id, params, body);
                initFunc = generator(f).code;
                initFunc = func + '\n' + strFunc + '\n' + initFunc + '\n' + run;
                this.stringPool = eval(initFunc);
                this.stringPoolList = JSON.stringify(this.stringPool);
                this.transCode = `function ${sfn}(){return ${this.stringPoolList}}` + '\n' + this.transFunc + '\n' + this.transFuncName
            }
        })
    }

    trans_code() {
        traverse(this.ast, {
            CallExpression: (path) => {
                let {callee, arguments: args} = path.node;
                if (!types.isIdentifier(callee)) return;
                if (!types.isNumericLiteral(args[0])) return;
                if (args[0].extra === undefined) return;
                const codeValue = args[0].extra.raw;
                if (!(codeValue.includes('0x'))) return;
                const code = eval(this.transCode + `(${args[0].value})`);
                if (code === undefined) return;
                const decode = types.stringLiteral(code);
                path.replaceWith(decode);
            }
        })
    }

    count_code() {
        traverse(this.ast, {
            BinaryExpression(path) {
                if (path.node.operator !== '+') return;

                const result = path.evaluate();
                if (result.confident && typeof result.value === 'string') {
                    path.replaceWith(types.stringLiteral(result.value));
                }
            }
        });
    }

    block_code() {
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

    final_code() {
        traverse(this.ast, {
            TryStatement: (path) => {
                let body = path.node;
                path.replaceWithMultiple(body.block.body)
            }
        });
        traverse(this.ast, {
            ForStatement: (path) => {
                let {init, test, body} = path.node;
                if (!types.isVariableDeclaration(init)) return;
                if (test !== null) return;
                if (!types.isVariableDeclaration(body.body[0])) return;
                this.varName = body.body[0].declarations[0].id.name;
                path.stop()
            }
        });
        traverse(this.ast, {
            ConditionalExpression: (path) => {
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
        });
        traverse(this.ast, {
            ExpressionStatement: (path) => {
                let {expression} = path.node;
                if (!types.isAssignmentExpression(expression)) return;
                let {left, operator, right} = expression;
                if (!types.isMemberExpression(left)) return;
                if (operator !== '=') return;
                if (!types.isLogicalExpression(right)) return;
                let code = generator(path.node).code;
                if (!code.includes(this.varName)) return;
                const rightValue = right.right.left.left.value;
                const leftValue = right.left.right.value;
                const edcTest = types.binaryExpression('===', types.numericLiteral(rightValue + 1), types.identifier(this.varName));
                const edc_con = types.expressionStatement(types.assignmentExpression('=', left, types.nullLiteral()));
                const edc = types.ifStatement(edcTest, types.blockStatement([edc_con]), null);
                const rfvTest = types.binaryExpression('===', types.numericLiteral(rightValue), types.identifier(this.varName));
                const rfv_con = types.expressionStatement(types.assignmentExpression('=', left, types.booleanLiteral(false)));
                const rfv = types.ifStatement(rfvTest, types.blockStatement([rfv_con]), types.blockStatement([edc]));
                const tgbTest = types.binaryExpression('===', types.numericLiteral(leftValue - 1), types.identifier(this.varName));
                const tgb_con = types.expressionStatement(types.assignmentExpression('=', left, types.booleanLiteral(true)));
                const tgb = types.ifStatement(tgbTest, types.blockStatement([tgb_con]), types.blockStatement([rfv]));
                path.replaceWith(tgb);
                path.skip()
            }
        });
        traverse(this.ast, {
            SequenceExpression(path) {
                const parent = path.parent;
                if (!types.isExpressionStatement(parent)) return;
                const expressions = path.node.expressions;
                if (expressions.length < 2) return;
                const newStatements = expressions.map(expr => types.expressionStatement(expr));
                path.parentPath.replaceWithMultiple(newStatements);
                path.skip();
            }
        })
    }


    start() {
        this.fix_code();
        this.convert_code();
        this.trans_code();
        this.count_code();
        this.block_code();
        this.final_code();
        this.save_file();
    }

}

console.time('处理完毕，耗时');

let xb_ast = new Bogus('fullcode', 'decode');
xb_ast.start();


console.timeEnd('处理完毕，耗时');


