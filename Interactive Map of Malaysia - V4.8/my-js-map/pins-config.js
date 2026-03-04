var myjspinsconfig = {
  "pins":[
  {
    "hover": "IPOH",// Info of the popup
    "pos_X": 137,// Position on the X-Axis
    "pos_Y": 122,// Position on the Y-Axis
    "size": 0,// Size of the Pin in px
    "upColor": "#FF0000",// Default Color
    "overColor": "#FFCC00",// Hover Color
    "url": "",// Link to any webpage
    "target": "same_page",// Use "same_page", "new_page", or "none"
    "active": true //true/false to set it as Active/Inactive
  },
  {
    "hover": "SHAH ALAM",
    "pos_X": 150,
    "pos_Y": 190,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "ISKANDAR PUTERI",
    "pos_X": 246,
    "pos_Y": 268,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "KOTA KINABALU",
    "pos_X": 604,
    "pos_Y": 73,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY5",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY6",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY7",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY8",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY9",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY10",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY11",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY12",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY13",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "CITY14",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },
  {
    "hover": "BLANK",
    "pos_X": 100,
    "pos_Y": 101,
    "size": 0,
    "upColor": "#FF0000",
    "overColor": "#FFCC00",
    "url": "",
    "target": "same_page",
    "active": true
  },// Feel free to add more pins
  ]
};

// The following is the script for pins interaction DON'T EDIT !!! //
(function(){"use strict";function isTouchEnabled(){return('ontouchstart' in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0)}
document.addEventListener('DOMContentLoaded',function(){let pins_len=myjspinsconfig.pins.length;if(pins_len>0){let xmlns="http://www.w3.org/2000/svg";let tsvgpin=document.getElementById("myjspins");let svg_circle;for(let i=0;i<pins_len;i++){svg_circle=document.createElementNS(xmlns,"circle");svg_circle.setAttribute("cx",myjspinsconfig.pins[i].pos_X+1);svg_circle.setAttribute("cy",myjspinsconfig.pins[i].pos_Y+1);svg_circle.setAttribute("r",myjspinsconfig.pins[i].size/2);svg_circle.setAttribute("fill","rgba(0, 0, 0, 0.5)");tsvgpin.appendChild(svg_circle);svg_circle=document.createElementNS(xmlns,"circle");svg_circle.setAttribute("id","myjspins_"+i);svg_circle.setAttribute("cx",myjspinsconfig.pins[i].pos_X);svg_circle.setAttribute("cy",myjspinsconfig.pins[i].pos_Y);svg_circle.setAttribute("r",myjspinsconfig.pins[i].size/2);svg_circle.setAttribute("fill",myjspinsconfig.pins[i].upColor);svg_circle.setAttribute("stroke","#333333");svg_circle.setAttribute("stroke-width",1);tsvgpin.appendChild(svg_circle);addEvent(i)}}});function addEvent(id){const myPin=document.getElementById("myjspins_"+id);const myTip=document.getElementById('myjstip');const downColor='#595959';if(myjspinsconfig.pins[id].active){if(isTouchEnabled()){let touchmoved;myPin.addEventListener('touchstart',function(e){touchmoved=!1;myTip.style.display='none';myPin.setAttribute("fill",myjspinsconfig.pins[id].upColor)});myPin.addEventListener('touchmove',function(){touchmoved=!0});myPin.addEventListener('touchend',function(e){if(!touchmoved){myTip.style.display='none';myPin.setAttribute("fill",myjspinsconfig.pins[id].upColor);if(myjspinsconfig.pins[id].target==='new_page'){window.open(myjspinsconfig.pins[id].url)}else if(myjspinsconfig.pins[id].target==='same_page'){window.location.href=myjspinsconfig.pins[id].url}}})}else{myPin.style.cursor="pointer";myPin.addEventListener('mouseenter',function(){myPin.setAttribute("fill",myjspinsconfig.pins[id].overColor)});myPin.addEventListener('mouseleave',function(){myTip.style.display='none';myPin.setAttribute("fill",myjspinsconfig.pins[id].upColor)});if(myjspinsconfig.pins[id].target!=='none'){myPin.addEventListener('mousedown',function(){myPin.setAttribute('fill',downColor)})}
myPin.addEventListener('mouseup',function(){myTip.style.display='none';myPin.setAttribute("fill",myjspinsconfig.pins[id].overColor);if(myjspinsconfig.pins[id].target==='new_page'){window.open(myjspinsconfig.pins[id].url)}else if(myjspinsconfig.pins[id].target==='same_page'){window.location.href=myjspinsconfig.pins[id].url}});myPin.addEventListener('mousemove',function(e){myTip.style.display='block';myTip.innerHTML=myjspinsconfig.pins[id].hover;let x=e.pageX+10,y=e.pageY+15;let myTipWidth=myTip.offsetWidth,myTipHeight=myTip.offsetHeight;x=(x+myTipWidth>window.innerWidth+window.scrollX)?x-myTipWidth-20:x;y=(y+myTipHeight>window.innerHeight+window.scrollY)?window.innerHeight+window.scrollY-myTipHeight-10:y;myTip.style.left=x+'px';myTip.style.top=y+'px'})}}}})()
