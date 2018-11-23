import * as esprima from 'esprima';

let rows;
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};
export {parseCode,itercode};

const itercode = (parsedCode) => {
    rows =[];
    for (let i=0 ; i<parsedCode.body.length; i++)
        loopItercode(parsedCode.body[i],rows);
    return rows;
};
function functionDeclaration(codeJsonBody,rows) {
    rows.push(RowInTable(codeJsonBody.id.loc.start.line,'function declaration',codeJsonBody.id.name,'',''));
    for (let i=0 ; i<codeJsonBody.params.length; i++){
        rows.push(RowInTable(codeJsonBody.params[i].loc.start.line,'variable declaration',codeJsonBody.params[i].name,'',''));
    }
    loopItercode(codeJsonBody.body,rows);
}

function variableDeclaration(codeJsonBody,rows){
    for(let i=0 ; i<codeJsonBody.declarations.length; i++){
        if(codeJsonBody.declarations[i].init!=null){
            let init = valueAssignment(codeJsonBody.declarations[i].init,rows);
            rows.push(RowInTable(codeJsonBody.declarations[i].loc.start.line,'variable declaration',codeJsonBody.declarations[i].id.name,'',init));
        }
        else
            rows.push(RowInTable(codeJsonBody.declarations[i].loc.start.line,'variable declaration',codeJsonBody.declarations[i].id.name,'',''));
    }
}

function expressionStatement(codeJsonBody,rows){
    if(codeJsonBody.expression.type=='UpdateExpression'){
        updateExpression(codeJsonBody.expression,rows);
    }
    else{
        let value=valueAssignment(codeJsonBody.expression.right,rows);
        rows.push(RowInTable(codeJsonBody.expression.loc.start.line,'assignment expression',codeJsonBody.expression.left.name,'',value));
    }
}

function valueAssignment(codeJsonBody,rows){
    if(codeJsonBody.type=='Literal'){
        return codeJsonBody.value;
    }
    else if(codeJsonBody.type=='Identifier'){
        return codeJsonBody.name;
    }
    else if(codeJsonBody.type=='BinaryExpression'){
        return binaryExpression(codeJsonBody,rows);
    }
    else return expression(codeJsonBody,rows);
}

function updateExpression(codeJsonBody,rows){
    let value=valueUpdate(codeJsonBody,rows);
    rows.push(RowInTable(codeJsonBody.loc.start.line,'update expression','','',value));
}

function valueUpdate(codeJsonBody,rows) {
    let argument;
    argument=expression(codeJsonBody.argument,rows);
    let value;
    if(codeJsonBody.prefix==false){
        value=argument+''+codeJsonBody.operator+'';
    }
    else{
        value=''+codeJsonBody.operator+''+argument;
    }
    return value;
}

function binaryExpression(codeJsonBody,rows){
    let left,right,operator;
    if (codeJsonBody.left.type=='Literal')
        left=codeJsonBody.left.raw;
    else left=expression(codeJsonBody.left,rows);
    if (codeJsonBody.right.type=='Literal')
        right=codeJsonBody.right.raw;
    else right=expression(codeJsonBody.right,rows);
    operator=' '+codeJsonBody.operator+' ';
    return(''+left+operator+right+'');
}

function expression(codeJsonBody,rows){
    if(codeJsonBody.type=='BinaryExpression')
        return('('+binaryExpression(codeJsonBody,rows)+')');
    else if(codeJsonBody.type=='MemberExpression')
        return memberExpression(codeJsonBody,rows);
    else if(codeJsonBody.type=='UnaryExpression')
        return unaryExpression(codeJsonBody,rows);
    else
        return codeJsonBody.name;
}

function whileStatement(codeJsonBody,rows){
    let condition;
    if(codeJsonBody.test.type=='BinaryExpression'||codeJsonBody.test.type=='LogicalExpression'){
        condition=binaryExpression(codeJsonBody.test,rows);
    }
    else{
        condition=codeJsonBody.test.raw;
    }
    rows.push(RowInTable(codeJsonBody.test.loc.start.line,'while statement','',condition,''));
    loopItercode(codeJsonBody.body,rows);
}

function forStatement(codeJsonBody,rows){
    let init,test,update;
    init=initFor(codeJsonBody,rows);
    test=binaryExpression(codeJsonBody.test,rows)+';';
    update=valueUpdate(codeJsonBody.update,rows);
    rows.push(RowInTable(codeJsonBody.test.loc.start.line,'for statement','',init+test+update,''));
    loopItercode(codeJsonBody.body,rows);
}

function initFor(codeJsonBody,rows) {
    let init='';
    if(codeJsonBody.init.type=='AssignmentExpression'){
        init=''+codeJsonBody.init.left.name+codeJsonBody.init.operator+valueAssignment(codeJsonBody.init.right,rows)+';';
    }
    if(codeJsonBody.init.type=='VariableDeclaration') {
        init=getInit(codeJsonBody);
    }
    return init;
}

function getInit(codeJsonBody) {
    let init='';
    for(let i=0;i<codeJsonBody.init.declarations.length;i++){
        let dec;
        if(codeJsonBody.init.declarations[i].init.type=='Literal')
            dec=codeJsonBody.init.declarations[i].init.raw;
        else
            dec=codeJsonBody.init.declarations[i].init.name;
        if(i==codeJsonBody.init.declarations.length-1)
            init+=codeJsonBody.init.declarations[i].id.name+'='+dec+';';
        else init+=codeJsonBody.init.declarations[i].id.name+'='+dec+',';
    }
    return init;
}

function ifStatement(codeJsonBody,rows,flag){
    let condition;
    condition=binaryExpression(codeJsonBody.test,rows);
    if(flag==0)
        rows.push(RowInTable(codeJsonBody.test.loc.start.line,'if statement','',condition,''));
    else
        rows.push(RowInTable(codeJsonBody.test.loc.start.line,'else if statement','',condition,''));
    loopItercode(codeJsonBody.consequent,rows);
    if(codeJsonBody.alternate!=null) {
        alternate(codeJsonBody.alternate,rows);
    }
}

function alternate(codeJsonBody,rows){
    if (codeJsonBody.type == 'IfStatement') {
        ifStatement(codeJsonBody, rows, 1);
    }
    else
        loopItercode(codeJsonBody, rows);
}

function memberExpression(codeJsonBody,rows) {
    let property,object;
    if(codeJsonBody.property.type=='BinaryExpression')
        property=binaryExpression(codeJsonBody.property,rows);
    else if(codeJsonBody.property.type=='Identifier')
        property=codeJsonBody.property.name;
    else
        property=codeJsonBody.property.raw;
    object=codeJsonBody.object.name;
    return(object+'['+property+']');
}

function unaryExpression(codeJsonBody,rows){
    let argument;
    if (codeJsonBody.argument.type=='Literal')
        argument=codeJsonBody.argument.raw;
    else argument=expression(codeJsonBody.argument,rows);
    return(''+codeJsonBody.operator+argument);
}

function returnStatement(codeJsonBody,rows){
    let argument;
    if(codeJsonBody.argument.type=='Literal')
        argument=codeJsonBody.argument.raw;
    else argument=expression(codeJsonBody.argument,rows);
    rows.push(RowInTable(codeJsonBody.argument.loc.start.line,'return statement','','',argument));
}

function loopItercode(codeJsonBody,rows) {
    if(codeJsonBody.type=='ExpressionStatement'){
        expressionStatement(codeJsonBody,rows);
    }
    else if(codeJsonBody.type=='WhileStatement'){
        whileStatement(codeJsonBody,rows);
    }
    else if(codeJsonBody.type=='IfStatement'){
        ifStatement(codeJsonBody,rows,0);
    }
    else if(codeJsonBody.type=='ReturnStatement'){
        returnStatement(codeJsonBody,rows);
    }
    else nextLoop(codeJsonBody,rows);
}

function nextLoop(codeJsonBody,rows) {
    if (codeJsonBody.type == 'BlockStatement') {
        loopBlock(codeJsonBody,rows);
    }
    else if (codeJsonBody.type == 'VariableDeclaration') {
        variableDeclaration(codeJsonBody, rows);
    }
    else if (codeJsonBody.type == 'FunctionDeclaration')
        functionDeclaration(codeJsonBody, rows);
    if (codeJsonBody.type == 'ForStatement')
        forStatement(codeJsonBody, rows);
}

function loopBlock(codeJsonBody,rows) {
    for (let i = 0; i < codeJsonBody.body.length; i++) {
        loopItercode(codeJsonBody.body[i], rows);
    }
}

function RowInTable(line,type,name,condition,value) {
    let row={'Line':line,'Type':type,'Name':name,'Condition':condition,'Value':value};
    /*row.Line=line;
    row.Type=type;
    row.Name=name;
    row.Condition=condition;
    row.Value=value;*/
    return row;
}