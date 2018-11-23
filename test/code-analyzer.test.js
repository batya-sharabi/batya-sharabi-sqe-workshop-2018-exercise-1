import assert from 'assert';
import {parseCode,itercode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    testFunctionDeclaration();
    testAssignmentExpression();
    testUpdateExpression();
    testVariableDeclaration();
    testWhileStatement();
    testForStatement();
    testIfStatement();
    testReturnStatement();
});

function testFunctionDeclaration(){
    it('is parsing a function declaration correctly', () => {
        assert.deepEqual(
            itercode(parseCode('function f() {}')),
            [{Line: 1,Type: 'function declaration',Name: 'f',Condition:'',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('function f(x,y) {}')),
            [{Line: 1,Type: 'function declaration',Name: 'f',Condition:'',Value:''},
                {Line: 1,Type: 'variable declaration',Name: 'x',Condition:'',Value:''},
                {Line: 1,Type: 'variable declaration',Name: 'y',Condition:'',Value:''}]
        );

    });
}

function testAssignmentExpression() {
    it('is parsing a assignment expression correctly', () => {
        assert.deepEqual(
            itercode(parseCode('y=(1+x)/2;')),
            [{Line: 1,Type: 'assignment expression',Name: 'y',Condition:'',Value:'(1 + x) / 2'}]
        );
        assert.deepEqual(
            itercode(parseCode('x=y[5];')),
            [{Line: 1,Type: 'assignment expression',Name: 'x',Condition:'',Value:'y[5]'}]
        );
        assert.deepEqual(
            itercode(parseCode('x=z;')),
            [{Line: 1,Type: 'assignment expression',Name: 'x',Condition:'',Value:'z'}]
        );
        assert.deepEqual(
            itercode(parseCode('x=-3;')),
            [{Line: 1,Type: 'assignment expression',Name: 'x',Condition:'',Value:'-3'}]
        );
    });
}

function testUpdateExpression() {
    it('is parsing a update expression correctly', () => {
        assert.deepEqual(
            itercode(parseCode('i++;')),
            [{Line: 1,Type: 'update expression',Name: '',Condition:'',Value:'i++'}]
        );
        assert.deepEqual(
            itercode(parseCode('++i;')),
            [{Line: 1,Type: 'update expression',Name: '',Condition:'',Value:'++i'}]
        );
    });
}

function testVariableDeclaration() {
    it('is parsing a variable declaration correctly', () => {
        assert.deepEqual(
            itercode(parseCode('let x=2;')),
            [{Line: 1,Type: 'variable declaration',Name: 'x',Condition:'',Value:2}]
        );
        assert.deepEqual(
            itercode(parseCode('let x,y,z;')),
            [{Line: 1,Type: 'variable declaration',Name: 'x',Condition:'',Value:''},
                {Line: 1,Type: 'variable declaration',Name: 'y',Condition:'',Value:''},
                {Line: 1,Type: 'variable declaration',Name: 'z',Condition:'',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('let x=1,y;')),
            [{Line: 1,Type: 'variable declaration',Name: 'x',Condition:'',Value:1},
                {Line: 1,Type: 'variable declaration',Name: 'y',Condition:'',Value:''}]
        );
    });
}

function testWhileStatement() {
    it('is parsing a while statement correctly', () => {
        assert.deepEqual(
            itercode(parseCode('while(x>5) {}')),
            [{Line: 1,Type: 'while statement',Name: '',Condition:'x > 5',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('while(true) {}')),
            [{Line: 1,Type: 'while statement',Name: '',Condition:'true',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('while(x>=5||x<3) {}')),
            [{Line: 1,Type: 'while statement',Name: '',Condition:'(x >= 5) || (x < 3)',Value:''}]
        );
    });
}

function testForStatement() {
    it('is parsing a for statement correctly', () => {
        assert.deepEqual(
            itercode(parseCode('for(i=1;i<5;i++) {}')),
            [{Line: 1,Type: 'for statement',Name: '',Condition:'i=1;i < 5;i++',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('for(let i=10;i>8;i--) {}')),
            [{Line: 1,Type: 'for statement',Name: '',Condition:'i=10;i > 8;i--',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('for(let i=1,j=5;i<5;i++) {}')),
            [{Line: 1,Type: 'for statement',Name: '',Condition:'i=1,j=5;i < 5;i++',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('for(let i=j,j=5;i<5;i++) {}')),
            [{Line: 1,Type: 'for statement',Name: '',Condition:'i=j,j=5;i < 5;i++',Value:''}]
        );
    });
}

function testIfStatement() {
    it('is parsing a if statement correctly', () => {
        assert.deepEqual(
            itercode(parseCode('if(x>y[z]) {}')),
            [{Line: 1,Type: 'if statement',Name: '',Condition:'x > y[z]',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('if (x<y[i+1])\n {x=5;}\n else if(x==y[3]) {}')),
            [{Line: 1,Type: 'if statement',Name: '',Condition:'x < y[i + 1]',Value:''},
                {Line: 2,Type: 'assignment expression',Name: 'x',Condition:'',Value:'5'},
                {Line: 3,Type: 'else if statement',Name: '',Condition:'x == y[3]',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('if (x<y[i+1])\n {x=5;}\n else y=2')),
            [{Line: 1,Type: 'if statement',Name: '',Condition:'x < y[i + 1]',Value:''},
                {Line: 2,Type: 'assignment expression',Name: 'x',Condition:'',Value:'5'},
                {Line: 3,Type: 'assignment expression',Name: 'y',Condition:'',Value:'2'}]
        );
    });
}

function testReturnStatement() {
    it('is parsing a return statement correctly', () => {
        assert.deepEqual(
            itercode(parseCode('function f()\n {return -x;}')),
            [{Line: 1,Type: 'function declaration',Name: 'f',Condition:'',Value:''},
                {Line: 2,Type: 'return statement',Name: '',Condition:'',Value:'-x'}]
        );
        assert.deepEqual(
            itercode(parseCode('function f()\n {return 3;}')),
            [{Line: 1,Type: 'function declaration',Name: 'f',Condition:'',Value:''},
                {Line: 2,Type: 'return statement',Name: '',Condition:'',Value:'3'}]
        );
        assert.deepEqual(
            itercode(parseCode('function f()\n {return (x+5)/3;}')),
            [{Line: 1,Type: 'function declaration',Name: 'f',Condition:'',Value:''},
                {Line: 2,Type: 'return statement',Name: '',Condition:'',Value:'((x + 5) / 3)'}]
        );

    });
}