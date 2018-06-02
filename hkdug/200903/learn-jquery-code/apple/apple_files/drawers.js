

if(typeof(AC)=="undefined"){AC={};}

AC.Bureau=Class.create();
Object.extend(AC.Bureau.prototype,Event.Listener);
Object.extend(AC.Bureau.prototype,{

drawers:null,
container:null,

triggerTimeout:null,

initialize:function(container){
this.drawers=[];
this.container=$(container);
},

addDrawer:function(newDrawer){},

getDrawerCount:function(){
return this.drawers.length;
},

hasDrawers:function(){
return(this.drawers.length>0);
},

getFirstDrawer:function(){
return this.drawers[0]||null;
},

getLastDrawer:function(){
return this.drawers[this.drawers.length-1]||null;
},

scheduleTrigger:function(onFire,delay){
this.triggerTimeout=setTimeout(onFire,delay);
},

clearTrigger:function(){
clearTimeout(this.triggerTimeout);
}

});

AC.Drawer=Class.create();
Object.extend(AC.Drawer.prototype,Event.Publisher);
Object.extend(AC.Drawer.prototype,{

bureau:null,

contentElement:null,
handle:null,
indicator:null,

isOpen:true,

beforeOpen:null,
afterOpen:null,

beforeClose:null,
afterClose:null,

transitionDuration:0.3,
triggerDelay:0,





initialize:function(contentElement,handleElement,bureau,options){

this.contentElement=contentElement;
this.handle=handleElement;
this.bureau=bureau;

var triggerEvent='click';

if(options!=null&&typeof(options)!='undefined'){
this.beforeOpen=options.beforeOpen;
this.afterOpen=options.afterOpen;
this.beforeClose=options.beforeClose;
this.afterClose=options.afterClose;


if(typeof(options.triggerEvent)!='undefined'){
triggerEvent=options.triggerEvent;
}

if(typeof(options.triggerDelay)!='undefined'){
this.triggerDelay=options.triggerDelay;
}

if(typeof(options.transitionDuration)!='undefined'){
this.transitionDuration=options.transitionDuration;
}
}

if(AC.Detector.isiPhone()){
this.transitionDuration=0;
triggerEvent='click';
}

Element.addClassName(this.contentElement,'last');

var fireTrigger=function(evt){

Event.stop(evt);

if(this.triggerDelay>0){
var onFire=this.trigger.bind(this);
bureau.scheduleTrigger(onFire,this.triggerDelay);
}else{
this.trigger();
}
}

Event.observe(this.handle,triggerEvent,fireTrigger.bind(this),false);
Event.observe(this.handle,'mouseout',bureau.clearTrigger.bind(bureau),false);

},

toggle:function(){},

open:function(){},

close:function(){}

});


AC.SlidingBureau=Class.create();
Object.extend(AC.SlidingBureau.prototype,AC.Bureau.prototype);
Object.extend(AC.SlidingBureau.prototype,{

isLocked:false,

addDrawer:function(newDrawer){

Element.addClassName(newDrawer.contentElement,'last');
Element.addClassName(newDrawer.handle,'last');

if(this.hasDrawers()){

var lastDrawer=this.getLastDrawer();

lastDrawer.setNextDrawer(newDrawer);
newDrawer.setPreviousDrawer(lastDrawer);
}else{
Element.addClassName(newDrawer.contentElement,'first');
Element.addClassName(newDrawer.handle,'first');
}

this.listenForEvent(newDrawer,'beforeOpen',false,function(evt){
var drawer=evt.event_data.data;
this.open(drawer);
});

this.listenForEvent(newDrawer,'afterOpen',false,function(evt){
var drawer=evt.event_data.data;
this.acknowledgeOpened(drawer);
});

this.listenForEvent(newDrawer,'beforeClose',false,function(evt){
var drawer=evt.event_data.data;
this.close(drawer);
});

this.listenForEvent(newDrawer,'afterClose',false,function(evt){
var drawer=evt.event_data.data;
this.acknowledgeClosed(drawer);
});



if(!Element.hasClassName(newDrawer.contentElement,'open')){
newDrawer.initiateClose();
}else{
this.currentDrawer=newDrawer;
}

this.drawers.push(newDrawer);
},

open:function(drawer){

if(this.isLocked){
return;
}

this.isLocked=true;








if(Element.getStyle(this.container,'position')=='relative'){

var dimensions=Element.getDimensions(this.container);
Element.setStyle(this.container,{height:dimensions.height+"px"});

this.wedgeDrawersAfter(drawer);






var minHeight=Element.getStyle(drawer.contentElement,'min-height');

if(minHeight){
Element.setStyle(drawer.contentElement,{
'min-height':'0px',
height:minHeight})
}
}


if(this.currentDrawer){
this.currentDrawer.initiateClose();
}

drawer.open(minHeight);
},

acknowledgeOpened:function(drawer){
this.currentDrawer=drawer;

if(Element.getStyle(this.container,'position')=='relative'){
if(!AC.Detector.isIEStrict()){
Element.setStyle(this.container,{height:"auto"});
}
this.unwedgeDrawers();
}

this.isLocked=false;
},

close:function(drawer){

if(Element.getStyle(this.container,'position')=='relative'){
var minHeight=Element.getStyle(drawer.contentElement,'min-height');

if(minHeight){
Element.setStyle(drawer.contentElement,{
height:minHeight,
'min-height':'0px'});
}
}

drawer.close(minHeight);
},

acknowledgeClosed:function(drawer){
if(drawer==this.currentDrawer){
this.currentDrawer=null;
}
},

wedgeDrawersAfter:function(drawerBeingOpened){

var wedgeDrawer=function(drawer,offset){
Element.setStyle(drawer.handle,{
position:'absolute',
bottom:offset+'px'})
}

var drawer=this.getLastDrawer();
var offset=0;

while(drawer!=this.currentDrawer&&drawer!=drawerBeingOpened){
wedgeDrawer(drawer,offset);
offset+=drawer.handle.getHeight();
drawer=drawer.previousDrawer;
}

},

unwedgeDrawers:function(){
for(var i=this.drawers.length-1;i>=0;i--){
Element.setStyle(this.drawers[i].handle,{
position:'static'})
};
}


});

AC.SlidingDrawer=Class.create();
Object.extend(AC.SlidingDrawer.prototype,AC.Drawer.prototype);
Object.extend(AC.SlidingDrawer.prototype,{

isOpen:true,
isTransitioning:false,

setNextDrawer:function(drawer){
this.nextDrawer=drawer;
Element.removeClassName(this.contentElement,'last');
Element.removeClassName(this.handle,'last');
},

setPreviousDrawer:function(drawer){
this.previousDrawer=drawer;
},

trigger:function(){
this.toggle();
},

toggle:function(){

if(!this.isOpen){
this.initiateOpen();
}

},

initiateOpen:function(){

if(this.isTransitioning||this.isOpen){
return;
}

this.dispatchEvent('beforeOpen',this);

},

open:function(minHeight){

this.isTransitioning=true;


Element.addClassName(this.contentElement,'open');
Element.addClassName(this.handle,'open');

var afterFinish=function(){
this.isOpen=true;
if(minHeight){
Element.setStyle(this.contentElement,{'min-height':minHeight});
if(!AC.Detector.isIEStrict()){
Element.setStyle(this.contentElement,{'height':'auto'});
}
}
this.dispatchEvent('afterOpen',this);
this.isTransitioning=false;
}.bind(this);

if(AC.Detector.isiPhone()){
this.contentElement.show();
afterFinish();
}else{
new Effect.BlindDown(this.contentElement,{
duration:this.transitionDuration,
afterFinish:afterFinish});
}
},

initiateClose:function(force){

if(this.isTransitioning||!this.isOpen){
return;
}

this.dispatchEvent('beforeClose',this);
},

close:function(minHeight){

this.isTransitioning=true;

var afterFinish=function(){
this.isOpen=false;
Element.removeClassName(this.contentElement,'open');
Element.removeClassName(this.handle,'open');
if(minHeight){
Element.setStyle(this.contentElement,{'min-height':minHeight});
if(!AC.Detector.isIEStrict()){
Element.setStyle(this.contentElement,{'height':'auto'});
}
}
this.dispatchEvent('afterClose',this);
this.isTransitioning=false;
}.bind(this);

if(AC.Detector.isiPhone()){
this.contentElement.hide();
afterFinish();
}else{
new Effect.BlindUp(this.contentElement,{
duration:this.transitionDuration,
afterFinish:afterFinish});
}


}


});


AC.ShingleBureau=Class.create();
Object.extend(Object.extend(AC.ShingleBureau.prototype,AC.Bureau.prototype),{

drawerDuration:0.5,

addDrawer:function(newDrawer){


if(this.hasDrawers()){

var lastDrawer=this.getLastDrawer();

lastDrawer.setNextDrawer(newDrawer);
newDrawer.setPreviousDrawer(lastDrawer);
newDrawer.closedOffset=lastDrawer.closedOffset+lastDrawer.getHandleHeight()-10;
}else{
Element.addClassName(newDrawer.contentElement,'first');
newDrawer.closedOffset=0-newDrawer.getHeight()+newDrawer.getHandleHeight()-10;
newDrawer.indicateVisible();
}


this.drawers.push(newDrawer);
},

getWidth:function(){
return Element.getWidth(this.container);
},

getHeight:function(){
return Element.getHeight(this.container);
},

moveDrawer:function(drawer,x,y){
new Effect.Move(drawer,{
x:x,
y:y,
mode:'absolute',
transition:Effect.Transitions.sinoidal,
duration:this.drawerDuration});
}

});

AC.ShingleDrawer=Class.create();
Object.extend(Object.extend(AC.ShingleDrawer.prototype,AC.Drawer.prototype),{

openedOffset:0,
closedOffset:0,

previousDrawer:null,
nextDrawer:null,

isVisible:false,

trigger:function(){
if(!this.isVisible){
this.open(true);
this.indicateVisible();
}
},

toggle:function(){

if(!this.isOpen){
this.open();
this.indicateVisible();
}else{
this.close();
}

},

open:function(force){

if(this.isOpen&&!force){
return;
}

if(this.previousDrawer!==null){
this.previousDrawer.close();
this.previousDrawer.indicateObscured();
}

if(this.nextDrawer!==null){
this.nextDrawer.open();
this.nextDrawer.indicateObscured();
}

this.indicateVisible();
this.isOpen=true;

this.bureau.moveDrawer(this.contentElement,0,this.openedOffset);
},

close:function(force){

if(!this.isOpen){
return;
}

if(this==this.bureau.getLastDrawer()){
return;
}

if(this.previousDrawer!==null){
this.previousDrawer.close();
}

this.bureau.moveDrawer(this.contentElement,0,this.closedOffset);
this.indicateObscured();
this.isOpen=false;

},

setPreviousDrawer:function(drawer){
this.previousDrawer=drawer;

this.indicateObscured();

this.openedOffset=this.previousDrawer.openedOffset+this.previousDrawer.getHandleHeight()-10;
Element.setStyle(this.contentElement,{top:this.openedOffset+"px"});
},

setNextDrawer:function(drawer){
this.nextDrawer=drawer;

Element.removeClassName(this.contentElement,'last');

if(this.previousDrawer!=null){
this.previousDrawer.setNextDrawer(this);
}


zIndex=parseInt(Element.getStyle(this.contentElement,'zIndex'));
Element.setStyle(this.contentElement,{'zIndex':zIndex+1});
},

indicateObscured:function(){
Element.addClassName(this.contentElement,'obscured');
this.isVisible=false;
},

indicateVisible:function(){
this.isVisible=true;
Element.removeClassName(this.contentElement,'obscured');
},

getHandleWidth:function(){
return Element.getWidth(this.handle);
},

getHandleHeight:function(){
return Element.getHeight(this.handle);
},

getWidth:function(){
return Element.getWidth(this.contentElement);
},

getHeight:function(){
return Element.getHeight(this.contentElement);
}


});



AC.SectionBureau=Class.create();
Object.extend(AC.SectionBureau.prototype,AC.Bureau.prototype);
Object.extend(AC.SectionBureau.prototype,{

currentDrawer:null,
locked:false,

addDrawer:function(newDrawer){
this.drawers.push(newDrawer);
newDrawer.handle.addClassName('obscured');
Element.hide(newDrawer.contentElement);
},

openingDrawer:function(drawer){
if(this.currentDrawer!=null){
this.currentDrawer.close();
}

this.currentDrawer=drawer;
}

});

AC.SectionDrawer=Class.create();
Object.extend(AC.SectionDrawer.prototype,AC.Drawer.prototype);
Object.extend(AC.SectionDrawer.prototype,{

isOpen:false,

trigger:function(){
this.toggle();
},

toggle:function(){

if(!this.isOpen){
this.open();
}

},

open:function(){

if(this.bureau.locked){
return;
}

var afterTransition=function(){
Element.show(this.contentElement);
}.bind(this);






if(typeof(this.afterOpen)=='function'){
this.bureau.locked=true;
afterTransition=this.afterOpen.bind(this);
}

this.bureau.openingDrawer(this);

if(typeof(this.beforeOpen)=='function'){
this.beforeOpen();
}

this.isOpen=true;
Element.removeClassName(this.handle,'obscured');

new Effect.Appear(this.contentElement,{
afterFinish:afterTransition,
duration:this.transitionDuration,
queue:{scope:'sectionalscope'}});


},

close:function(){

if(typeof(this.beforeClose)=='function'){
this.beforeClose();
}

this.isOpen=false;
Element.addClassName(this.handle,'obscured');


var afterTransition=function(){
if(typeof(this.afterClose)=='function'){
this.afterClose();
}

}.bind(this)

new Effect.Fade(this.contentElement,{
afterFinish:afterTransition,
duration:this.transitionDuration,
queue:{scope:'sectionalscope'}});

},

reportFinishedOpening:function(){
this.bureau.locked=false;
}

});