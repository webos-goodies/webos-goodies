(function(){var i=void 0,j=true,l=null,m=false;function aa(a){return function(b){this[a]=b}}var p,q=this;
function ba(a){var b=typeof a;if(b=="object")if(a){if(a instanceof Array)return"array";else if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if(c=="[object Window]")return"object";if(c=="[object Array]"||typeof a.length=="number"&&typeof a.splice!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("splice"))return"array";if(c=="[object Function]"||typeof a.call!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if(b=="function"&&typeof a.call=="undefined")return"object";return b}function s(a){return ba(a)=="array"}function ca(a){var b=ba(a);return b=="array"||b=="object"&&typeof a.length=="number"}function t(a){return typeof a=="string"}function u(a){return ba(a)=="function"}function da(a){a=ba(a);return a=="object"||a=="array"||a=="function"}function v(a){return a[ea]||(a[ea]=++fa)}var ea="closure_uid_"+Math.floor(Math.random()*2147483648).toString(36),fa=0;
function ga(a,b,c){return a.call.apply(a.bind,arguments)}function ha(a,b,c){if(!a)throw Error();if(arguments.length>2){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}else return function(){return a.apply(b,arguments)}}function w(a,b,c){w=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?ga:ha;return w.apply(l,arguments)}var ia=Date.now||function(){return+new Date};
function x(a,b){function c(){}c.prototype=b.prototype;a.D=b.prototype;a.prototype=new c};function ka(a,b){for(var c=1;c<arguments.length;c++)var d=String(arguments[c]).replace(/\$/g,"$$$$"),a=a.replace(/\%s/,d);return a}var la=/^[a-zA-Z0-9\-_.!~*'()]*$/;function y(a){a=String(a);return!la.test(a)?encodeURIComponent(a):a}function z(a){if(!ma.test(a))return a;a.indexOf("&")!=-1&&(a=a.replace(na,"&amp;"));a.indexOf("<")!=-1&&(a=a.replace(oa,"&lt;"));a.indexOf(">")!=-1&&(a=a.replace(pa,"&gt;"));a.indexOf('"')!=-1&&(a=a.replace(qa,"&quot;"));return a}
var na=/&/g,oa=/</g,pa=/>/g,qa=/\"/g,ma=/[&<>\"]/;function A(a,b){var c=String(a),d=c.indexOf(".");if(d==-1)d=c.length;d=Math.max(0,b-d);return Array(d+1).join("0")+c}function C(a){return Array.prototype.join.call(arguments,"")}function ra(a,b){if(a<b)return-1;else if(a>b)return 1;return 0};var D,sa,ta,ua;function va(){return q.navigator?q.navigator.userAgent:l}ua=ta=sa=D=m;var wa;if(wa=va()){var xa=q.navigator;D=wa.indexOf("Opera")==0;sa=!D&&wa.indexOf("MSIE")!=-1;ta=!D&&wa.indexOf("WebKit")!=-1;ua=!D&&!ta&&xa.product=="Gecko"}var ya=D,E=sa,F=ua,G=ta,za=q.navigator,Aa=(za&&za.platform||"").indexOf("Mac")!=-1,Ba;
a:{var Ca="",H;if(ya&&q.opera)var Da=q.opera.version,Ca=typeof Da=="function"?Da():Da;else if(F?H=/rv\:([^\);]+)(\)|;)/:E?H=/MSIE\s+([^\);]+)(\)|;)/:G&&(H=/WebKit\/(\S+)/),H)var Ea=H.exec(va()),Ca=Ea?Ea[1]:"";if(E){var Fa,Ga=q.document;Fa=Ga?Ga.documentMode:i;if(Fa>parseFloat(Ca)){Ba=String(Fa);break a}}Ba=Ca}var Ha={};
function I(a){var b;if(!(b=Ha[a])){b=0;for(var c=String(Ba).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),d=String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),f=Math.max(c.length,d.length),e=0;b==0&&e<f;e++){var g=c[e]||"",k=d[e]||"",h=RegExp("(\\d*)(\\D*)","g"),n=RegExp("(\\d*)(\\D*)","g");do{var r=h.exec(g)||["","",""],o=n.exec(k)||["","",""];if(r[0].length==0&&o[0].length==0)break;b=ra(r[1].length==0?0:parseInt(r[1],10),o[1].length==0?0:parseInt(o[1],10))||ra(r[2].length==0,o[2].length==
0)||ra(r[2],o[2])}while(b==0)}b=Ha[a]=b>=0}return b}var Ia={};function Ja(){return Ia[9]||(Ia[9]=E&&document.documentMode&&document.documentMode>=9)};function Ka(){}var La=0;p=Ka.prototype;p.key=0;p.g=m;p.G=m;p.n=function(a,b,c,d,f,e){if(u(a))this.L=j;else if(a&&a.handleEvent&&u(a.handleEvent))this.L=m;else throw Error("Invalid listener argument");this.i=a;this.N=b;this.src=c;this.type=d;this.capture=!!f;this.w=e;this.G=m;this.key=++La;this.g=m};p.handleEvent=function(a){return this.L?this.i.call(this.w||this.src,a):this.i.handleEvent.call(this.i,a)};function Ma(a,b){for(var c in a)b.call(i,a[c],c,a)}var Na="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");function Oa(a,b){for(var c,d,f=1;f<arguments.length;f++){d=arguments[f];for(c in d)a[c]=d[c];for(var e=0;e<Na.length;e++)c=Na[e],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};!E||Ja();var Pa=!E||Ja();E&&I("8");!G||I("528");F&&I("1.9b")||E&&I("8")||ya&&I("9.5")||G&&I("528");!F||I("8");var J=Array.prototype,Qa=J.indexOf?function(a,b,c){return J.indexOf.call(a,b,c)}:function(a,b,c){c=c==l?0:c<0?Math.max(0,a.length+c):c;if(t(a))return!t(b)||b.length!=1?-1:a.indexOf(b,c);for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Ra=J.forEach?function(a,b,c){J.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=t(a)?a.split(""):a,e=0;e<d;e++)e in f&&b.call(c,f[e],e,a)},Sa=J.map?function(a,b,c){return J.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=Array(d),e=t(a)?a.split(""):
a,g=0;g<d;g++)g in e&&(f[g]=b.call(c,e[g],g,a));return f};function Ta(a){return J.concat.apply(J,arguments)}function Ua(a){if(s(a))return Ta(a);else{for(var b=[],c=0,d=a.length;c<d;c++)b[c]=a[c];return b}}function Va(a,b,c){return arguments.length<=2?J.slice.call(a,b):J.slice.call(a,b,c)};function K(){}K.prototype.J=m;K.prototype.l=function(){if(!this.J)this.J=j,this.d()};K.prototype.d=function(){this.ia&&Wa.apply(l,this.ia)};function Wa(a){for(var b=0,c=arguments.length;b<c;++b){var d=arguments[b];ca(d)?Wa.apply(l,d):d&&typeof d.l=="function"&&d.l()}};function L(a,b){this.type=a;this.currentTarget=this.target=b}x(L,K);L.prototype.d=function(){delete this.type;delete this.target;delete this.currentTarget};L.prototype.f=m;L.prototype.r=j;function Xa(a){Xa[" "](a);return a}Xa[" "]=function(){};function M(a,b){a&&this.n(a,b)}x(M,L);p=M.prototype;p.target=l;p.relatedTarget=l;p.offsetX=0;p.offsetY=0;p.clientX=0;p.clientY=0;p.screenX=0;p.screenY=0;p.button=0;p.keyCode=0;p.charCode=0;p.ctrlKey=m;p.altKey=m;p.shiftKey=m;p.metaKey=m;p.oa=m;p.K=l;
p.n=function(a,b){var c=this.type=a.type;L.call(this,c);this.target=a.target||a.srcElement;this.currentTarget=b;var d=a.relatedTarget;if(d){if(F){var f;a:{try{Xa(d.nodeName);f=j;break a}catch(e){}f=m}f||(d=l)}}else if(c=="mouseover")d=a.fromElement;else if(c=="mouseout")d=a.toElement;this.relatedTarget=d;this.offsetX=G||a.offsetX!==i?a.offsetX:a.layerX;this.offsetY=G||a.offsetY!==i?a.offsetY:a.layerY;this.clientX=a.clientX!==i?a.clientX:a.pageX;this.clientY=a.clientY!==i?a.clientY:a.pageY;this.screenX=
a.screenX||0;this.screenY=a.screenY||0;this.button=a.button;this.keyCode=a.keyCode||0;this.charCode=a.charCode||(c=="keypress"?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.oa=Aa?a.metaKey:a.ctrlKey;this.state=a.state;this.K=a;delete this.r;delete this.f};p.d=function(){M.D.d.call(this);this.relatedTarget=this.currentTarget=this.target=this.K=l};var N={},O={},P={},Q={};
function Ya(a,b,c,d,f){if(b)if(s(b)){for(var e=0;e<b.length;e++)Ya(a,b[e],c,d,f);return l}else{var d=!!d,g=O;b in g||(g[b]={b:0,a:0});g=g[b];d in g||(g[d]={b:0,a:0},g.b++);var g=g[d],k=v(a),h;g.a++;if(g[k]){h=g[k];for(e=0;e<h.length;e++)if(g=h[e],g.i==c&&g.w==f){if(g.g)break;return h[e].key}}else h=g[k]=[],g.b++;e=Za();e.src=a;g=new Ka;g.n(c,e,a,b,d,f);c=g.key;e.key=c;h.push(g);N[c]=g;P[k]||(P[k]=[]);P[k].push(g);a.addEventListener?(a==q||!a.I)&&a.addEventListener(b,e,d):a.attachEvent(b in Q?Q[b]:
Q[b]="on"+b,e);return c}else throw Error("Invalid event type");}function Za(){var a=$a,b=Pa?function(c){return a.call(b.src,b.key,c)}:function(c){c=a.call(b.src,b.key,c);if(!c)return c};return b}function ab(a,b,c,d,f){if(s(b))for(var e=0;e<b.length;e++)ab(a,b[e],c,d,f);else{d=!!d;a:{e=O;if(b in e&&(e=e[b],d in e&&(e=e[d],a=v(a),e[a]))){a=e[a];break a}a=l}if(a)for(e=0;e<a.length;e++)if(a[e].i==c&&a[e].capture==d&&a[e].w==f){R(a[e].key);break}}}
function R(a){if(!N[a])return m;var b=N[a];if(b.g)return m;var c=b.src,d=b.type,f=b.N,e=b.capture;c.removeEventListener?(c==q||!c.I)&&c.removeEventListener(d,f,e):c.detachEvent&&c.detachEvent(d in Q?Q[d]:Q[d]="on"+d,f);c=v(c);f=O[d][e][c];if(P[c]){var g=P[c],k=Qa(g,b);k>=0&&J.splice.call(g,k,1);g.length==0&&delete P[c]}b.g=j;f.M=j;bb(d,e,c,f);delete N[a];return j}
function bb(a,b,c,d){if(!d.o&&d.M){for(var f=0,e=0;f<d.length;f++)d[f].g?d[f].N.src=l:(f!=e&&(d[e]=d[f]),e++);d.length=e;d.M=m;e==0&&(delete O[a][b][c],O[a][b].b--,O[a][b].b==0&&(delete O[a][b],O[a].b--),O[a].b==0&&delete O[a])}}function cb(a){var b,c=0,d=b==l;b=!!b;if(a==l)Ma(P,function(a){for(var e=a.length-1;e>=0;e--){var f=a[e];if(d||b==f.capture)R(f.key),c++}});else if(a=v(a),P[a])for(var a=P[a],f=a.length-1;f>=0;f--){var e=a[f];if(d||b==e.capture)R(e.key),c++}}
function S(a,b,c,d,f){var e=1,b=v(b);if(a[b]){a.a--;a=a[b];a.o?a.o++:a.o=1;try{for(var g=a.length,k=0;k<g;k++){var h=a[k];h&&!h.g&&(e&=db(h,f)!==m)}}finally{a.o--,bb(c,d,b,a)}}return Boolean(e)}function db(a,b){var c=a.handleEvent(b);a.G&&R(a.key);return c}
function $a(a,b){if(!N[a])return j;var c=N[a],d=c.type,f=O;if(!(d in f))return j;var f=f[d],e,g;if(!Pa){var k;if(!(k=b))a:{k="window.event".split(".");for(var h=q;e=k.shift();)if(h[e]!=l)h=h[e];else{k=l;break a}k=h}e=k;k=j in f;h=m in f;if(k){if(e.keyCode<0||e.returnValue!=i)return j;a:{var n=m;if(e.keyCode==0)try{e.keyCode=-1;break a}catch(r){n=j}if(n||e.returnValue==i)e.returnValue=j}}n=new M;n.n(e,this);e=j;try{if(k){for(var o=[],ja=n.currentTarget;ja;ja=ja.parentNode)o.push(ja);g=f[j];g.a=g.b;
for(var B=o.length-1;!n.f&&B>=0&&g.a;B--)n.currentTarget=o[B],e&=S(g,o[B],d,j,n);if(h){g=f[m];g.a=g.b;for(B=0;!n.f&&B<o.length&&g.a;B++)n.currentTarget=o[B],e&=S(g,o[B],d,m,n)}}else e=db(c,n)}finally{if(o)o.length=0;n.l()}return e}d=new M(b,this);try{e=db(c,d)}finally{d.l()}return e};function T(a){this.ka=a;this.z=[]}x(T,K);var eb=[];function fb(a,b,c,d){s(c)||(eb[0]=c,c=eb);for(var f=0;f<c.length;f++)a.z.push(Ya(b,c[f],d||a,m,a.ka||a))}T.prototype.d=function(){T.D.d.call(this);Ra(this.z,R);this.z.length=0};T.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented");};function gb(a,b){var c;c=(c=a.className)&&typeof c.split=="function"?c.split(/\s+/):[];var d=Va(arguments,1),f;f=c;for(var e=0,g=0;g<d.length;g++)Qa(f,d[g])>=0||(f.push(d[g]),e++);f=e==d.length;a.className=c.join(" ");return f};var hb=!E||Ja();!F&&!E||E&&Ja()||F&&I("1.9.1");E&&I("9");function U(a){return t(a)?document.getElementById(a):a}function ib(a,b){Ma(b,function(b,d){d=="style"?a.style.cssText=b:d=="class"?a.className=b:d=="for"?a.htmlFor=b:d in jb?a.setAttribute(jb[d],b):d.lastIndexOf("aria-",0)==0?a.setAttribute(d,b):a[d]=b})}var jb={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",rowspan:"rowSpan",valign:"vAlign",height:"height",width:"width",usemap:"useMap",frameborder:"frameBorder",maxlength:"maxLength",type:"type"};
function V(a,b,c){var d=arguments,f=document,e=d[0],g=d[1];if(!hb&&g&&(g.name||g.type)){e=["<",e];g.name&&e.push(' name="',z(g.name),'"');if(g.type){e.push(' type="',z(g.type),'"');var k={};Oa(k,g);g=k;delete g.type}e.push(">");e=e.join("")}e=f.createElement(e);if(g)t(g)?e.className=g:s(g)?gb.apply(l,[e].concat(g)):ib(e,g);d.length>2&&kb(f,e,d);return e}
function kb(a,b,c){function d(c){c&&b.appendChild(t(c)?a.createTextNode(c):c)}for(var f=2;f<c.length;f++){var e=c[f];if(ca(e)&&!(da(e)&&e.nodeType>0)){var g;a:{if(e&&typeof e.length=="number")if(da(e)){g=typeof e.item=="function"||typeof e.item=="string";break a}else if(u(e)){g=typeof e.item=="function";break a}g=m}Ra(g?Ua(e):e,d)}else d(e)}}
function lb(a){var b=document,c=b.createElement("div");E?(c.innerHTML="<br>"+a,c.removeChild(c.firstChild)):c.innerHTML=a;if(c.childNodes.length==1)return c.removeChild(c.firstChild);else{for(a=b.createDocumentFragment();c.firstChild;)a.appendChild(c.firstChild);return a}}function mb(a,b){a.appendChild(b)}
function nb(a,b){if("textContent"in a)a.textContent=b;else if(a.firstChild&&a.firstChild.nodeType==3){for(;a.lastChild!=a.firstChild;)a.removeChild(a.lastChild);a.firstChild.data=b}else{for(var c;c=a.firstChild;)a.removeChild(c);a.appendChild((a.nodeType==9?a:a.ownerDocument||a.document).createTextNode(b))}};function W(a){a=a||{};this.la=a.key;this.h=a.template||"";this.e=a.formatter||{};this.H=a.callbackName||ob}function pb(a){a=a.replace("<","&lt;").replace(">","&gt;");return a=a.replace('"',"&quot;").replace("'","&#39;")}
function qb(a,b,c,d){if(!b||c<200||300<=c)throw"FeedRenderer : "+d;if(a=W.prototype.B[a-0]){var f=[],e=a.sa||"",g=a.ja||{},a=a.element||"";Ra(b.feed.entries,function(a,b){f[b]=e.replace(/%([^%]*)%/g,function(b,c){return c in a?(g[c]||pb)(a[c],a):""})});u(a)?a(f,b):(f=f.join(""),da(a)&&a.nodeType>0||(a=U(a)),a&&mb(a,lb(f)))}}var ob="";W.prototype.B=[];W.prototype.k=aa("h");W.prototype.s=aa("e");
W.prototype.j=function(a,b,c){if(!this.h)throw"FeedRenderer : The template string must be set.";if(!this.H)throw"FeedRenderer : The callback name must be set.";var c=c||{},a=["http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&callback=",y(this.H),"&q=",y(a),"&context=",this.B.length],d=c.num,c=c.scoring,f=this.la;d&&(a=Ta(a,["&num=",y(d)]));f&&(a=Ta(a,["&key=",y(f)]));c&&(a=Ta(a,["&scoring=",y(c)]));this.B.push({element:b,sa:this.h,ja:this.e});b=V("script",{type:"text/javascript",
src:C.apply(l,a)});document.body.appendChild(b)};function X(a,b){var a=a||{},b=b||{},c=a;if(typeof c!="string"){var d=a.key,f=a.pub===m?m:j;if(!d)throw rb('The "key" parameter is required.');c=[f?"http":"https","://spreadsheets.google.com"];a.domain&&!f&&c.push("/a/",y(a.domain));c.push("/tq?key=",y(d));a.sheet?c.push("&sheet=",y(a.sheet)):c.push("&gid=",y(a.gid||0));typeof a.headers=="number"&&c.push("&headers=",a.headers);f&&c.push("&pub=1");var c=C.apply(l,c),d={},f=a,e;for(e in f)d[e]=f[e];e=b;for(var g in e)d[g]=e[g];b=d}this.O=new google.visualization.Query(c);
this.h=b.template||"";this.e=b.formatter||{}}function sb(a){return z(""+a)}function rb(a){return"SpreadsheetRenderer : "+a}X.prototype.k=aa("h");X.prototype.s=aa("e");X.prototype.j=function(a,b){this.O.setQuery(a);this.O.send(w(this.qa,this,b))};
X.prototype.qa=function(a,b){if(!b)throw rb("Null response.");if(b.isError())throw rb(b.getMessage());var c=b.getDataTable(),d=c.getNumberOfColumns(),f=c.getNumberOfRows(),e=[],g=[],k=[],h,n,r,o;for(h=0;h<d;++h)e[h]=c.getColumnLabel(h),g[h]=this.e[e[h]]||this.e[h]||sb;for(n=0;n<f;++n){r={};o={};for(h=0;h<d;++h)r[h]=r[e[h]]={value:c.getFormattedValue(n,h),rawValue:c.getValue(n,h)};for(h=0;h<d;++h)o[h]=o[e[h]]=g[h](r[h].value,r[h].rawValue,r);k[n]=this.h.replace(/%([^%]*)%/g,function(a,b){return!b||
b.length<=0?"%":o[b]})}u(a)?a(k,c):(k=k.join(""),da(a)&&a.nodeType>0||(a=U(a)),a&&mb(a,lb(k)))};var Y={U:["BC","AD"],T:["Before Christ","Anno Domini"],W:"J,F,M,A,M,J,J,A,S,O,N,D".split(","),ba:"J,F,M,A,M,J,J,A,S,O,N,D".split(","),V:"January,February,March,April,May,June,July,August,September,October,November,December".split(","),aa:"January,February,March,April,May,June,July,August,September,October,November,December".split(","),Y:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),da:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),ha:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
fa:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),$:"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),ea:"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),va:"S,M,T,W,T,F,S".split(","),ca:"S,M,T,W,T,F,S".split(","),Z:["Q1","Q2","Q3","Q4"],X:["1st quarter","2nd quarter","3rd quarter","4th quarter"],R:["AM","PM"],S:["EEEE, MMMM d, y","MMMM d, y","MMM d, y","M/d/yy"],ga:["h:mm:ss a zzzz","h:mm:ss a z","h:mm:ss a","h:mm a"],ta:6,wa:[5,6],ua:2};function tb(){}function ub(a){if(typeof a=="number"){var b=new tb;b.C=a;var c;c=a;if(c==0)c="Etc/GMT";else{var d=["Etc/GMT",c<0?"-":"+"];c=Math.abs(c);d.push(Math.floor(c/60)%100);c%=60;c!=0&&d.push(":",A(c,2));c=d.join("")}b.Q=c;a==0?a="UTC":(c=["UTC",a<0?"+":"-"],a=Math.abs(a),c.push(Math.floor(a/60)%100),a%=60,a!=0&&c.push(":",a),a=c.join(""));b.F=[a,a];b.v=[];return b}b=new tb;b.Q=a.id;b.C=-a.std_offset;b.F=a.names;b.v=a.transitions;return b}
function vb(a,b){for(var c=Date.UTC(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate(),b.getUTCHours(),b.getUTCMinutes())/36E5,d=0;d<a.v.length&&c>=a.v[d];)d+=2;return d==0?0:a.v[d-1]};function wb(){this.q=[];for(var a=Y.S[2]+" "+Y.ga[2];a;)for(var b=0;b<xb.length;++b){var c=a.match(xb[b]);if(c){c=c[0];a=a.substring(c.length);b==0&&(c=="''"?c="'":(c=c.substring(1,c.length-1),c=c.replace(/\'\'/,"'")));this.q.push({text:c,type:b});break}}}var xb=[/^\'(?:[^\']|\'\')*\'/,/^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/,/^[^\'GyMkSEahKHcLQdmsvzZ]+/];
function yb(a,b){var c=b.getMonth();switch(a){case 5:return Y.W[c];case 4:return Y.V[c];case 3:return Y.Y[c];default:return A(c+1,a)}}function zb(a,b){var c=b.getDay();switch(a){case 5:return Y.ca[c];case 4:return Y.fa[c];case 3:return Y.ea[c];default:return A(c,1)}}function Ab(a,b){var c=b.getMonth();switch(a){case 5:return Y.ba[c];case 4:return Y.aa[c];case 3:return Y.da[c];default:return A(c+1,a)}}
function Bb(a,b,c,d){var f=a.length;switch(a.charAt(0)){case "G":return b=c.getFullYear()>0?1:0,f>=4?Y.T[b]:Y.U[b];case "y":return b=c.getFullYear(),b<0&&(b=-b),f==2?A(b%100,2):String(b);case "M":return yb(f,c);case "k":return A(d.getHours()||24,f);case "S":return(d.getTime()%1E3/1E3).toFixed(Math.min(3,f)).substr(2)+(f>3?A(0,f-3):"");case "E":return b=c.getDay(),f>=4?Y.ha[b]:Y.$[b];case "a":return f=d.getHours(),Y.R[f>=12&&f<24?1:0];case "h":return A(d.getHours()%12||12,f);case "K":return A(d.getHours()%
12,f);case "H":return A(d.getHours(),f);case "c":return zb(f,c);case "L":return Ab(f,c);case "Q":return b=Math.floor(c.getMonth()/3),f<4?Y.Z[b]:Y.X[b];case "d":return A(c.getDate(),f);case "m":return A(d.getMinutes(),f);case "s":return A(d.getSeconds(),f);case "v":return f=i||ub(b.getTimezoneOffset()),f.Q;case "z":return a=i||ub(b.getTimezoneOffset()),f<4?a.F[vb(a,b)>0?2:0]:a.F[vb(a,b)>0?3:1];case "Z":return a=i||ub(b.getTimezoneOffset()),f<4?(f=-(a.C-vb(a,b)),b=[f<0?"-":"+"],f=Math.abs(f),b.push(A(Math.floor(f/
60)%100,2),A(f%60,2))):(f=a.C-vb(a,b),b=["GMT"],b.push(f<=0?"+":"-"),f=Math.abs(f),b.push(A(Math.floor(f/60)%100,2),":",A(f%60,2))),f=b.join("");default:return""}};function Cb(a,b,c){return!b&&c==0?a==1?a+" minute ago":a+" minutes ago":b&&c==0?a==1?"in "+(a+" minute"):"in "+(a+" minutes"):!b&&c==1?a==1?a+" hour ago":a+" hours ago":b&&c==1?a==1?"in "+(a+" hour"):"in "+(a+" hours"):!b&&c==2?a==1?a+" day ago":a+" days ago":b&&c==2?a==1?"in "+(a+" day"):"in "+(a+" days"):""};var Db=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([\\w\\d\\-\\u0100-\\uffff.%]*)(?::([0-9]+))?)?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$");function Eb(a){return a&&decodeURIComponent(a)}function Fb(a,b){var c=a.length-1;c>=0&&a.indexOf("/",c)==c&&(a=a.substr(0,a.length-1));b.lastIndexOf("/",0)==0&&(b=b.substr(1));return C(a,"/",b)};function Gb(){}x(Gb,K);p=Gb.prototype;p.I=j;p.A=l;p.addEventListener=function(a,b,c,d){Ya(this,a,b,c,d)};p.removeEventListener=function(a,b,c,d){ab(this,a,b,c,d)};
p.dispatchEvent=function(a){var b=a.type||a,c=O;if(b in c){if(t(a))a=new L(a,this);else if(a instanceof L)a.target=a.target||this;else{var d=a,a=new L(b,this);Oa(a,d)}var d=1,f,c=c[b],b=j in c,e;if(b){f=[];for(e=this;e;e=e.A)f.push(e);e=c[j];e.a=e.b;for(var g=f.length-1;!a.f&&g>=0&&e.a;g--)a.currentTarget=f[g],d&=S(e,f[g],a.type,j,a)&&a.r!=m}if(m in c)if(e=c[m],e.a=e.b,b)for(g=0;!a.f&&g<f.length&&e.a;g++)a.currentTarget=f[g],d&=S(e,f[g],a.type,m,a)&&a.r!=m;else for(f=this;!a.f&&f&&e.a;f=f.A)a.currentTarget=
f,d&=S(e,f,a.type,m,a)&&a.r!=m;a=Boolean(d)}else a=j;return a};p.d=function(){Gb.D.d.call(this);cb(this);this.A=l};function Hb(){this.m=new T(this);typeof history.navigationMode!="undifined"&&(history.navigationMode="fast");fb(this.m,window,"load",this.na);fb(this.m,this,Z,this.ma);fb(this.m,this,Z,this.pa);fb(this.m,this,Z,this.ra)}x(Hb,Gb);var Z="blog-ready";p=Hb.prototype;p.na=function(){this.dispatchEvent("blog-load")};
p.ma=function(){var a=/^http\:\/\/blog\.livedoor\.jp\/sourcewalker\/?(.*)$/i.exec(document.location.href);a&&a[1]&&(a="http://webos-goodies.jp/"+(a[1]||""),a=lb(C('<div style="text-align:center; color:red; font-weight:bold; margin:16px 0px;">',"\u30b5\u30a4\u30c8\u3092\u79fb\u8ee2\u3057\u307e\u3057\u305f\u3002<br>",'\u79fb\u8ee2\u5148\uff1a<a href="',a,'">',a,"</a>","</div>")),U("tpl_old_site_notification").appendChild(a))};
function Ib(a,b){var c=Jb,d=/(\w+)\.html$/,f=(d.exec(Eb(window.location.href.match(Db)[5]||l))||[])[1]||"",e=Fb(b,"categories/"+a.t+".html"),c=Sa(Va(a.p,0,5),function(a){var b=d.exec(Eb(a.u.match(Db)[5]||l))||[],c=a.t||"";return V("li",l,b[1]==f?c:V("a",{href:a.u||""},c))},c),g=document.createDocumentFragment();g.appendChild(V("h1",l,V("a",{href:e},a.c)));g.appendChild(V("ul",l,c));g.appendChild(V("div","morecategory",V("a",{href:e},">> \u3082\u3063\u3068\u8aad\u3080")));return g}
function Kb(a,b,c){b=(c.Url||{}).value;return/^https?:\/\//.test(b)?ka('<a href="%s">%s</a>',z(b),z(a)):z(a)}function Lb(a){return z(a).replace(/(\r\n|\r|\n)/g,"<br>")}function Mb(a,b){return b instanceof Date?ka("%s\u5e74%s\u6708%s\u65e5 %s:%s",b.getFullYear(),b.getMonth()+1,b.getDate(),b.getHours(),b.getMinutes()):""}p.P=function(a,b,c,d,f){var e=1,f=f.getNumberOfRows();if(f>0)U(b).innerHTML=ka(a,d.join("").replace(/<n>/g,function(){return e++}));nb(U(c),f)};
function Nb(a){var a=new Date(a),b;b=a.getTime();var c=ia();c<b&&(b=c);var c=ia(),d=Math.floor((c-b)/6E4),f=m;d<0&&(f=j,d*=-1);d<60?b=Cb(d,f,0):(d=Math.floor(d/60),d<24?b=Cb(d,f,1):(d=(new Date).getTimezoneOffset()*6E4,d=Math.floor((c+d)/864E5)-Math.floor((b+d)/864E5),f&&(d*=-1),b=d<14?Cb(d,f,2):""));if(!b){b=new wb;c=[];for(f=0;f<b.q.length;++f)d=b.q[f].text,1==b.q[f].type?c.push(Bb(d,a,a,a)):c.push(d);b=c.join("")}return b}
p.pa=function(){var a=new W({key:"ABQIAAAADFolcpMzeDEXDBR65zomPRSdobuQ8nl73Zh0G-Y7QnxRnfXdORRvX5O5---NvrXXjsKrVcjvSimLkw"});a.k('<a class="sidebody" href="%link%">%title%</a>');a.j("http://webos-goodies.jp/atom.xml","tpl_recent_articles",{num:8});a.k(C('<a class="sidebody" href="%link%" target="_blank">%contentSnippet%<br>','<span class="tpl-buzz-date">%publishedDate%</span></a>'));a.s({publishedDate:Nb});a.j("https://twitter.com/statuses/user_timeline/24371070.rss","tpl_buzz",{num:16})};
p.ra=function(){var a=U("tpl_recommendations");if(a){var b=a.clientWidth,c=a.clientHeight;a.innerHTML='<iframe src="http://www.facebook.com/plugins/recommendations.php?site=webos-goodies.jp&amp;width='+b+"&amp;height="+c+'&amp;header=false&amp;border_color=white" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:'+b+"px; height:"+c+'px;" allowTransparency="true"></iframe>'}};var Jb=new Hb,$={};window.template=$;$.FeedRenderer=W;$.feedCallback=function(){qb.apply(this,arguments)};
ob="template.feedCallback";$.addWindowEvent=function(a,b){Jb.addEventListener(a=="ready"?Z:"blog-load",b)};$.invokeContentReady=function(){Jb.dispatchEvent(Z)};$.generateRelatedLinks=function(a,b){return Ib(a,b)};
$.renderComments=function(a){var b=Jb;renderer=new X({key:"pMIBrnJ4PHK_Tnb_IAz3cTQ"});renderer.k('<div class="comment_item"><h2><n>.&nbsp;Posted by %Name% &nbsp;&nbsp;&nbsp;%Timestamp%</h2><p>%Comment%</p></div>');renderer.s({Timestamp:Mb,Name:Kb,Comment:Lb});if(location.hash=="#comments"){var c=U("comment_form"),d=V("div","notice","\u203b \u30b3\u30e1\u30f3\u30c8\u306e\u53cd\u6620\u306b\u306f\u6642\u9593\u304c\u304b\u304b\u308b\u3053\u3068\u304c\u3042\u308a\u307e\u3059\u3002");c.insertBefore(d,c.childNodes[0]||
l)}b=w(b.P,b,'<h1>\u3053\u306e\u8a18\u4e8b\u3078\u306e\u30b3\u30e1\u30f3\u30c8</h1><div class="comment_body">%s</div>',"tpl_comments","tpl_num_comments");renderer.j("select * WHERE B = '"+a+"' ORDER BY A",b)};
$.renderTrackbacks=function(a){var b=Jb;renderer=new X({key:"pMIBrnJ4PHK_XSOfGkVhjTQ"});renderer.k('<div class="trackback_item"><h2><n>.&nbsp;%Source%&nbsp;&nbsp;[&nbsp;%Site%&nbsp;]&nbsp;&nbsp;&nbsp;%Timestamp%</h2><p>%Excerpt%</p></div>');renderer.s({Timestamp:Mb,Source:Kb,Excerpt:Lb});b=w(b.P,b,'<div class="trackback"><h1>\u30c8\u30e9\u30c3\u30af\u30d0\u30c3\u30afURL</h1><div class="trackback_form"><div class="notice">\u203b\u30c8\u30e9\u30c3\u30af\u30d0\u30c3\u30af\u306e\u53d7\u3051\u4ed8\u3051\u306f\u4e2d\u6b62\u3057\u3066\u304a\u308a\u307e\u3059\u3002</div></div><h1>\u3053\u306e\u8a18\u4e8b\u3078\u306e\u30c8\u30e9\u30c3\u30af\u30d0\u30c3\u30af</h1><div class="trackback_body">%s</div></div>',
"tpl_trackbacks","tpl_num_trackbacks");renderer.j("select * WHERE B = '"+a+"' ORDER BY A",b)};
})();