






var enhanceSearch=function(actionUrl){

var removeElement=function(elementId){

var element=document.getElementById(elementId);
element.parentNode.removeChild(element);
}

document.getElementById('g-search').setAttribute('action',actionUrl);
document.getElementById('g-search').setAttribute('method','GET');

removeElement('search-oe');
removeElement('search-access');
removeElement('search-site');
removeElement('search-lr');

}

function loadShortcuts(){
decorateGlobalSearchInput();

var actionUrls={
'global':'http://www.apple.com/search/',
'downloads':'http://www.apple.com/search/downloads/',
'iphone':'http://www.apple.com/search/iphone/',
'ipoditunes':'http://www.apple.com/search/ipoditunes/',
'mac':'http://www.apple.com/search/mac/',
'store':'http://www.apple.com/search/store/',
'support':'http://www.apple.com/search/support/'
}

var actionUrl=actionUrls[searchSection]||'http://www.apple.com/search/';

enhanceSearch(actionUrl);

if((!navigator.userAgent.match(/iPhone/i))&&
(typeof(deactivateSearchShortcuts)=="undefined"||
!deactivateSearchShortcuts)){
SearchShortcut.load();
}
}

function shortcutsPageLoader(newOnload){
var currentOnloads=window.onload;
if(typeof window.onload!='function')window.onload=newOnload;
else window.onload=function(){currentOnloads();newOnload();};
}

shortcutsPageLoader(loadShortcuts);


var SearchShortcut={




requestStrategy:3,
baseUrl:"http://www.apple.com/global/nav/scripts/shortcuts.php",

minimumCharactersForSearch:0,
entryDelay:200,






REQUEST_LOCAL:1,
REQUEST_PROXY:2,
REQUEST_JS:3,
currentRequest:false,
descriptionCharacters:95,
isIe:false,
init:function(){

this.fullSearchUrl=document.getElementById('globalsearch').getElementsByTagName('form')[0].getAttribute('action');

this.html={
results:document.getElementById('sp-results').getElementsByTagName('div')[0],
input:document.getElementById('sp-searchtext')
};


if(navigator.userAgent.toLowerCase().indexOf("msie 6.")!=-1){
document.getElementById('sp-results').style.left="171px";
this.isIe=true;
}
this.pausedControllers=[];
},

track:function(term,destination){
if(typeof(s_gi)=='undefined'||!s_gi){
return;
}
if(typeof(s_account)!='undefined'&&s_account.indexOf('appleussearch')==-1)
s=s_gi(s_account+",appleussearch");
else s=s_gi("appleglobal,appleussearch");
s.prop4="";
s.g_prop4="";
s.prop6="";
s.g_prop6="";
s.pageName="";
s.g_pageName="";
s.pageURL="";
s.g_pageURL="";
s.g_channel="";
s.linkTrackVars="eVar2,eVar4,prop7,prop10";
s.eVar2="WWW-sc: "+term.toLowerCase();
s.prop7="WWW-sc: "+term.toLowerCase();
s.eVar4=destination;
s.prop10=destination;
s.tl(this,'o','Shortcut Search');

},

go:function(location){
SearchShortcut.track(SearchShortcut.searchText,location);
document.location=location;
},

getRequestTransport:function(){
var transport=false;
try{transport=new ActiveXObject('Msxml2.XMLHTTP');}
catch(er){transport=false;}

if(!transport){
try{transport=new ActiveXObject('Microsoft.XMLHTTP');}
catch(er){transport=false;}
}
if(!transport){
try{transport=new XMLHttpRequest();}
catch(er){transport=false;}
}
SearchShortcut.currentRequest=transport;
return transport;
},

ajaxRequest:function(url){
var t=this.getRequestTransport();
if(t){
try{
t.open('GET',url,true);
t.onreadystatechange=function(){
if(t.readyState==4)SearchShortcut.ajaxCallback(t.responseXML);
}
t.send(url);
}
catch(er){}
}
},

ajaxCallback:function(response){
if(!this.html||!this.html.results)this.init();
document.getElementById('sp-search-spinner').style.display='none';
this.term=response.getElementsByTagName('term')[0].firstChild.nodeValue;
this.xml=response.getElementsByTagName('search_results')[0];
this.parseResults(this.xml);
if(this.results){
this.results.length>0?this.renderResults():this.renderNoResults();
}
},

search:function(term){

var url=this.baseUrl+"?q="+encodeURIComponent(term);


if(typeof(searchSection)!="undefined"&&searchSection){
url+="&section="+searchSection;
}


switch(SearchShortcut.requestStrategy){
case SearchShortcut.REQUEST_LOCAL:
this.spin();
this.ajaxRequest(url);
break;
case SearchShortcut.REQUEST_PROXY:
url="/global/scripts/ajax_proxy.php?s=1&r="+encodeURIComponent(url);
this.spin();
this.ajaxRequest(url);
break;
case SearchShortcut.REQUEST_JS:
this.spin();
url+="&transport=js";
var head=document.getElementsByTagName("head")[0];
script=document.createElement('script');
script.id='xdShortcutContainer';
script.type='text/javascript';
script.src=url;
head.appendChild(script);
SearchShortcut.scriptLoadTest();
break;
default:return;
}
},

scriptLoadTest:function(){

var loops=0;
var t=window.setInterval(function(){
loops++;
if(typeof(shortcutXml)!='undefined'){
window.clearInterval(t);
}
else if(loops>20){
window.clearInterval(t);
document.getElementById('sp-search-spinner').style.display='none';
}
},50);
},

loadXmlToDoc:function(text){
var xmlDoc;

if(window.ActiveXObject){
xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
xmlDoc.async="false";
xmlDoc.loadXML(text);
}
else{
var dp=new DOMParser();
xmlDoc=dp.parseFromString(text,"text/xml");
}

if(!this.html||!this.html.results)this.init();
document.getElementById('sp-search-spinner').style.display='none';

this.term=xmlDoc.getElementsByTagName('term')[0].firstChild.nodeValue;
this.xml=xmlDoc.getElementsByTagName('search_results')[0];
this.parseResults(this.xml);

if(this.results){
this.results.length>0?this.renderResults():this.renderNoResults();
}
},

spin:function(){
document.getElementById('sp-search-spinner').style.display='block';
},

parseResults:function(xml){

var error=xml.getElementsByTagName('error');
if(error.length>0){
SearchShortcut.hideResults();
return;
}
else{
var xmlResults=xml.getElementsByTagName('match');


this.results=new Array();
for(var i=0;i<(xmlResults.length);i++){
var result=xmlResults[i];
var resultItem={
title:result.getAttribute('title'),
url:result.getAttribute('url'),
desc:result.getAttribute('copy'),
category:result.getAttribute('category'),
priority:result.getAttribute('priority'),
image:result.getAttribute('image')
};
if(this.requestStrategy==3)resultItem.url=decodeURIComponent(resultItem.url);
this.results.push(resultItem);
}
}
},

renderNoResults:function(){
var noResultsCopy="No Shortcut found. Try a full search of apple.com.";
this.html.results.innerHTML="";
var list=document.createElement('ul');
list.className='sp-results';
listResult=document.createElement('li');
listResult.className='firstCat resultCat';
list.appendChild(listResult);
listResult=document.createElement('li');
listResult.id='sp-result-none';
listResult.className='viewall';

var dv=document.createElement('div');
dv.className='hoverbox';
var lk=document.createElement('a');
lk.href=this.fullSearchUrl+'?q='+encodeURIComponent(this.term);
lk.innerHTML=noResultsCopy;

listResult.appendChild(dv);
listResult.appendChild(lk);

listResult.url=this.fullSearchUrl+'?q='+encodeURIComponent(this.term);
listResult.num=this.results.length;
listResult.onclick=function(){
SearchShortcut.go(this.url);
}
listResult.onmouseover=function(){
SearchShortcut.itemSelected=true;
}
listResult.onmouseout=function(){
SearchShortcut.itemSelected=false;
}
list.appendChild(listResult);
this.html.results.appendChild(list);
document.getElementById('globalsearch').className='active';
},


hideAllQuicktimeMovies:function(){
if(typeof(AC)!='undefined'&&
typeof(AC.Quicktime)!='undefined'&&
typeof(AC.Quicktime.controllers)!='undefined'){


function findPos(obj){
var curleft=curtop=0;
if(obj.offsetParent){
curleft=obj.offsetLeft
curtop=obj.offsetTop
while(obj=obj.offsetParent){
curleft+=obj.offsetLeft
curtop+=obj.offsetTop
}
}
return[curleft,curtop];
}

function intersect(xUpLeftA,yUpLeftA,wA,hA,xUpLeftB,yUpLeftB,wB,hB){

var xLowRightA=xUpLeftA+wA;
var yLowRightA=yUpLeftA+hA;

var xLowRightB=xUpLeftB+wB;
var yLowRightB=yUpLeftB+hB;

var left=Math.max(xUpLeftA,xUpLeftB)
var top=Math.max(yUpLeftA,yUpLeftB)
var right=Math.min(xLowRightA,xLowRightB)
var bottom=Math.min(yLowRightA,yLowRightB)

return right>left&&bottom>top;
}

var controllers=AC.Quicktime.controllers;


var dropdown=$('sp-results');
var dropDimensions={width:328,height:448}
var dropPosition=findPos(dropdown);

var dropX=dropPosition[0]-328;
var dropY=dropPosition[1];

var dropRightX=x+dropDimensions.width;
var dropRightY=y+dropDimensions.height;


for(var i=controllers.length-1;i>=0;i--){

var movie=controllers[i].movie;
var movieDimensions=Element.getDimensions(movie);
var position=findPos(movie);

var x=position[0];
var y=position[1];

if(intersect(
x,y,movieDimensions.width,movieDimensions.height,
dropX,dropY,dropDimensions.width,dropDimensions.height)){

this.pausedControllers.push(controllers[i]);

controllers[i].Stop();
controllers[i].movie.style.visibility="hidden";
}
}


}
else{
var qtm=document.getElementsByTagName('object');
for(i=0;i<qtm.length;i++){
if(typeof(qtm[i].Stop)!='undefined')qtm[i].Stop();
try{
if(typeof(qtm[i].getElementsByTagName('embed')[0].Stop)!='undefined')qtm[i].getElementsByTagName('embed')[0].Stop();
}catch(er){}
qtm[i].style.visibility="hidden";
}
}
},

showAllQuicktimeMovies:function(){
if(typeof(AC)!='undefined'&&
typeof(AC.Quicktime)!='undefined'&&
typeof(AC.Quicktime.controllers)!='undefined'){

for(var i=this.pausedControllers.length-1;i>=0;i--){
this.pausedControllers[i].movie.style.visibility="visible";


if(navigator.userAgent.match(/Firefox/i)){
setTimeout(this.pausedControllers[i].Play,100);
}else{
this.pausedControllers[i].Play();
}

}

this.pausedControllers=[];

}
else{
var qtm=document.getElementsByTagName('object');
for(i=0;i<qtm.length;i++){
qtm[i].style.visibility="visible";
if(typeof(qtm[i].Play)!='undefined')qtm[i].Play();
try{
if(typeof(qtm[i].getElementsByTagName('embed')[0].Play)!='undefined')qtm[i].getElementsByTagName('embed')[0].Play();
}catch(er){}
}
}
},

startFlashFixTimer:function(){
var count=0;
var i=setInterval(function(){
SearchShortcut.flashDomRender();
count++;
if(count>50){
clearInterval(i);
}
},10);
},
border:5,
flashDomFix:function(){
document.getElementById('sp-results').firstChild.firstChild.style.border="5px none red";
document.getElementById('globalsearch').onmousemove=function(){
SearchShortcut.flashDomRender();
}
},

flashDomRender:function(){
SearchShortcut.border%2==0?SearchShortcut.border++:SearchShortcut.border--;
var elem=document.getElementById('sp-results').firstChild.firstChild;
if(elem)elem.style.border=SearchShortcut.border+"px none red";
},

itemSelected:false,

renderResults:function(){
this.html.results.innerHTML='';

var list=document.createElement('ul')
list.className='sp-results';

var resultsByCat={};

for(var i=0;i<this.results.length;i++){
var result=this.results[i];


var descriptionCopy=result.desc;
var titleCopy="";
if(descriptionCopy.length>this.descriptionCharacters){
descriptionCopy=descriptionCopy.substring(0,descriptionCopy.indexOf(" ",this.descriptionCharacters-11))+"&hellip;";
titleCopy=unescape(result.desc);
}

var cleanTitle=unescape(result.title);
if(cleanTitle.length>40)cleanTitle=cleanTitle.substring(0,cleanTitle.indexOf(" ",30))+"&hellip;";

var listResult=document.createElement('li');
listResult.id='sp-result-'+i;
listResult.className='category-'+result.category.toLowerCase().replace(/\s+/g,"-");

var dv=document.createElement("div");
dv.className="hoverbox";

var image=document.createElement("img");
image.src=result.image;
image.title=titleCopy;

var span=document.createElement("span");
span.className="text";
var header=document.createElement("h4");

var link=document.createElement("a");
var copy=document.createElement("p");

link.href=decodeURIComponent(result.url);
link.title=titleCopy;
link.onclick=function(){
SearchShortcut.go(decodeURIComponent(result.url));
}
link.innerHTML=cleanTitle;

copy.innerHTML=unescape(descriptionCopy);
copy.title=titleCopy;

header.appendChild(link);
span.appendChild(header);
span.appendChild(copy);

listResult.appendChild(dv);
listResult.appendChild(image);
listResult.appendChild(span);

listResult.url=result.url;
listResult.num=i;

listResult.onmouseover=function(){
SearchShortcut.itemSelected=true;
SearchShortcut.highlight(this);
}
listResult.onmouseup=function(){
SearchShortcut.itemSelected=true;
SearchShortcut.go(this.url);
}


listResult.onmouseout=function(){
SearchShortcut.itemSelected=false;
SearchShortcut.unhighlight(this);
}

listResult.priority=parseInt(result.priority);

if(!resultsByCat[result.category])resultsByCat[result.category]=new Array();
resultsByCat[result.category].push(listResult);
}


var catClass='firstCat resultCat';

for(var cat in resultsByCat){

if(!resultsByCat.hasOwnProperty(cat))
continue;

listResult=document.createElement('li');
listResult.className=catClass;
listResult.innerHTML=cat;
catClass='resultCat';
list.appendChild(listResult);

for(var r=0;r<resultsByCat[cat].length;r++){
list.appendChild(resultsByCat[cat][r]);
}
}


listResult=document.createElement('li');
listResult.id='sp-result-'+this.results.length;
listResult.className="viewall";

var dv=document.createElement('div');
dv.className='hoverbox';

var link=document.createElement('a');
link.href=this.fullSearchUrl+'?q='+encodeURIComponent(this.term);
link.innerHTML='View all search results';

listResult.appendChild(dv);
listResult.appendChild(link);

listResult.url=this.fullSearchUrl+'?q='+encodeURIComponent(this.term);
listResult.num=this.results.length;

listResult.onclick=function(){
SearchShortcut.go(this.url);
}
listResult.onmouseover=function(){
SearchShortcut.itemSelected=true;
}
listResult.onmouseout=function(){
SearchShortcut.itemSelected=false;
}
document.getElementById('globalsearch').className='active';
list.appendChild(listResult);

this.html.results.appendChild(list);


this.hideAllQuicktimeMovies();
if(typeof(flashOnPage)!="undefined"&&flashOnPage){
this.flashDomFix();
this.startFlashFixTimer();
}
},

startKeystrokeTimer:function(){
if(this.timeoutId){
window.clearTimeout(this.timeoutId);
}
this.timeoutId=window.setTimeout("SearchShortcut.commitKeystroke()",this.entryDelay);
},

commitKeystroke:function(){
this.search(this.searchText);
},

hideResults:function(keepTerm,pause){



if(!this.html)this.init();

this.selected=null;

document.getElementById('globalsearch').className="";
this.html.results.innerHTML='';
this.showAllQuicktimeMovies();

},

highlight:function(resultLi){
resultLi.className='hoverli';
},

keyHighlight:function(resultLi){
if(this.selected)this.selected.className="";
this.selected=resultLi;
resultLi.className='hoverli';
},

unhighlight:function(resultLi){
resultLi.className='';
},

load:function(){


var spinner=document.createElement('img');
spinner.src="/global/nav/images/spinner.gif";
spinner.width="11";
spinner.height="11";
spinner.border="0";
spinner.alt="*";
spinner.id="sp-search-spinner";
spinner.style.display="none";
document.getElementById('globalsearch').appendChild(spinner);

document.getElementById('g-search').onsubmit=function(evt){
return false;
}

if(navigator.userAgent.match(/AppleWebKit/i)){
document.getElementById('sp-searchtext').onkeydown=function(evt){
var keyCode=typeof(event)!="undefined"?event["keyCode"]:evt.keyCode;
if(!evt)evt=event;


if(keyCode==13){


if(SearchShortcut.selected){
SearchShortcut.go(SearchShortcut.selected.url);
}

else{
SearchShortcut.hideResults();
document.getElementById('g-search').submit();
}
}

}
}



document.getElementById('sp-searchtext').onkeyup=function(evt){

var keyCode=typeof(event)!="undefined"?event["keyCode"]:evt.keyCode;
if(!evt)evt=event;


if(keyCode==40&&SearchShortcut.results){
try{
evt.preventDefault();
evt.stopPropagation();
}catch(er){}

if(SearchShortcut.selected&&(SearchShortcut.results.length>SearchShortcut.selected.num+1)){
SearchShortcut.keyHighlight(document.getElementById('sp-result-'+(SearchShortcut.selected.num+1)));
}
if(!SearchShortcut.selected&&SearchShortcut.results.length>0){
SearchShortcut.keyHighlight(document.getElementById('sp-result-0'));
}
SearchShortcut.flashDomRender();
}





else if(keyCode==38&&SearchShortcut.results){
try{
evt.preventDefault();
evt.stopPropagation();
}catch(er){}
if(SearchShortcut.selected&&SearchShortcut.selected.num>0){
SearchShortcut.keyHighlight(document.getElementById('sp-result-'+(SearchShortcut.selected.num-1)))
}
SearchShortcut.flashDomRender();

}

else if(keyCode==27){
SearchShortcut.hideResults();
document.getElementById('sp-searchtext').value="";
}

else{
SearchShortcut.selected=false;
var q=document.getElementById('sp-searchtext').value;
q=q.replace(/[^.A-Z0-9\s]/ig,'');
q=q.replace(/^\s+/g,'').replace(/\s+$/g,'');

if(q.length<1&&SearchShortcut.html){
SearchShortcut.html.results.innerHTML='';
document.getElementById('sp-search-spinner').style.display='none';
SearchShortcut.hideResults();
}

else if(q.length>SearchShortcut.minimumCharactersForSearch){
SearchShortcut.searchText=q;
SearchShortcut.startKeystrokeTimer();
}
}
};

}
};

function decorateGlobalSearchInput(){
var searchField=document.getElementById('sp-searchtext');
var standIn=null;

var results=0;
var placeholder='Search';
var autosave='';

if(navigator.userAgent.match(/AppleWebKit/i)){

searchField.setAttribute('type','search');
if(!searchField.getAttribute('results')){
searchField.setAttribute('results',results);
}

if(null!=placeholder){
searchField.setAttribute('placeholder',placeholder);
searchField.setAttribute('autosave',autosave);
}

searchField.onblur=function(){

if(!SearchShortcut.itemSelected){
SearchShortcut.hideResults();
}
}

}else{




searchField.setAttribute('autocomplete','off');





standIn=document.createElement('input');
searchField.parentNode.replaceChild(standIn,searchField)

var left=document.createElement('span');
left.className='left';

var right=document.createElement('span');
right.className='right';

var reset=document.createElement('div');
reset.className='reset';

var wrapper=document.createElement('div');
wrapper.className='search-wrapper';

var alreadyHasPlaceholder=searchField.value==placeholder;
var isEmpty=searchField.value.length==0;

if(alreadyHasPlaceholder||isEmpty){
searchField.value=placeholder;
wrapper.className+=' blurred empty';
}

wrapper.appendChild(left);
wrapper.appendChild(searchField);
wrapper.appendChild(right);
wrapper.appendChild(reset);

searchField.onfocus=function(){

var blurred=wrapper.className.indexOf('blurred')>-1;



if(searchField.value==placeholder&&blurred){
searchField.value='';
}

wrapper.className=wrapper.className.replace('blurred','');
}

searchField.onblur=function(){

if(!SearchShortcut.itemSelected){
SearchShortcut.hideResults();
}

if(searchField.value==''){
wrapper.className+=' empty';
searchField.value=placeholder;
}

wrapper.className+=' blurred';
}

searchField.onkeydown=function(evt){


var keyCode=typeof(event)!="undefined"?event["keyCode"]:evt.keyCode;
if(!evt)evt=event;


if(keyCode==13){


if(SearchShortcut.selected){
SearchShortcut.go(SearchShortcut.selected.url);
}

else{
SearchShortcut.hideResults();
document.getElementById('g-search').submit();
}
return;
}


if(searchField.value.length>=0){
wrapper.className=wrapper.className.replace('empty','');
}

resetField();

}

var resetField=function(){
return(function(evt){

var escaped=false;

if(!evt){
evt=window.event;
}

if(evt.type=='keydown'){

alert('down')

if(evt.keyCode!=27){
return;
}else{
escaped=true;
}
}

searchField.blur();
searchField.value='';
wrapper.className+=' empty';
searchField.focus();

})
}
reset.onmousedown=resetField();

if(standIn){
standIn.parentNode.replaceChild(wrapper,standIn);
}
}
}

