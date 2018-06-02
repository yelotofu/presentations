
if(typeof(AC)=="undefined"){AC={};}









AC.ProductBrowser={
productSlider:null,
sliderVal:0,
animationId:false,
viewportWidth:946,
contentWidth:946,
categories:[
{id:'pb-cat1',offset:0},
{id:'pb-cat2',offset:0.32}
],
isIPhone:AC.Detector.isiPhone(),
iPhoneCategories:[
{id:'pb-cat1',offset:0},
{id:'pb-cat2',offset:0.32}
],
arrowScrollAmount:0.24,
iPhoneScrollAmount:0.22,
iPhoneContainerWidth:834,
isSliding:false,
lastX:0.32,
isMouseDown:false,
dif:0,
overlap:0,
offsetImageWidth:127,
sliderOffset:291,
offsetContentWidth:-946,
clicked:false,
startIndex:0,

isIpScroll:false,
hasIpDragged:false,
init:function(setupArgs){
if(typeof(setupArgs.categories)!='undefined')this.categories=setupArgs.categories;
if(typeof(setupArgs.imageOverlap)!='undefined')this.overlap=setupArgs.imageOverlap;
if(typeof(setupArgs.sliderCentering)!='undefined')this.sliderOffset=setupArgs.sliderCentering;
if(typeof(setupArgs.initialCategory)!='undefined')this.startIndex=setupArgs.initialCategory;
if(typeof(setupArgs.arrowScrollAmount)!='undefined')this.arrowScrollAmount=setupArgs.arrowScrollAmount;
if(typeof(setupArgs.iPhoneCategories)!='undefined'){this.iPhoneCategories=setupArgs.iPhoneCategories;}
if(typeof(setupArgs.iPhoneScrollAmount)!='undefined')this.iPhoneScrollAmount=setupArgs.iPhoneScrollAmount;
if(typeof(setupArgs.iPhoneContainerWidth)!='undefined')this.iPhoneContainerWidth=setupArgs.iPhoneContainerWidth;

$('pb-productslidertrack').style.visibility="visible";
$('pb-productbrowsercontainer').style.overflow="hidden";

this.viewportWidth=$('pb-productbrowsercontainer').getWidth();
this.offsetImageWidth=$$('#pb-productslider .pb-productimage')[0].getWidth()-this.overlap;
this.contentWidth=this.offsetImageWidth*$$('#pb-productslider .pb-productimage').length;
this.offsetContentWidth=-1*(this.contentWidth-this.viewportWidth);

this.productSlider=new Control.Slider('pb-productsliderhandle','pb-productslidertrack',{
axis:'horizontal'
});

if(AC.ProductBrowser.isIPhone){
this.categories=this.iPhoneCategories;
this.arrowScrollAmount=this.iPhoneScrollAmount;
$('pb-productslidertrack').style.visibility="none";
$('pb-leftarrow').style.visibility="none";
$('pb-rightarrow').style.visibility="none";
$('pb-productbrowsercontainer').style.width=this.iPhoneContainerWidth+"px";

var leftArrow=document.createElement('div');
leftArrow.id="pb-iphone-leftarrow";

var rightArrow=document.createElement('div');
rightArrow.id="pb-iphone-rightarrow";

$('productbrowser').appendChild(leftArrow);
$('productbrowser').appendChild(rightArrow);

Event.observe($(leftArrow),'click',function(){
AC.ProductBrowser.left();
});

Event.observe($(rightArrow),'click',function(){
AC.ProductBrowser.right();
});
}

AC.ProductBrowser.animateSlide(this.categories[this.startIndex].offset);


this.productSlider.options.onChange=function(value){
$('pb-productsliderhandleimage').style.left=$('pb-productsliderhandle').style.left;

if(AC.ProductBrowser.isThrow&&!AC.ProductBrowser.isSliding){
AC.ProductBrowser.isSliding=true;
AC.ProductBrowser.isThrow=false;

var mod=value+AC.ProductBrowser.throwMod;
if(mod<0)mod=0;
if(mod>1)mod=1;
AC.ProductBrowser.animateSlide(mod);
}
else if(!AC.ProductBrowser.isSliding&&value){
AC.ProductBrowser.isSliding=true;
AC.ProductBrowser.animateSlide(value);
}
};

this.productSlider.options.onSlide=function(value){
$('pb-productsliderhandleimage').style.left=$('pb-productsliderhandle').style.left;
if(value&&!AC.ProductBrowser.isSliding){
AC.ProductBrowser.isSliding=true;
AC.ProductBrowser.isThrow=false;
if(AC.ProductBrowser.isMouseDown){
AC.ProductBrowser.dif=value-AC.ProductBrowser.lastX;
AC.ProductBrowser.lastX=value;


if(AC.ProductBrowser.dif>0.05){
AC.ProductBrowser.isThrow=true;
AC.ProductBrowser.throwMod=0.2;
}
else if(AC.ProductBrowser.dif<-0.04){
AC.ProductBrowser.isThrow=true;
AC.ProductBrowser.throwMod=-0.2;
}
}

var w=AC.ProductBrowser.offsetContentWidth;
$('pb-productslider').style.left=w*value+"px";

this.sliderVal=value;
AC.ProductBrowser.lastX=value;
AC.ProductBrowser.colorCats();
AC.ProductBrowser.isSliding=false;
}

Element.setStyle($('pb-productbrowsercontainer'),{overflow:"hidden"});
};

Event.observe('pb-productslidertrack','mousedown',function(e){
var o=e.offsetX||e.layerX;
if(Event.element(e).id=='pb-productslidertrack'&&o<100)AC.ProductBrowser.animateSlide(0);
});
Event.observe('pb-leftarrow','mousedown',function(){
AC.ProductBrowser.left();
});
Event.observe('pb-rightarrow','mousedown',function(){
AC.ProductBrowser.right();
});

Event.observe('pb-productsliderhandle','mousedown',function(){
AC.ProductBrowser.isMouseDown=true;
$('pb-productsliderhandle').style.zIndex="5";
});

Event.observe('pb-productsliderhandle','mouseup',function(){
AC.ProductBrowser.isMouseDown=false;
});

AC.ProductBrowser.categories.each(function(c){
Event.observe($(c.id),'mouseup',function(e){
AC.ProductBrowser.animateSlide(c.offset);
});
});
},

animateSlide:function(toX){

if(toX>1)toX=1;
if(toX<0)toX=0;
AC.ProductBrowser.sliderVal=toX;
window.clearInterval(AC.ProductBrowser.animationId);
var w=AC.ProductBrowser.offsetContentWidth;
var stopPoint=w*toX;

var sliderStopPoint=(Math.round(AC.ProductBrowser.viewportWidth-AC.ProductBrowser.sliderOffset)*toX);

AC.ProductBrowser.isSliding=true;
AC.ProductBrowser.animationId=window.setInterval(function(){
var sliderPos=parseInt($('pb-productslider').getStyle('left'))||0;
var handlePos=parseInt($('pb-productsliderhandle').getStyle('left'))||0;
var x=AC.ProductBrowser.calculateDecel(sliderPos,stopPoint);
var sx=AC.ProductBrowser.calculateDecel(handlePos,sliderStopPoint);
$('pb-productslider').style.left=x+"px";
$('pb-productsliderhandle').style.left=sx+"px";
$('pb-productsliderhandleimage').style.left=sx+"px";
AC.ProductBrowser.colorCats();

if(x==stopPoint){
window.clearInterval(AC.ProductBrowser.animationId);
AC.ProductBrowser.isSliding=false;
}
},30);

},

colorCats:function(){
var sliderX=parseInt($('pb-productsliderhandle').getStyle('left'))+(($('pb-productsliderhandle').getWidth()-20)/2);
AC.ProductBrowser.categories.each(function(c){
var left=parseInt($(c.id).getStyle('left'))
var clr=Math.ceil((Math.min(sliderX,left)/Math.max(sliderX,left))*10);
$(c.id).className='pb-catclass'+clr;
});
},

left:function(){
AC.ProductBrowser.animateSlide(AC.ProductBrowser.sliderVal-AC.ProductBrowser.arrowScrollAmount);
},

right:function(){
AC.ProductBrowser.animateSlide(AC.ProductBrowser.sliderVal+AC.ProductBrowser.arrowScrollAmount);
},

calculateDecel:function(from,to){
var n=from-Math.floor((from-to)*.4);
if(Math.abs(from-to)<4)return to;
else return n;
}
};
