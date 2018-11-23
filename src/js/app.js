import $ from 'jquery';
import {parseCode,itercode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let table = itercode(parsedCode);
        let body=document.getElementById('body');
        let firstRow='<tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr>';
        body.innerHTML += firstRow;
        let row;
        for(let i=0; i<table.length; i++) {
            row = createRow(table[i]);
            body.innerHTML +=row;
        }
    });
});

function createRow(row) {
    let ans='<tr>'+'<td>'+row.Line+'</td>'+'<td>'+row.Type+'</td>';
    if(row.Name!=null)
        ans+='<td>'+row.Name+'</td>';
    else ans+='<td></td>';
    if(row.Condition!=null)
        ans+='<td>'+row.Condition+'</td>';
    else ans+='<td></td>';
    if(row.Value!=null)
        ans+='<td>'+row.Value+'</td>';
    else ans+='<td></td>';
    return ans+='</tr>';
}
