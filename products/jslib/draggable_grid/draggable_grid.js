var DraggableGrid=(function(){var N=window,P=document,U=function(){return false};var M=P.documentElement||{},L=P.createElement("DIV"),C=/backcompat/i.test(P.compatMode),F=!!N.ActiveXObject,A=null,G={test:U};function H(Y){var W=N,X=Y;if(arguments.length>=2){Y=arguments}if(typeof Y!="function"){if(!(X=Y[1]||Y.method)){X=Y[0]}else{W=Y[0]||Y.scope;if(typeof X!="function"){X=W[X]}}}return[W,X]}function O(){var W=H.apply(this,arguments);return function(){W[1].apply(W[0],arguments)}}function K(W,X){var Y=O(Array.prototype.slice.call(arguments,2));W.addEventListener?W.addEventListener(X,Y,false):W.attachEvent("on"+X,Y)}function Q(W){W.stopPropagation&&W.stopPropagation();W.preventDefault&&W.preventDefault();W.cancelBubble=true;W.returnValue=false}function T(){return C?P.body:M}function V(){var W=0,Y=0,X;if(typeof N.pageXOffset=="number"){W=N.pageXOffset;Y=N.pageYOffset}else{X=T();W=X.scrollLeft;Y=X.scrollTop}return{x:W,y:Y}}function S(){var W=T();return{x:W.scrollWidth,y:W.scrollHeight}}function I(){var W=0,Y=0,X;if(typeof N.innerWidth=="number"){W=N.innerWidth;Y=N.innerHeight}else{X=T();W=X.clientWidth;Y=X.clientHeight}return{x:W,y:Y}}function E(Y,X){var W=P.defaultView;return Y.style[X]?Y.style[X]:(W&&W.getComputedStyle?W.getComputedStyle(Y,"").getPropertyValue(X):Y.currentStyle[X])}function R(Y){var b,a,W,c,Z=V(),X=window.opera?0:1;if(Y.getBoundingClientRect){b=T();a=Y.getBoundingClientRect();return{x:a.left+Z.x-(b.clientLeft||0),y:a.top+Z.y-(b.clientTop||0)}}else{b=Y;W=(-b.clientLeft||0)*X+(b.scrollLeft||0);c=(-b.clientTop||0)*X+(b.scrollTop||0);while(b&&b.nodeName.toUpperCase()!="BODY"){W+=(b.offsetLeft||0)+(b.clientLeft||0)*X-(b.scrollLeft||0);c+=(b.offsetTop||0)+(b.clientTop||0)*X-(b.scrollTop||0);a=E(b,"position");if(a=="fixed"){W+=Z.x;c+=Z.y;break}else{if(a=="absolute"&&!N.opera){b=b.offsetParent}else{a=b.offsetParent;while((b=b.parentNode)!=a){W-=(b.scrollLeft||0);c-=(b.scrollTop||0)}}}}return{x:W,y:c}}}function B(y,w){w=w||{};var g=this,AF=!!w.scroll,Z=!!w.fence,AE=new RegExp("(?:^|\\s)"+(w.draggableClass||"draggable")+"(?:$|\\s)"),AG=null,k=w.proxyHtml||"&nbsp;",u=w.proxyClass||"draggable-proxy",W=w.proxyStyle||"background-color: #fcc;",AD=w.opacity||0.7,x=parseInt(w.offset||0,10),m=G,d=G,AN=w.onBegin||U,i=w.onDrop||U,f,AA,AQ,e,AM,AL,AK,AI,AJ,AH,s,q,l,j,AB,z,a,X,t,r,p,o,c,b;(function(){var AS=Y(),AR=w.ignoreTags,AT=w.ignoreClasses;AG=w.handleClass?new RegExp("(?:^|\\s)"+w.handleClass+"(?:$|\\s)"):AE;if(AR&&AR.length>0){m=new RegExp((w.ignoreTags||[]).join("|"),"i")}if(AT&&AT.length>0){d=new RegExp("(?:^|\\s*)(?:"+AT.join("|")+")(?:$|\\s*)","i")}K(AS,"mousedown",g,AO);K(AS,"click",g,v)})();function Y(){return P.getElementById(y)}function AP(AT){var AS=AT.target||AT.srcElement,AR;while(AS&&AS.id!=y&&(AR=AS.parentNode)){if(AS.nodeType==1){if(m.test(AS.nodeName)||d.test(AS.className)){break}if(AG.test(AS.className)){do{if(AR.id==y){return AE.test(AS.className)?AS:null}AS=AR}while(AR=AS.parentNode);break}}AS=AR}return null}function n(AR,AY){var AU,AS,AW,AX,AV=true,AT=Y().childNodes;for(AU=0,AS=AT.length;AU<AS;++AU){if(AE.test((AX=AT[AU]).className)){AW=R(AX);if(AW.x<=AR&&AR<AW.x+AX.offsetWidth&&AW.y<=AY&&AY<AW.y+AX.offsetHeight){return[AX,AV]}}if(AX==L){AV=false}}return null}function AO(AR){B.finishDrag();if(!(f=AP(AR))){return }Q(AR);e=AQ=null;A=this;var AY=Y(),Aa=H(AN),AZ=f.style,AX=R(f),AS=V(),AW,AV,AU,AT;AA=f.nextSibling;AX.x+=x;AX.y+=x;AW=E(f,"display");AV=E(f,"float")||E(f,"styleFloat");AU=E(f,"vertical-align");AT=E(f,"zoom");L.className=u;L.innerHTML=k;L.style.cssText=["width:"+E(f,"width"),"height:"+E(f,"height"),"display:"+AW,AW!="inline-block"&&AW!="inline"&&AV?"float:"+AV:"",AU?"vertical-align:"+AU:"",AT?"zoom:"+AT:"",W].join(";");e=AZ.cssText;AZ.position="absolute";AZ.left=AX.x+"px";AZ.top=AX.y+"px";AZ.opacity=AD;AQ=setInterval(O(this,h),30);AM=AX.x;AL=AX.y;l=AB=a=AR.clientX;j=z=X=AR.clientY;t=p=c=AS.x;r=o=b=AS.y;if(Z){AW=R(AY);AJ=AW.x;AH=AW.y;s=AW.x+AY.offsetWidth;q=AW.y+AY.offsetHeight}else{AW=S();AJ=AH=0;s=AW.x;q=AW.y}s-=f.offsetWidth;q-=f.offsetHeight;AY.insertBefore(L,f);P.body.appendChild(f);Aa[1].call(Aa[0],{manager:this,prevPos:AA})}function v(AR){f&&Q(AR)}function h(){var AY=V();if(AB!=a||z!=X||p!=AY.x||o!=AY.y){var AW=Math.min(Math.max(AM+AB-l+AY.x-t,AJ),s),AU=Math.min(Math.max(AL+z-j+AY.y-r,AH),q),AS,AZ,AX,AR,AV=AY.x,AT=AY.y;f.style.left=AW+"px";f.style.top=AU+"px";if(AS=n(AV+AB,AT+z)){Y().insertBefore(L,AS[1]?AS[0]:AS[0].nextSibling)}if(AF){AZ=I();AX=AW+f.offsetWidth;AR=AU+f.offsetHeight;AW<AV?(AV=AW):(AX>(AV+AZ.x)&&(AV=AX-AZ.x));AU<AT?(AT=AU):(AR>(AT+AZ.y)&&(AT=AR-AZ.y));(AV!=AY.x||AT!=AY.y)&&N.scroll(AV,AT)}a=AB;X=z;p=AY.x;o=AY.y}}function AC(AT,AS){if(f){f.style.cssText=e;(AS||U)();Y().removeChild(L);try{AT=H(AT);AT[1].call(AT[0],{manager:this,prevPos:AA})}catch(AR){}}AQ&&clearInterval(AQ);f=null;AQ=null;AA=null}g.getDraggingElement=function(){return f};g.getProxyElement=function(){return L};g.onMouseMove=function(AR){AB=AR.clientX;z=AR.clientY};g.finishDrag=function(){AC.call(this,i,function(){Y().insertBefore(f,L)})};g.cancelDrag=function(){AC.call(this,U,function(){Y().insertBefore(f,AA)})};g=null}B.finishDrag=function(){if(A){A.finishDrag();A=null}};B.cancelDrag=function(){if(A){A.cancelDrag();A=null}};function D(W){if(A){B.finishDrag();Q(W)}}function J(W){if(A){if(F){if(!(W.button&1)){B.finishDrag();return }Q(W)}A.onMouseMove(W)}}K(P,"mouseup",B,D);K(P,"mousemove",B,J);return B})();