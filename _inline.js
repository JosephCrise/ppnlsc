
const LOGO="data:image/png;base64,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xlVYiuYxjOGX9999913CVx667LLL3Fdv6X6mFhSmWFxzzTXuOPqqGOT4Aw88II477jitLQzobBiVihikSjZYNUvVxYNNOcVOBcxxnGaj0Qmf8hcSGzt2rMfDvEro6ChoTydXMN9xPycEolEwEKP7iRMnNtva2tzGBcHDGCdV4egkg4u4OtDl9Pfff7v2g/a4TIn64UOlW8mS/aEke9d1O+64o4uOfrPEJZdcIjAmiRbGEe+8847c9ba4oIeeHFPZe/PNN0P2PAMl7IQuwEuI0QdJJn/FFVcU9HTYN4alCHXLEOK2FX1jfPLYkfbkByIkUE5GW+UKZ8qjrjjQMY2ZbJZ0rLx3TkqasNLAKvUFeNwsvfHGG2LnnXdWql133XVKflWZXepQiSKoDom77LKLeOqpp9z1tKpaqADurneofO2118Ruu+0mJkyY4MaK/qmnntqViubGFXrp4/LLLw8Utxq7V155pQt01113dc8ezznnHLH99tu7i32CJ6mq8QG/jBH90KESa3NVkYKrHOGQucMOO3in+zKmqsYH/CzGNjceur5pyLsCxCjVTWZbPBK/3NLddDcOuS+3tvbKKCdjoK3Tpc4qKdke7bHHHuKll17y9rtaJ3SoxCGmikSfQivYVY0PwbEYu95ZpVX1uoBQlz1UdoHaGEOoC2dMT3kH68KVtzZGZHXhjOkp72BduPLWxoisLpwxPeUdrAtX3toYkdWFM6anvIN14cpbGyOyunDG9JR3sC5ceWtjRFYXzpie8g52icI98sgj1hmOI2tttChBelzQoOYSYajUg9SHH35YQrfeQqdqcQIvI4f2XU5DMrFbpSZxx90+9NBDlYqzvUxelA7tV7dw9MqUF0mwc+yxxzbRTET/fL1SxWOxVLdw999/P4vD333++ee9gtC7cP5Btvf44497cvj8lr0x6NUs3H333cdiCHeDa24df/zxYaEODmyVvWASHwuimoVjAYS6J5xwgrIQIUHGuPfee5U6MmFl2TLI1SvcPffcw/D7u/Sf7rUFwJiJYLcsBdLhYPirVbi7776bYfd3H3zwwcjEY71KE+kSVhY+w16dwmHZQRPZ/tuVU045RWumyKUNbT4cDHg1CkfrnTDM4S691BH5beOJCVvo5Nx5552xbHG7re53omxWo3AffPABw+zvnn766bETDR0T3X777bFttrposM+o/IW77bbbGF5/9+qrr06c4DPOOMNvLLCXRyHi+mAQy124W2+9lWENdwcMGJC4cEjamWeeGTbawYHvuIlttTwDW97C0SoIDGe4e9ZZZ2WSWFpyI2y8g3PLLbdk4iOrgjKg5S3ce++9x3D6u/TSYmYJ7du3r994YO/mm2/OzFfaAjJo5SzcTTfdxDD6u+eee27miYRNE6VNeFb6DGP5CnfjjTcyfOFuVkkI2jnvvPPCzjo4wBSUL2KfAXTIf3ke65x22mkMW7h7/vnntzSBsK+jG264oaW+UYaoxrA5JFuewtES8Qybv3vBBRdEBoZQ0ja/V//e9ddfn9p+GnwMjUN2ylG4a6+9luHydy+66KLcEgZfJlpttdVyw4LS8MZwOcQvvnC0CCjDFO4CYp7t4osvDoPo4BQ5X4WBcigfxRYOdz9MhOssQMy7ma7v0tyxSRMHy5NDdootHAMT6l566aW5FwzpkO2tt94KYZKMq666ypOT8q3eSt+0dchXcYW74oorGBZ/l1YAyj0xSAVv+HeaJsIC3Vy+1X2GxSFfxRTOVLRZs2blmhCkQNdMON9++22tns5eGn7hhcO3yUS4c58mwKx1TcXL88jAcuZQjPl/4xiAUJcWGitV0ZAeNNMTeFpiPxfMLFkOYcq3cGU8W0MKotqgQYNY3sLdPM5+mVeH8OZXONP1Ef5vKaCUuRV9vVlI4aLuSOyzzz6lLpr8QBV5h4cXLrdF2Mgpxa4mugcoqLDqQQsuPckWffr08UnCpqQLL7xQdt3twoULBU2J8PHi7GB956BNqY84uG/Jz2LLctgWWiE2CwdBG3TXPcjy9umRiVXRYGP27NnuUoZHHHGEp48OVn2lB6I+3pIlSwRsQy+4kPaCBQtEr169fPL0HoGQdqFnIhSHJtgKmjoREoMv6Ts0mDWDKtmg5hLZzvSQZXrO9eKLL0b6gr60MXPmzOYdd9whoUZuBw4cGCkjBbhd6dOUCzytMJFJN+kY8+eQjdadnEQ9Wab/1GEsHPRNT8NZIMouJskmJfhFakzNhK0VT+pZLA7hal3hmKNQ12YuB5TifGuCTtIUDmmxmduCOHRkow8/to35cUinNYU7++yzmR9/d9y4cVZgP/rooyb9ZviVY+ylLRxcIT1RDes/6wh5iNK3HWc+HNLJvnCm+YpxXmnafffdGdb43TSFQwz44CA9UW3EiBFGcFtssUWkjSgf7WXy3Di0n23homYI9+/f3yoIGawHNUEnTeHgjhbktsKKFJpmXL/66qvWdmBL11gKHJLJrnCYWWyiOHPyX3nlFTcAk72osbSFQ2rizJZGfDpK8o4D/PPGbDvEz65weLioI5xuw5Vtg52oWV86X5KfReHiPjDllxUSh9wiHtv4VXLSDm0dGs+mcFm/d2a6G88CMHbTFk7GhBTFaSZQ+BefcWxxWWbXIX76wrXqTU8GNFE3beHgFG/BIkVxmunN2ffffz+WLe6XJcEhfrrCRf2uJXm3Wr7LzYAm6mZROKQnSUv6rrrJF0uCQ3LpCocJPToaP358oqBh78QTT9SZteYPGTLEWlYniPQAC7ZxG+LXURKbzJZDWJIXrlXrh0StY8ICMHbbQzOKRA7KGGErSZs8ebLWx3777RfLJjPkEJZkhTOt2AMHMJu0wfYnn3zCcNp1sVIQVhzCFtQeWtPd53w7a36ppLHsu+++fkNsb+rUqbFyxFST/R9wWiNLUCIoFjXR0hXqAUvu5ptvLqZPny422WQTrYbKB73sKObOnStojS6xaNEiVxdyKr40TA9wxeDBg+VuaDtnzhzx7LPPhvi2DFqeSgADchakoUOHunxVLEHZ4H6iB6lU+aAdb59WpVOC9AQsO1HBqBJhadonRr/RAgnU0YwZM7QPTXU6Kj7iOeaYY1RDbr6QtyhieY//IPXoo4/W2scinlkl1MbOIYccInr37h3CE1xMdMyYMYJe1gjJ4VtJ08lD/CADfp5++ukgO9Y+4unevbtQ5Q9FxcPXIG6Tg1jfuKOOOspoPKv/zQY/NkQX6YLufYZEg8mhO/Ri+PDhIbl58+a5//g2NBBgwA8Ov1kQ+9aEzEXlj+m2WRfuyCOPFI8++mjImWQ89thjwjbhUke3nTRpkm5IyZ8/f77o16+fOzZy5EilDPDRXXxvjOvwvicQ6IwaNSrASbaLHCKXKkL+gFNHiQrHlEJ2MV9DByYkbMGgxzkWUp0imItCD1xdxv777985wHrAx+1yHd5nKr4u3eH37afZQXHk/JagHeBEPlXEatDmjhOjQc0lYoROUQ8//HA5HNri1FulU/PCeeQ5kZcsoYQSA/nmsrLPZB3ima/jDj30UCYf7kK9bsly8Ouvv4YT2sGhk65QXpmw+b8S42zqySefRG2VlPZMS2l0KWLSgm/aaK1+eqiSDVlNsuRVWvJUWyqaJ8d16n5n/mxygTzqaOzYsb4cMzmHbKsPlQcffDCT83efeeYZn0GYqFvyHCCfOkIdZG6ZjKO9HCAhklfTQQcdpB6ouYkzYLqtJq/vWE3013FMKDGYWjGbDKgKl/m7AxMmTAihPeCAA0I8MLisTkap2MFMq2+yjTFuX8rS7GsxbNgwuevbquQhkCQ2n2HdDn27GtRcIhn3mCr3426lPt9SQEozXEYpEMFMqx9h3vtt4X7oTFurxuV4X6tgOSBtMXGHeOqTEyYUqwtzstEbMV7/ueeea6JxknLtEPiIXT+tvskLsHL7vB+MA3a4PJ7BcfkpU6aYXEWOSVtM0CFe6wqHOwDBFxbx71MkwbVskhdnK3XbQ4ijGS3LbaNvioP/Sxh6ROQa5/p40p2GpC1mwyFe6wonHe29995egeDuhRdecIfQl03KxtlKXWyzJm4bs69BqjgQC5fFKuogzkuLT9pyDbf/cYjX+sLB11577eULJvhuHANl3QV02WAPjR7VNOmmsdtkX25tDUNe2sVWzjuBfjAOLocxSUE52ExK0gfTT3YdR4a0JE9dIUCOfHJ77rmnu0/Ty3187ARlQwIKBuwFbeGhJKYvgPAMTU5lwJbea1BYCbOCT/GD2FR+6T0DQW/t+IzxXJiegPuUFDvSDsOR/XUcApAUTKrkcxnJ08nKcd1WZUsna+sjaFOll5WMDivn51I47rDuZ5MBVeG0F+Cvv/56Nl5rKy3JgCzcLLKO5hFWMli8eLHo2bNnvS04D5imiDpwkoXD2cI0PoDbN/KRfr1tnxpRdB5YfWazft2tM1BnoOUZ+D9IpdG3TJZkuAAAAABJRU5ErkJggg==";
const FRIDAYS = ["សុក្រ ៥ មិថុនា","សុក្រ ១២ មិថុនា","សុក្រ ១៩ មិថុនា","សុក្រ ២៦ មិថុនា"];
const NAMES = [
 ["Chhay Kimhou","M"],["Chea Meng","M"],["Chea Theara","M"],["Em Souleang","M"],
 ["Em Mengleang","M"],["Hour Senghout","M"],["Hian Yan","M"],["Hean Yun","M"],
 ["Kham Yuen","M"],["Khut Chinhhou","M"],["Ly Vanda","M"],["Lorn Yuhan","M"],
 ["Nhao Trenchailin","M"],["Sam Sophanna","M"],
 ["Sorn Phalla","M"],["Sreng Mengheang","M"],["Thoeun Ratha","M"],["Pek Vathana","M"],
 ["Por Visal","M"],["Por Prasith","M"],["Porcha Phannit","M"],["Vang Daro","M"],
 ["Chhoeun Pichviriya","F"],["Chhay Chantevy","F"],["Chhon Maey","F"],
 ["Hok Siyean","F"],["Hou Chhunhoung","F"],["Meas Kimsour","F"],["Mao Sreypich","F"],
 ["Pek Thida","F"],["Song Piseth","F"],["Sorn Chandara","F"],["Sorn Srey Ang","F"],
 ["Sorn Sreypich","F"],["Seun Nary","F"],["Seiha Chankoltola","F"],["Thy Sothavy","F"],
 ["Then Monida","F"]
];
let DATA = NAMES.map(([name,gender])=>({
  name, gender, att: Array.from({length:4},()=>({s:"",r:""}))
}));

function counts(){
  const total=DATA.length;
  const male=DATA.filter(d=>d.gender==='M').length;
  const female=DATA.filter(d=>d.gender==='F').length;
  return {total,male,female};
}
function refreshCounts(){
  const c=counts();
  hTotal.textContent=c.total; hMale.textContent=c.male; hFemale.textContent=c.female;
  sTotal.textContent=c.total; sMale.textContent=c.male; sFemale.textContent=c.female;
}
/* ---- nav ---- */
function go(id,btn){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('show'));
  document.getElementById(id).classList.add('show');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  const navBtn = (btn && btn.closest('nav')) ? btn : document.querySelector('[data-s='+id+']');
  if(navBtn) navBtn.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
/* ---- students ---- */
function renderStudents(){
  const b=studentBody; b.innerHTML='';
  DATA.forEach((d,i)=>{
    const nameCell = studentLocked
      ? `<td class="name" onclick="showLock()">${d.name}</td>`
      : `<td class="name" contenteditable oninput="DATA[${i}].name=this.innerText.trim();refreshCounts()">${d.name}</td>`;
    const genderCell = `<td class="gender ${d.gender}" onclick="${studentLocked?'showLock()':'toggleGender('+i+')'}" title="ចុចដើម្បីប្ដូរ M/F">${d.gender}</td>`;
    b.innerHTML+=`<tr><td>${i+1}</td>${nameCell}${genderCell}</tr>`;
  });
  sStamp.textContent='បង្កើតនៅ '+new Date().toLocaleString('en-GB');
  refreshCounts();
}
function toggleGender(i){ if(studentLocked){showLock();return;} DATA[i].gender = DATA[i].gender==='M'?'F':'M'; renderStudents(); }
function addStudent(){ if(studentLocked){showLock();return;} DATA.push({name:"",gender:"M",att:Array.from({length:4},()=>({s:"",r:""}))}); renderStudents(); renderAtt(); }
/* ---- attendance ---- */
function renderAttHead(){
  let h='<tr><th rowspan="2">ល.រ</th><th rowspan="2">ឈ្មោះសិស្ស</th><th rowspan="2">ភេទ</th>';
  FRIDAYS.forEach(f=>h+=`<th class="wk" colspan="2">${f}</th>`);
  h+='<th rowspan="2">វត្តមាន</th><th rowspan="2">អវត្តមាន</th></tr><tr>';
  FRIDAYS.forEach(()=>h+='<th>ស្ថានភាព</th><th>មូលហេតុ</th>');
  h+='</tr>';
  attHead.innerHTML=h;
}
function renderAtt(){
  const b=attBody; b.innerHTML='';
  DATA.forEach((d,i)=>{
    let row=`<td>${i+1}</td><td class="name">${d.name||'<i style=color:#bbb>—</i>'}</td><td class="gender ${d.gender}">${d.gender}</td>`;
    d.att.forEach((w,j)=>{
      row+=`<td class="att ${w.s} ${attendLocked?'lock':''}" onclick="cycle(${i},${j})">${w.s}</td>`;
      const re = attendLocked
        ? `<td class="reason" onclick="showLock()">${w.r}</td>`
        : `<td class="reason" contenteditable oninput="DATA[${i}].att[${j}].r=this.innerText.trim()">${w.r}</td>`;
      row+=re;
    });
    const p=d.att.filter(w=>w.s==='P').length, a=d.att.filter(w=>w.s==='A').length;
    row+=`<td class="present">${p}</td><td class="absent">${a}</td>`;
    b.innerHTML+=`<tr>${row}</tr>`;
  });
  renderRank();
  aStamp.textContent='បង្កើតនៅ '+new Date().toLocaleString('en-GB');
}
function cycle(i,j){
  if(attendLocked){ showLock(); return; }
  const cur=DATA[i].att[j].s;
  DATA[i].att[j].s = cur===''?'P':cur==='P'?'A':'';
  if(DATA[i].att[j].s!=='A') DATA[i].att[j].r='';
  renderAtt();
}
function clearAtt(){ if(attendLocked){ showLock(); return; } DATA.forEach(d=>d.att=Array.from({length:4},()=>({s:"",r:""}))); renderAtt(); }
function renderRank(){
  const rb=rankBody; rb.innerHTML='';
  const ranked=DATA.map(d=>({name:d.name,g:d.gender,a:d.att.filter(w=>w.s==='A').length}))
    .filter(d=>d.name!=='' && d.a>0).sort((x,y)=>y.a-x.a);
  if(!ranked.length){ rb.innerHTML='<tr><td colspan="4" style="color:#999;padding:12px">មិនទាន់មានអវត្តមាន</td></tr>'; return; }
  ranked.forEach((r,i)=>rb.innerHTML+=`<tr><td>${i+1}</td><td style="text-align:left">${r.name}</td><td class="gender ${r.g}">${r.g}</td><td class="cnt">${r.a}</td></tr>`);
}
/* ---- export ---- */
function stamp(){return new Date().toISOString().slice(0,10);}
let _resultFile=null, _resultURL=null;
// Works on desktop (download) AND mobile (share sheet -> Save Image / Save to Files)
function showResult(blob, filename, kind){
  if(_resultURL) URL.revokeObjectURL(_resultURL);
  _resultURL = URL.createObjectURL(blob);
  _resultFile = new File([blob], filename, {type: blob.type});
  const icon = kind==='video' ? '🎬' : '📄';
  dlPreview.innerHTML = kind==='image'
    ? `<img src="${_resultURL}" alt="">`
    : `<div style="font-size:54px">${icon}</div><div style="font-size:13px;color:#556">${filename}</div>`;
  dlLink.href=_resultURL; dlLink.setAttribute('download',filename);
  if(kind==='pdf'||kind==='video') dlLink.setAttribute('target','_blank'); else dlLink.removeAttribute('target');
  const canShare = navigator.canShare && navigator.canShare({files:[_resultFile]});
  dlShare.style.display = canShare ? '' : 'none';
  dlHint.innerHTML = canShare
    ? "ទូរស័ព្ទ៖ ចុច «📤 ចែករំលែក / រក្សាទុក» ➜ ជ្រើស <b>Save Image</b> / <b>Save Video</b> ឬ <b>Save to Files</b> ឬផ្ញើទៅ Telegram / Messenger។"
    : (kind==='image'
        ? "ចុច «⬇ រក្សាទុក» ដើម្បីទាញយករូបភាព។ (ទូរស័ព្ទ៖ ចុចឃ្លាំងលើរូប រួចជ្រើស Save Image)"
        : "ចុច «⬇ បើក / រក្សាទុក» ➜ បើកឯកសារ រួចចុច Share ➜ Save to Files / Save Video។");
  dlModal.classList.add('show');
}
function doShare(){
  if(_resultFile && navigator.share){
    navigator.share({files:[_resultFile], title:'Phnom Penh New Life Student Center'}).catch(()=>{});
  }
}
function exportPNG(){
  html2canvas(attendDoc,{scale:2,backgroundColor:'#fff',windowWidth:1024}).then(c=>{
    c.toBlob(bl=>showResult(bl,'Attendance-'+stamp()+'.png','image'),'image/png');
  });
}
function exportPDF(elId,name){
  const {jsPDF}=window.jspdf;
  html2canvas(document.getElementById(elId),{scale:2,backgroundColor:'#fff',windowWidth:1024}).then(c=>{
    const img=c.toDataURL('image/png');
    const pdf=new jsPDF({orientation:c.width>c.height?'l':'p',unit:'pt',format:'a4'});
    const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
    const w=pw-40, h=c.height*w/c.width;
    if(h<=ph-40){ pdf.addImage(img,'PNG',20,20,w,h); }
    else {
      let sY=0; const pageH=ph-40; const ratio=c.width/w;
      while(sY < c.height){
        const slice=Math.min(c.height-sY, pageH*ratio);
        const cv=document.createElement('canvas'); cv.width=c.width; cv.height=slice;
        cv.getContext('2d').drawImage(c,0,sY,c.width,slice,0,0,c.width,slice);
        if(sY>0) pdf.addPage();
        pdf.addImage(cv.toDataURL('image/png'),'PNG',20,20,w,slice/ratio);
        sY+=slice;
      }
    }
    showResult(pdf.output('blob'), name+'-'+stamp()+'.pdf','pdf');
  });
}
function share(t){ exportPNG(); }  // share sheet (in result popup) includes Telegram & Messenger
// generic exporter for any element -> image or pdf
function exportNode(elId, kind, name){
  const el=document.getElementById(elId); el.classList.add('export-mode');
  const done=()=>el.classList.remove('export-mode');
  html2canvas(el,{scale:2,backgroundColor:'#fff',windowWidth:1024}).then(c=>{
    done();
    if(kind==='image'){ c.toBlob(b=>showResult(b,name+'-'+stamp()+'.png','image'),'image/png'); return; }
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:c.width>c.height?'l':'p',unit:'pt',format:'a4'});
    const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
    const w=pw-40, h=c.height*w/c.width;
    if(h<=ph-40){ pdf.addImage(c.toDataURL('image/png'),'PNG',20,20,w,h); }
    else { let sY=0; const pageH=ph-40, ratio=c.width/w;
      while(sY<c.height){ const slice=Math.min(c.height-sY,pageH*ratio);
        const cv=document.createElement('canvas'); cv.width=c.width; cv.height=slice;
        cv.getContext('2d').drawImage(c,0,sY,c.width,slice,0,0,c.width,slice);
        if(sY>0) pdf.addPage(); pdf.addImage(cv.toDataURL('image/png'),'PNG',20,20,w,slice/ratio); sY+=slice; } }
    showResult(pdf.output('blob'), name+'-'+stamp()+'.pdf','pdf');
  });
}
/* ---- permission request letter ---- */
function pv(id){ const el=document.getElementById(id); return el?(el.value||'').trim():''; }
function U(s){ return `<span class="u">${s||'&nbsp;&nbsp;&nbsp;&nbsp;'}</span>`; }
function khDate(v){ if(!v) return {d:'',m:'',y:''}; const p=v.split('-'); return {d:p[2],m:p[1],y:p[0]}; }
function daysBetween(a,b){ if(!a||!b) return ''; const n=Math.round((new Date(b)-new Date(a))/86400000)+1; return n>0?n:''; }
function roleChange(){
  const r=document.querySelector('input[name=pRole]:checked').value;
  roleStudent.style.display = r==='student'?'':'none';
  roleUni.style.display     = r==='uni'?'':'none';
  roleStaff.style.display   = r==='staff'?'':'none';
  renderPerm();
}
function roleLine(){
  const r=document.querySelector('input[name=pRole]:checked').value;
  if(r==='student') return `ជា សិស្ស ថ្នាក់ទី ${U(pv('pClass'))} នៃ ${U(pv('pSchool'))}`;
  if(r==='staff')   return `ជា បុគ្គលិក ផ្នែក ${U(pv('pDept'))}`;
  return `ជា និស្សិតឆ្នាំទី ${U(pv('pYear'))} ផ្នែក ${U(pv('pMajor'))} នៃ ${U(pv('pUni'))}`;
}
function renderPerm(){
  const f=khDate(pv('pFrom')), t=khDate(pv('pToDate')), wd=khDate(pv('pWriteDate'));
  const days=daysBetween(pv('pFrom'),pv('pToDate'));
  const role=document.querySelector('input[name=pRole]:checked').value;
  const cb=v=>`<span class="cb">${role===v?'✓':''}</span>`;
  const s=role==='student', u=role==='uni', st=role==='staff';
  permDoc.innerHTML = `
   <div class="ph"><img src="${LOGO}" alt="" onerror="this.style.display='none'"><div class="cn">មណ្ឌលនិស្សិតជីវិតថ្មីភ្នំពេញ<small>Phnom Penh New Life Student Center</small></div></div>
   <div class="no">N°. <span class="u" style="min-width:130px">${pv('pNo')}</span></div>
   <div class="pt">ពាក្យសុំច្បាប់</div>
   <div class="pline"><span class="t">ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ ៖</span> <span class="u grow">${pv('pName')}</span> <span class="t">ភេទ</span> <span class="u">${pv('pSex')}</span> <span class="t">អាយុ</span> <span class="u">${pv('pAge')}</span> <span class="t">លេខទូរស័ព្ទ</span> <span class="u">${pv('pPhone')}</span></div>
   <div class="rolewrap"><span class="ja">ជា</span><div class="rolecol">
     <div class="pline">${cb('student')} <span class="t">សិស្ស ថ្នាក់ទី</span> <span class="u">${s?pv('pClass'):''}</span> <span class="t">នៃ</span> <span class="u grow">${s?pv('pSchool'):''}</span></div>
     <div class="pline">${cb('uni')} <span class="t">និស្សិត ឆ្នាំទី</span> <span class="u">${u?pv('pYear'):''}</span> <span class="t">ផ្នែក</span> <span class="u">${u?pv('pMajor'):''}</span> <span class="t">នៃ</span> <span class="u grow">${u?pv('pUni'):''}</span></div>
     <div class="pline">${cb('staff')} <span class="t">បុគ្គលិក ផ្នែក</span> <span class="u grow">${st?pv('pDept'):''}</span></div>
   </div></div>
   <div class="recip">សូមគោរពចូលមក<br>បុគ្គលិកទទួលខុសត្រូវមណ្ឌលនិស្សិតជីវិតថ្មី</div>
   <div class="pline"><span class="t label"><span class="ttl">តាមរយះ</span>៖</span> <span class="t" style="color:var(--navy);font-weight:700">${pv('pTo')}</span></div>
   <div class="pline"><span class="t label"><span class="ttl">កម្មវត្ថុ</span>៖</span> <span class="t">សំណើសុំច្បាប់ដើម្បីឈប់សម្រាក ចំនួន</span> <span class="u">${days}</span> <span class="t">ថ្ងៃ</span></div>
   <div class="pline daterow"><span class="t label" style="visibility:hidden"><span class="ttl">កម្មវត្ថុ</span>៖</span> <span class="t">ចាប់ពីថ្ងៃទី</span> <span class="u">${f.d}</span> <span class="t">ខែ</span> <span class="u">${f.m}</span> <span class="t">ឆ្នាំ</span> <span class="u">${f.y}</span> <span class="t">ដល់ថ្ងៃទី</span> <span class="u">${t.d}</span> <span class="t">ខែ</span> <span class="u">${t.m}</span> <span class="t">ឆ្នាំ</span> <span class="u">${t.y}</span></div>
   <div class="pline"><span class="t label"><span class="ttl">មូលហេតុ</span>៖</span> <span class="u grow" style="text-align:left">${pv('pReason')}</span></div>
   <div class="para">អាស្រ័យដូចបានជំរាបជូនខាងលើនេះ សូមលោកនាយកមេត្តាអនុញ្ញាតច្បាប់សម្រាប់ទៅតាមការស្នើសុំរបស់ខ្ញុំបាទ-នាងខ្ញុំ ដោយយល់សេចក្ដីស្រឡាញ់នៃព្រះអម្ចាស់យេស៊ូវគ្រីស្ទ ។</div>
   <div class="sign"><span class="t">${pv('pPlace')||'ភ្នំពេញ'}, ថ្ងៃទី</span> <span class="u">${wd.d}</span> <span class="t">ខែ</span> <span class="u">${wd.m}</span> <span class="t">ឆ្នាំ</span> <span class="u">${wd.y}</span><br>ហត្ថលេខា<br><span class="u" style="margin-top:6px">${pv('pName')}</span></div>
   <div class="decision">សេចក្ដីសម្រេចរបស់បុគ្គលិក<br>ទទួលខុសត្រូវមណ្ឌលនិស្សិតជីវិតថ្មី</div>
   <div class="blank"></div>
   <div class="blank"></div>
   <div style="text-align:center;margin-top:18px">ភ្នំពេញ, ថ្ងៃទី ____ ខែ ____ ឆ្នាំ ២០__<br>ហត្ថលេខា</div>`;
}
/* ---- memories gallery ---- */
// To add more: put files in the "memories" folder, then add entries below.
// image -> {type:"image", src:"memories/NAME.jpg", cap:"..."}
// video -> {type:"video", src:"memories/NAME.mp4", cap:"..."}
const MEMORIES = [
  {type:"image", src:"memories/photo1.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo2.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo3.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo4.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo5.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo6.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo7.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"image", src:"memories/photo8.jpg", cap:"អនុស្សាវរីយ៍ ០២ មិថុនា ២០២៦"},
  {type:"video", src:"memories/video1.mp4", cap:"វីដេអូ ០២ មិថុនា ២០២៦"},
];
let memUploads = [];   // media picked from device (session only)
function renderGallery(){
  const all = MEMORIES.concat(memUploads);
  window._galleryAll = all;
  const w = galleryWrap;
  if(!all.length){
    w.innerHTML='<div class="empty">មិនទាន់មានរូបភាព។<br>ចុច «➕ បន្ថែមរូបភាព» ដើម្បីបើកមើល ឬដាក់ឯកសារក្នុង folder «memories»។</div>';
    return;
  }
  w.innerHTML='<div class="gallery">'+all.map((m,i)=>{
    const thumb = m.type==='video'
      ? `<div class="thumb"><video src="${m.src}" preload="metadata" muted></video><div class="play">▶</div></div>`
      : `<img src="${m.src}" alt="${m.cap||''}" loading="lazy">`;
    const dl = `<a class="dl" href="javascript:void(0)" onclick="event.stopPropagation();saveMedia(${i})">⬇ រក្សាទុក</a>`;
    return `<figure><div onclick="openLight(${i})">${thumb}${m.cap?`<figcaption>${m.cap}</figcaption>`:''}</div>${dl}</figure>`;
  }).join('')+'</div>';
}
function addMemFiles(files){
  [...files].forEach(f=>{
    memUploads.push({type:f.type.startsWith('video')?'video':'image', src:URL.createObjectURL(f), cap:f.name.replace(/\.[^.]+$/,'')});
  });
  renderGallery();
}
function openLight(i){
  const m=window._galleryAll[i];
  lbBox.innerHTML = m.type==='video'
    ? `<video src="${m.src}" controls autoplay playsinline></video>`
    : `<img src="${m.src}" alt="">`;
  lbCap.innerHTML = (m.cap||'') + ` &nbsp; <a href="javascript:void(0)" onclick="saveMedia(${i})" style="color:#7CD992;font-weight:700">⬇ រក្សាទុក</a>`;
  lightbox.classList.add('show');
}
function closeLight(){ lightbox.classList.remove('show'); lbBox.innerHTML=''; }
// fetch the media into a blob, then show the save/share popup (works on mobile)
async function saveMedia(i){
  const m=window._galleryAll[i];
  const ext = m.type==='video' ? 'mp4' : 'jpg';
  const fn = (m.cap?m.cap.replace(/[^\w-]+/g,'_'):'memory')+'-'+i+'.'+ext;
  try{
    const blob = await (await fetch(m.src)).blob();
    showResult(blob, fn, m.type==='video'?'video':'image');
  }catch(e){
    window.open(m.src,'_blank');  // fallback: open so user can long-press to save
  }
}

/* ---- access control for attendance ---- */
const PASSCODE = "2026";   // ⚠️ ប្ដូរលេខសម្ងាត់នេះ — ផ្ដល់ឲ្យតែអ្នកទទួលបន្ទុក
let attendLocked = true;
function showLock(){
  msgTitle.textContent = "មិនអនុញ្ញាត";
  msgText.textContent = "This feature allow only who responsible it.";
  msgModal.classList.add('show');
}
function toggleLock(){
  if(attendLocked){
    const pin = prompt("សូមបញ្ចូលលេខសម្ងាត់ (សម្រាប់អ្នកទទួលបន្ទុក)៖");
    if(pin===null) return;
    if(pin===PASSCODE){ attendLocked=false; applyLock(); }
    else { msgTitle.textContent="លេខសម្ងាត់មិនត្រឹមត្រូវ"; msgText.textContent="Wrong passcode. This feature allow only who responsible it."; msgModal.classList.add('show'); }
  } else { attendLocked=true; applyLock(); }
}
function applyLock(){
  lockBtn.textContent = attendLocked ? "🔒 ដោះសោ (អ្នកទទួលបន្ទុក)" : "🔓 ចាក់សោវិញ";
  lockBtn.classList.toggle('open', !attendLocked);
  lockBar.className = "lockbar " + (attendLocked?"locked":"unlocked");
  lockBar.textContent = attendLocked
    ? "🔒 ផ្ទាំងនេះត្រូវបានចាក់សោ — សម្រាប់តែអ្នកទទួលបន្ទុកប៉ុណ្ណោះ។"
    : "🔓 បានដោះសោ — អ្នកអាចកែវត្តមានបាន។";
  renderAtt();
}

/* ---- student-list lock (same passcode) ---- */
let studentLocked = true;
function toggleSLock(){
  if(studentLocked){
    const pin = prompt("សូមបញ្ចូលលេខសម្ងាត់ ដើម្បីកែបញ្ជីសិស្ស៖");
    if(pin===null) return;
    if(pin===PASSCODE){ studentLocked=false; applySLock(); }
    else { msgTitle.textContent="លេខសម្ងាត់មិនត្រឹមត្រូវ"; msgText.textContent="Wrong passcode. This feature allow only who responsible it."; msgModal.classList.add('show'); }
  } else { studentLocked=true; applySLock(); }
}
function applySLock(){
  sLockBtn.textContent = studentLocked ? "🔒 ដោះសោកែ (អ្នកទទួលបន្ទុក)" : "🔓 ចាក់សោវិញ";
  sLockBtn.classList.toggle('open', !studentLocked);
  sLockBar.className = "lockbar " + (studentLocked?"locked":"unlocked");
  sLockBar.textContent = studentLocked
    ? "🔒 ការកែឈ្មោះ/ភេទ ត្រូវបានចាក់សោ។ អ្នកគ្រប់គ្នាអាចបង្កើត PDF បាន។"
    : "🔓 បានដោះសោ — អ្នកអាចកែឈ្មោះ/ភេទ និងបន្ថែមសិស្សបាន។";
  renderStudents();
}

/* ---- home slideshow (from memory photos) ---- */
let slideIdx=0, slideTimer=null;
function slideImages(){ return MEMORIES.filter(m=>m.type==='image'); }
function buildSlideshow(){
  const imgs=slideImages();
  if(!imgs.length){ slideshow.style.display='none'; return; }
  slideshow.style.display='block';
  slides.innerHTML = imgs.map((m,i)=>`<img src="${m.src}" class="${i===0?'on':''}" alt="">`).join('');
  slideDots.innerHTML = imgs.map((m,i)=>`<span class="${i===0?'on':''}" onclick="slideGo(${i})"></span>`).join('');
  slideCap.textContent = imgs[0].cap||'';
  restartSlide();
}
function slideRender(){
  const imgs=[...slides.children], dots=[...slideDots.children];
  imgs.forEach((el,i)=>el.classList.toggle('on',i===slideIdx));
  dots.forEach((el,i)=>el.classList.toggle('on',i===slideIdx));
  slideCap.textContent = slideImages()[slideIdx]?.cap||'';
}
function slideMove(d){ const n=slides.children.length; if(!n)return; slideIdx=(slideIdx+d+n)%n; slideRender(); restartSlide(); }
function slideGo(i){ slideIdx=i; slideRender(); restartSlide(); }
function restartSlide(){ clearInterval(slideTimer); slideTimer=setInterval(()=>slideMove(1),4000); }

/* ---- feedback ---- */
const FEEDBACK_EMAIL = "chhengudam@kosign.com.kh";   // ⚠️ ប្ដូរអ៊ីមែលទទួលមតិនៅទីនេះ
function sendFeedback(){
  const name=fbName.value.trim()||"អនាមិក", type=fbType.value, msg=fbMsg.value.trim();
  if(!msg){ msgTitle.textContent="សូមបំពេញសារ"; msgText.textContent="សូមសរសេរសារមុននឹងផ្ញើ។"; msgModal.classList.add('show'); return; }
  const subject=encodeURIComponent("[Feedback] "+type+" — Phnom Penh New Life Student Center");
  const body=encodeURIComponent("ឈ្មោះ: "+name+"\nប្រភេទ: "+type+"\n\nសារ:\n"+msg);
  window.location.href=`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

/* ---- org structure ---- */
const LEADERS = [
  {img:"leaders/1.jpg",  name:"អែម ប៊ុនថន",    role:"ប្រធានមណ្ឌលនិស្សិតជីវិតថ្មី"},
  {img:"leaders/2.jpg",  name:"សង ពិសិទ្ធ",     role:"គ្រប់គ្រង គណនេយ្យ"},
  {img:"leaders/3.jpg",  name:"ខាំ យឺន",       role:"គ្រប់គ្រង រដ្ឋបាល"},
  {img:"leaders/4.jpg",  name:"ហ៊ួ សេងហួត",     role:"ពង្រឹងមេក្រុម និងវត្តមាន"},
  {img:"leaders/5.jpg",  name:"លី វណ្ណដា",      role:"១. ក្រុមភ្លេង និង ចម្រៀង<br>២. បែងចែកមេក្រុម"},
  {img:"leaders/6.jpg",  name:"ឆាយ គីមហួ",      role:"១. សម្ភារះប្រើប្រាស់<br>២. គ្រឿងទេស"},
  {img:"leaders/7.jpg",  name:"ហុក សុីយាន",      role:"រៀបចំក្រុមតូចខាងស្រី"},
  {img:"leaders/8.jpg",  name:"សំ សុផាន់ណា",    role:"រៀបចំកាលវិភាគសម្អាតខាងប្រុស"},
  {img:"leaders/9.jpg",  name:"អែម ស៊ូលាង",     role:"ក្រុមចម្រៀងនៅព្រះវិហារ (College & Center)"},
  {img:"leaders/10.jpg", name:"ស៊ន ស្រីអាង",    role:"រៀបចំកាលវិភាគសម្អាតខាងស្រី"},
  {img:"leaders/11.jpg", name:"ឈើន ពេជវីរីយ៉ា", role:"រៀបចំក្រុមចម្រៀងខាងស្រី"},
  {img:"leaders/12.jpg", name:"ស្រេង ម៉េងហ៊ាង", role:"គ្រប់គ្រង ចំណតម៉ូតូ"},
  {img:"leaders/13.png", name:"អែម ម៉េងលាង",    role:"គ្រប់គ្រង ផ្នែកសម្អាតព្រះវិហារ"},
  {img:"leaders/14.png", name:"ជា ម៉េង",         role:"១. គ្រប់គ្រង សណ្ដាប់ធ្នាប់<br>២. កាលវិភាគប្រជុំ"},
];
function leaderCard(l,head){
  return `<div class="leader${head?' head':''}">
    <img src="${l.img}" alt="${l.name}" loading="lazy" onerror="this.style.visibility='hidden'">
    <div class="lname">${l.name}</div><div class="lrole">${l.role}</div></div>`;
}
function renderOrg(){
  orgTop.innerHTML = leaderCard(LEADERS[0], true);
  orgGrid.innerHTML = LEADERS.slice(1).map(l=>leaderCard(l,false)).join('');
}

/* ---- Bible verses (Khmer) — edit/verify text freely ---- */
const VERSES = [
  {t:"ត្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យបានជីវិតអស់កល្បជានិច្ចវិញ។", r:"យ៉ូហាន ៣:១៦ (១៩៥៤)"},
  {t:"ព្រះយេហូវ៉ាទ្រង់ជាគង្វាលរបស់ខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីឡើយ។", r:"ទំនុកដំកើង ២៣:១ (១៩៥៤)"},
  {t:"ខ្ញុំអាចនឹងធ្វើគ្រប់ការទាំងអស់បាន ដោយសារព្រះគ្រីស្ទ ដែលទ្រង់ចំរើនកំឡាំងដល់ខ្ញុំ។", r:"ភីលីព ៤:១៣ (១៩៥៤)"},
  {t:"ចូរទុកចិត្តនឹងព្រះយេហូវ៉ាអស់អំពីចិត្ត កុំឲ្យពឹងផ្អែកលើប្រាជ្ញារបស់ឯងឡើយ។", r:"សុភាសិត ៣:៥ (១៩៥៤)"},
  {t:"ខ្ញុំនេះឯងជាផ្លូវ ជាសេចក្ដីពិត ហើយជាជីវិត គ្មាននរណាមកឯព្រះវរបិតាបានឡើយ លើកលែងតែមកតាមខ្ញុំ។", r:"យ៉ូហាន ១៤:៦ (១៩៥៤)"},
  {t:"យើងដឹងថា គ្រប់ការទាំងអស់តែងធ្វើការជាមួយគ្នា ដើម្បីសេចក្ដីល្អ ដល់អស់អ្នកដែលស្រឡាញ់ដល់ព្រះ។", r:"រ៉ូម ៨:២៨ (១៩៥៤)"},
];
function renderVerses(){
  verseList.innerHTML = VERSES.map(v=>`<div class="vcard"><div class="vt">${v.t}</div><div class="vr">— ${v.r}</div></div>`).join('');
  let i=Math.floor(Math.random()*VERSES.length);
  const show=()=>{ const v=VERSES[i]; verseHero.innerHTML=`${v.t}<span class="ref">— ${v.r}</span>`; };
  show(); setInterval(()=>{ i=(i+1)%VERSES.length; show(); }, 7000);
}

/* init */
document.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')==='picture1.png')i.src=LOGO;});document.querySelectorAll('link[rel*=icon]').forEach(l=>l.href=LOGO);
document.getElementById('pWriteDate').value = new Date().toISOString().slice(0,10);
/* Data-dependent renders are driven by Supabase (see supabase-integration.js). */
renderAttHead(); renderOrg(); roleChange();
