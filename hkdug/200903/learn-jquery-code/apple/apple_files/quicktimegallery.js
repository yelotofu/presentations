
frontRowSection=Class.create();
Object.extend(Object.extend(frontRowSection.prototype,AC.FrontRowSection.prototype),{

activate:function(){
Element.addClassName(this.trigger,'active');
this.trigger.innerHTML=this.trigger.innerHTML.replace(/Play now/,'Now playing');
},

deactivate:function(){
Element.removeClassName(this.trigger,'active');
this.trigger.innerHTML=this.trigger.innerHTML.replace(/Now Playing/,'Play now');
}

});

QuicktimeGallery=Class.create();
QuicktimeGallery.prototype={

displayPanel:null,
controller:null,
descriptionPanel:null,
gallerySections:null,

frontrow:null,

initialSection:null,
requestedSpecificSection:false,

waitingToLookForFinished:null,

initialize:function(){

this.displayPanel=$('quicktime');
this.controller=$('quicktimecontroller');
this.descriptionPanel=$('descriptionpanel');
this.gallerySections=$('videos').getElementsByClassName('button');

if(!this.checkQuicktime()){
return;
}

var initialMovieId=this.getInitialSectionId();

this.populateFrontrow(initialMovieId);


if(!this.requestedSpecificSection){
var placeholder=Element.getElementsByClassName(this.displayPanel,'poster')[0];
Event.observe(placeholder,'click',
this.frontrow.show.bind(this.frontrow,this.initialSection));

}else{

this.frontrow.show(this.initialSection);
}
},

track:function(movieName){
if(typeof(s_gi)=='undefined'||!s_gi){
return;
}

s=s_gi("appleglobal,appleitunes,appleusitunesipod");

s.prop4="";
s.g_prop4="";
s.prop6="";
s.g_prop6="";
s.pageName="";
s.g_pageName="";
s.pageURL="";
s.g_pageURL="";
s.g_channel="";

s.linkTrackVars="prop3";
s.prop3="Apple iPod + iTunes Movies: "+movieName.toLowerCase();
s.tl(this,'o','iPod + iTunes Movies');

},

checkQuicktime:function(){
if(!AC.Detector.isValidQTAvailable('7')){
this.displayPanel.innerHTML='<a href="/go/quicktime/"><img src="http://images.apple.com/mac/images/quicktime_required.gif" alt="QuickTime 7 Required." width="547" height="312" border="0"></a>';
return false;
}else{
return true;
}
},

getInitialSectionId:function(){
var initialMovieId=document.location.search.toQueryParams()['movie'];

if(!initialMovieId&&defaultId){
initialMovieId=defaultId;
}else{
this.requestedSpecificSection=true;
}

return initialMovieId;
},

populateFrontrow:function(initialMovieId){
var sections=[];

for(var i=0;i<this.gallerySections.length;i++){
if(this.gallerySections[i].hasAttribute('id')){
var movieLinks=this.gallerySections[i].getElementsByClassName('movielink');
var movieUrl=movieLinks[0].href;
var title=movieLinks[0].innerHTML;
var description=this.gallerySections[i].getElementsByClassName('description');
description=(description.length>0)?this.gallerySections[i].getElementsByClassName('description')[0]:title;

var id=this.gallerySections[i].id.replace(/^mov-/,'');


for(var j=0;j<movieLinks.length;j++){
movieLinks[j].setAttribute('href','?movie='+id);
};

var newSection=new frontRowSection(this.gallerySections[i],'object'+i,movieUrl,description);
sections.push(newSection);




if(initialMovieId==id){
this.initialSection=newSection;
}
}
}



if(!this.initialSection){
this.initialSection=sections[0];
}

var moviePackage=this.createMovie(this.initialSection.movieUrl,true);
var movie=moviePackage.movie;
var movieController=moviePackage.controller;

var beforeStartMovieCallback=function(gallery){
return function(section){

if(gallery.initialSection!=section){

var moviePackage=gallery.createMovie(section.movieUrl,false);
var movie=moviePackage.movie;

gallery.frontrow.currentMovie=movie;

moviePackage=null;
movie=null;
}
$('quicktime').innerHTML="";

gallery.refreshDisplay(false,section);


gallery.frontrow.options.beforeStartMovie=gallery.refreshDisplay.bind(gallery,false);
}
}

var startMovieCallback=function(gallery){

return function(section){

var controller=gallery.frontrow.currentController;

if(controller&&!controller.movie){
controller.attachToMovie(gallery.frontrow.currentMovie);
controller.monitorMovie();
}


gallery.frontrow.options.onStartMovie=null;

}

}

this.frontrow=new AC.FrontRow(movie,this.displayPanel,this.descriptionPanel,sections,{
controller:movieController,

beforeStartMovie:beforeStartMovieCallback(this),
onStartMovie:startMovieCallback(this)});

moviePackage=null;
movie=null;
},

createMovie:function(movieUrl,createController){

var moviewidth=560;
var movieheight=316;



if(AC.Detector.isOpera()){
var controllerstatus=true;
this.controller.style.display='none';
movieheight+=16;
if(createController){
this.displayPanel.style.width=moviewidth+'px';
}
}else{
var controllerstatus=false;
if(createController){
var movieController=new AC.QuicktimeController();
movieController.render(this.controller);
}
}


var movie=new AC.Quicktime.packageMovie('gallery-movie',movieUrl,{
width:moviewidth,
height:movieheight,
autostart:true,
controller:controllerstatus,
showlogo:false,
cache:true,
bgcolor:'#000000'
});

return{movie:movie,controller:movieController};
},

showSectionEnd:function(){



this.frontrow.currentController.hardPaused=true;

var endState=this.frontrow.currentSection.trigger.getElementsByClassName('endstate')[0].cloneNode(true);

this.displayPanel.addClassName('loading');
this.frontrow.currentController.controllerPanel.removeClassName('active');

this.displayPanel.appendChild(endState);
new Effect.Appear(endState);

var replayButton=Element.getElementsByClassName(endState,'replay')[0];
replayButton.onclick=function(){
this.refreshDisplay(true);
return false;
}.bind(this);

},

refreshDisplay:function(replaySection,section){

if(section){

this.track(section.description,replaySection);
}else{

this.track(this.frontrow.currentSection.description,replaySection);
}

var endState=Element.getElementsByClassName(this.displayPanel,'endstate')[0];
if(endState){
endState.parentNode.removeChild(endState);
}

this.displayPanel.removeClassName('loading');
this.frontrow.currentController.controllerPanel.addClassName('active');


clearTimeout(this.waitingToLookForFinished);

if(typeof(replaySection)!='undefined'&&replaySection){

this.frontrow.currentController.Rewind();
this.frontrow.currentController.Play();

}else{


if(this.frontrow.currentController.options){
this.frontrow.currentController.options.onMovieFinished=null;
}

var movieFinishedCallback=this.showSectionEnd.bind(this);


var lookForFinished=function(controller,callback){
return function(){

controller.options.onMovieFinished=callback;
}
}


this.waitingToLookForFinished=setTimeout(lookForFinished(this.frontrow.currentController,movieFinishedCallback),10000);
}
}
}


QuicktimeSwitcher=Class.create();
QuicktimeSwitcher.prototype={

displayPanel:null,
descriptionPanel:null,
sections:null,

initialize:function(){

this.displayPanel=$('quicktime');
this.descriptionPanel=$('descriptionpanel');
this.sections=[];
var gallerySections=$('videos').getElementsByClassName('button');

$('quicktimecontroller').style.height="30px";

this.displayPanel.innerHTML="";
$$('#videos .nowplaying')[0].setStyle({visibility:'hidden'});

var section=null;

for(var i=0;i<gallerySections.length;i++){

var movieLink=gallerySections[i].getElementsByClassName('movielink')[0];
var movieUrl=movieLink.href;
movieLink.href="#";

var posterFrame=gallerySections[i].getElementsByClassName('posterFrame')[0];
var posterFrameUrl=posterFrame.innerHTML.match(/src="(.*)"/)[1];

section={movieUrl:movieUrl,posterFrameUrl:posterFrameUrl};
this.sections.push(section);

Event.observe(gallerySections[i],'click',function(evt,section){
Event.stop(evt);
this.showSection(section);
}.bindAsEventListener(this,this.sections[i]));

}

this.showSection(this.sections[0]);

},

showSection:function(section){

this.displayPanel.innerHTML="";
this.displayPanel.removeClassName('loading');

var movie=AC.Quicktime.packageMovie('galleryMovie',
section.movieUrl,{
width:this.displayPanel.getWidth(),
height:this.displayPanel.getHeight(),
posterFrame:section.posterFrameUrl,
controller:false,
showlogo:false,
cache:true
});

this.displayPanel.appendChild(movie);

}

}


Event.observe(window,'load',function(){

if(!AC.Detector.isiPhone()){
new QuicktimeGallery();
}else{
new QuicktimeSwitcher();
}
},false);
