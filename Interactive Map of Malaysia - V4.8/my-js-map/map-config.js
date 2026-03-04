var myjsmapconfig = {
  "default":{
    "borderColor": "#6B8B9E",// Borders Color
    "showNames": true, // true/false to Show/Hide the names
    "namesColor": "#666666",// Default Names Color
    "namesHoverColor": "#FFFFFF",// Names Hover Color
    "showCallouts": true // true/false to Show/Hide the callout boxes (works on white background)
  },
  "myjsmap_1":{
    "hover": "JOHOR DARUL TA’ZIM",// Info of the popup
    "url": "",// Link to any webpage
    "target": "same_page",// Use "same_page", "new_page", or "none"
    "upColor": "#f3faff",// Default Color
    "overColor": "#005999",// Hover Color
    "active": true // true/false to set it as Active/Inactive
  },
  "myjsmap_2":{
    "hover": "KEDAH DARUL AMAN",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_3":{
    "hover": "KELANTAN DARUL NAIM",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_4":{
    "hover": "KUALA LUMPUR",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_5":{
    "hover": "LABUAN",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_6":{
    "hover": "MELAKA",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_7":{
    "hover": "NEGERI SEMBILAN DARUL KHUSUS",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_8":{
    "hover": "PAHANG DARUL MAKMUR",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_9":{
    "hover": "PERAK DARUL RIDZUAN",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_10":{
    "hover": "PERLIS INDERA KAYANGAN",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_11":{
    "hover": "PULAU PINANG",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_12":{
    "hover": "PUTRAJAYA",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_13":{
    "hover": "SABAH",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_14":{
    "hover": "SARAWAK",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_15":{
    "hover": "SELANGOR DARUL EHSAN",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  },
  "myjsmap_16":{
    "hover": "TERENGGANU DARUL IMAN",
    "url": "", "target": "same_page",
    "upColor": "#f3faff", "overColor": "#005999",
    "active": true
  }};

// The following is the script for map interaction DON'T EDIT !!! //
(function(){"use strict";function isTouchEnabled(){return('ontouchstart' in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0)}
document.addEventListener('DOMContentLoaded',function(){const myObjAll=document.querySelectorAll('path[id^="myjsmap_"]');const myAbbAll=document.querySelectorAll('text[id^="myjsvn_"]');myObjAll.forEach(function(myObj,index){const myAbb=myAbbAll[index];const myTextobj=[myObj,myAbb];const id=myObj.id;addEvent(myTextobj,id)})});function addEvent(myTextobj,id){const[myObj,myAbb]=myTextobj;const myWrapper=document.getElementById('myjsmapwrapper');const myVisns=document.getElementById('myjsvisns');const myCallouts=document.getElementById('myjscallouts');const myTip=document.getElementById('myjstip');const downColor='#595959';const myCalloutsColor='#FFFFFF';myWrapper.style.opacity='1';if(myjsmapconfig.default.showNames){myVisns.style.opacity='1';myVisns.setAttribute('fill',myjsmapconfig.default.namesColor)}else{myVisns.style.opacity='0'}
if(myjsmapconfig.default.showCallouts){myCallouts.style.visibility='hidden'}else{myCallouts.style.visibility='visible';myCallouts.setAttribute('fill',myCalloutsColor)}
myObj.setAttribute('fill',myjsmapconfig[id].upColor);myObj.setAttribute('stroke',myjsmapconfig.default.borderColor);if(myjsmapconfig[id].active){if(isTouchEnabled()){let touchmoved;myTextobj.forEach(function(textObj){textObj.addEventListener('touchstart',function(){touchmoved=!1;myObj.setAttribute('fill',myjsmapconfig[id].upColor);myTip.style.display='none'});textObj.addEventListener('touchmove',function(){touchmoved=!0});textObj.addEventListener('touchend',function(){if(!touchmoved){myObj.setAttribute('fill',myjsmapconfig[id].upColor);if(myjsmapconfig[id].target==='new_page'){window.open(myjsmapconfig[id].url)}else if(myjsmapconfig[id].target==='same_page'){window.location.href=myjsmapconfig[id].url}
myTip.style.display='none'}})})}else{myTextobj.forEach(function(textObj){textObj.style.cursor='pointer';textObj.addEventListener('mouseenter',function(){myTip.style.display='none';myObj.setAttribute('fill',myjsmapconfig[id].overColor);myAbb.setAttribute('fill',myjsmapconfig.default.namesHoverColor)});textObj.addEventListener('mouseleave',function(){myTip.style.display='none';myObj.setAttribute('fill',myjsmapconfig[id].upColor);myAbb.setAttribute('fill',myjsmapconfig.default.namesColor)});if(myjsmapconfig[id].target!=='none'){textObj.addEventListener('mousedown',function(){myObj.setAttribute('fill',downColor)})}
textObj.addEventListener('mouseup',function(){myTip.style.display='none';myObj.setAttribute('fill',myjsmapconfig[id].overColor);if(myjsmapconfig[id].target==='new_page'){window.open(myjsmapconfig[id].url)}else if(myjsmapconfig[id].target==='same_page'){window.location.href=myjsmapconfig[id].url}});textObj.addEventListener('mousemove',function(e){myTip.style.display='block';myTip.innerHTML=myjsmapconfig[id].hover;let x=e.pageX+10,y=e.pageY+15;let myTipWidth=myTip.offsetWidth,myTipHeight=myTip.offsetHeight;x=(x+myTipWidth>window.innerWidth+window.scrollX)?x-myTipWidth-20:x;y=(y+myTipHeight>window.innerHeight+window.scrollY)?window.innerHeight+window.scrollY-myTipHeight-10:y;myTip.style.left=x+'px';myTip.style.top=y+'px'})})}}else{myAbb.style.fillOpacity='0.5';myTextobj.forEach(function(textObj){textObj.style.cursor='default'})}}})()
