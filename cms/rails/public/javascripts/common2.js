(function(){var i=null,j=false;function m(a){return function(c){this[a]=c}}var n=this;
function q(a){var c=typeof a;if(c=="object")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)=="[object Array]"||typeof a.length=="number"&&typeof a.splice!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("splice"))return"array";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)=="[object Function]"||typeof a.call!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("call")))return"function"}else return"null";
else if(c=="function"&&typeof a.call=="undefined")return"object";return c}function ba(a){var c=q(a);return c=="array"||c=="object"&&typeof a.length=="number"}function r(a){return typeof a=="string"}function s(a){a=q(a);return a=="object"||a=="array"||a=="function"}
function ca(a,c){var b=c||n;if(arguments.length>2){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}else return function(){return a.apply(b,arguments)}}var da=Date.now||function(){return+new Date};function t(a,c){var b=c||{},d;for(d in b){var e=(""+b[d]).replace(/\$/g,"$$$$");a=a.replace(RegExp("\\{\\$"+d+"\\}","gi"),e)}return a};var ea=/^[a-zA-Z0-9\-_.!~*'()]*$/;function u(a){a=String(a);if(!ea.test(a))return encodeURIComponent(a);return a}function v(a,c){if(c)return a.replace(fa,"&amp;").replace(ga,"&lt;").replace(ha,"&gt;").replace(ia,"&quot;");else{if(!ja.test(a))return a;if(a.indexOf("&")!=-1)a=a.replace(fa,"&amp;");if(a.indexOf("<")!=-1)a=a.replace(ga,"&lt;");if(a.indexOf(">")!=-1)a=a.replace(ha,"&gt;");if(a.indexOf('"')!=-1)a=a.replace(ia,"&quot;");return a}}var fa=/&/g,ga=/</g,ha=/>/g,ia=/\"/g,ja=/[&<>\"]/;
function w(a,c,b){a=b!==undefined?a.toFixed(b):String(a);b=a.indexOf(".");if(b==-1)b=a.length;return Array(Math.max(0,c-b)+1).join("0")+a}function x(){return Array.prototype.join.call(arguments,"")}
function ka(a,c){for(var b=0,d=String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),e=String(c).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),f=Math.max(d.length,e.length),h=0;b==0&&h<f;h++){var l=d[h]||"",g=e[h]||"",o=RegExp("(\\d*)(\\D*)","g"),k=RegExp("(\\d*)(\\D*)","g");do{var p=o.exec(l)||["","",""],A=k.exec(g)||["","",""];if(p[0].length==0&&A[0].length==0)break;b=y(p[1].length==0?0:parseInt(p[1],10),A[1].length==0?0:parseInt(A[1],10))||y(p[2].length==0,A[2].length==0)||y(p[2],A[2])}while(b==
0)}return b}function y(a,c){if(a<c)return-1;else if(a>c)return 1;return 0};var z=Array.prototype,la=z.indexOf?function(a,c,b){return z.indexOf.call(a,c,b)}:function(a,c,b){b=b==i?0:b<0?Math.max(0,a.length+b):b;if(r(a)){if(!r(c)||c.length!=1)return-1;return a.indexOf(c,b)}for(b=b;b<a.length;b++)if(b in a&&a[b]===c)return b;return-1},B=z.forEach?function(a,c,b){z.forEach.call(a,c,b)}:function(a,c,b){for(var d=a.length,e=r(a)?a.split(""):a,f=0;f<d;f++)f in e&&c.call(b,e[f],f,a)};function C(){return z.concat.apply(z,arguments)}
function ma(a){if(q(a)=="array")return C(a);else{for(var c=[],b=0,d=a.length;b<d;b++)c[b]=a[b];return c}}function na(a,c,b){return arguments.length<=2?z.slice.call(a,c):z.slice.call(a,c,b)};var D={w:["BC","AD"],v:["Before Christ","Anno Domini"],A:["J","F","M","A","M","J","J","A","S","O","N","D"],H:["J","F","M","A","M","J","J","A","S","O","N","D"],z:["January","February","March","April","May","June","July","August","September","October","November","December"],G:["January","February","March","April","May","June","July","August","September","October","November","December"],C:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],J:["Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"],M:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],L:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],F:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],K:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],U:["S","M","T","W","T","F","S"],I:["S","M","T","W","T","F","S"],D:["Q1","Q2","Q3","Q4"],B:["1st quarter","2nd quarter","3rd quarter","4th quarter"],s:["AM","PM"],m:["EEEE, MMMM d, y","MMMM d, y","MMM d, y","M/d/yy"],n:["h:mm:ss a zzzz",
"h:mm:ss a z","h:mm:ss a","h:mm a"],R:{Md:"M/d",MMMMd:"MMMM d",MMMd:"MMM d"},S:6,V:[5,6],T:2};function oa(){}function E(a){if(typeof a=="number"){var c=new oa;c.k=a;var b;b=a;if(b==0)b="Etc/GMT";else{var d=["Etc/GMT",b<0?"-":"+"];b=Math.abs(b);d.push(Math.floor(b/60)%100);b%=60;b!=0&&d.push(":",w(b,2));b=d.join("")}c.r=b;a=a;if(a==0)a="UTC";else{b=["UTC",a<0?"+":"-"];a=Math.abs(a);b.push(Math.floor(a/60)%100);a%=60;a!=0&&b.push(":",a);a=b.join("")}c.l=[a,a];c.i=[];return c}c=new oa;c.r=a.id;c.k=-a.std_offset;c.l=a.names;c.i=a.transitions;return c}
function F(a,c){for(var b=Date.UTC(c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate(),c.getUTCHours(),c.getUTCMinutes())/36E5,d=0;d<a.i.length&&b>=a.i[d];)d+=2;return d==0?0:a.i[d-1]};function pa(a){this.g=[];typeof a=="number"?qa(this,a):ra(this,a)}var sa=[/^\'(?:[^\']|\'\')*\'/,/^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/,/^[^\'GyMkSEahKHcLQdmsvzZ]+/];function ra(a,c){for(;c;)for(var b=0;b<sa.length;++b){var d=c.match(sa[b]);if(d){d=d[0];c=c.substring(d.length);if(b==0)if(d=="''")d="'";else{d=d.substring(1,d.length-1);d=d.replace(/\'\'/,"'")}a.g.push({text:d,type:b});break}}}
function qa(a,c){var b;if(c<4)b=D.m[c];else if(c<8)b=D.n[c-4];else if(c<12)b=D.m[c-8]+" "+D.n[c-8];else{qa(a,10);return}ra(a,b)}
function ta(a,c,b,d,e,f){a=c.length;switch(c.charAt(0)){case "G":b=d.getFullYear()>0?1:0;return a>=4?D.v[b]:D.w[b];case "y":b=d.getFullYear();if(b<0)b=-b;return a==2?w(b%100,2):String(b);case "M":a:{b=d.getMonth();switch(a){case 5:a=D.A[b];break a;case 4:a=D.z[b];break a;case 3:a=D.C[b];break a;default:a=w(b+1,a)}}return a;case "k":return w(e.getHours()||24,a);case "S":return(e.getTime()%1E3/1E3).toFixed(Math.min(3,a)).substr(2)+(a>3?w(0,a-3):"");case "E":b=d.getDay();return a>=4?D.M[b]:D.F[b];case "a":a=
e.getHours();return D.s[a>=12&&a<24?1:0];case "h":return w(e.getHours()%12||12,a);case "K":return w(e.getHours()%12,a);case "H":return w(e.getHours(),a);case "c":a:{b=d.getDay();switch(a){case 5:a=D.I[b];break a;case 4:a=D.L[b];break a;case 3:a=D.K[b];break a;default:a=w(b,1)}}return a;case "L":a:{b=d.getMonth();switch(a){case 5:a=D.H[b];break a;case 4:a=D.G[b];break a;case 3:a=D.J[b];break a;default:a=w(b+1,a)}}return a;case "Q":b=Math.floor(d.getMonth()/3);return a<4?D.D[b]:D.B[b];case "d":return w(d.getDate(),
a);case "m":return w(e.getMinutes(),a);case "s":return w(e.getSeconds(),a);case "v":a=(a=f)||E(b.getTimezoneOffset());return a.r;case "z":c=(c=f)||E(b.getTimezoneOffset());return a<4?c.l[F(c,b)>0?2:0]:c.l[F(c,b)>0?3:1];case "Z":c=(c=f)||E(b.getTimezoneOffset());if(a<4){a=-(c.k-F(c,b));b=[a<0?"-":"+"];a=Math.abs(a);b.push(w(Math.floor(a/60)%100,2),w(a%60,2));a=b.join("")}else{a=c.k-F(c,b);b=["GMT"];b.push(a<=0?"+":"-");a=Math.abs(a);b.push(w(Math.floor(a/60)%100,2),":",w(a%60,2));a=b.join("")}return a;
default:return""}};function G(a,c,b){if(!c&&b==0){c=t("{$num} minute ago",{num:a});b=t("{$num} minutes ago",{num:a});return a==1?c:b}else if(c&&b==0){c=t("in {$num} minute",{num:a});b=t("in {$num} minutes",{num:a});return a==1?c:b}else if(!c&&b==1){c=t("{$num} hour ago",{num:a});b=t("{$num} hours ago",{num:a});return a==1?c:b}else if(c&&b==1){c=t("in {$num} hour",{num:a});b=t("in {$num} hours",{num:a});return a==1?c:b}else if(!c&&b==2){c=t("{$num} day ago",{num:a});b=t("{$num} days ago",{num:a});return a==1?c:b}else if(c&&
b==2){c=t("in {$num} day",{num:a});b=t("in {$num} days",{num:a});return a==1?c:b}else return""};var H,I,J,K;function ua(){return n.navigator?n.navigator.userAgent:i}K=J=I=H=j;var L;if(L=ua()){var va=n.navigator;H=L.indexOf("Opera")==0;I=!H&&L.indexOf("MSIE")!=-1;J=!H&&L.indexOf("WebKit")!=-1;K=!H&&!J&&va.product=="Gecko"}var M=I,wa=K,xa=J,N;
a:{var O="",P;if(H&&n.opera){var Q=n.opera.version;O=typeof Q=="function"?Q():Q}else{if(wa)P=/rv\:([^\);]+)(\)|;)/;else if(M)P=/MSIE\s+([^\);]+)(\)|;)/;else if(xa)P=/WebKit\/(\S+)/;if(P){var ya=P.exec(ua());O=ya?ya[1]:""}}if(M){var R,za=n.document;R=za?za.documentMode:undefined;if(R>parseFloat(O)){N=String(R);break a}}N=O}var S={};var Aa=!M||S["9"]||(S["9"]=ka(N,"9")>=0);M&&(S["9"]||(S["9"]=ka(N,"9")>=0));function Ba(a){var c;c=(c=a.className)&&typeof c.split=="function"?c.split(/\s+/):[];var b;b=na(arguments,1);for(var d=0,e=0;e<b.length;e++)if(!(la(c,b[e])>=0)){c.push(b[e]);d++}b=d==b.length;a.className=c.join(" ");return b};function Ca(a,c,b){for(var d in a)c.call(b,a[d],d,a)}var Da=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"];function Ea(a){for(var c,b,d=1;d<arguments.length;d++){b=arguments[d];for(c in b)a[c]=b[c];for(var e=0;e<Da.length;e++){c=Da[e];if(Object.prototype.hasOwnProperty.call(b,c))a[c]=b[c]}}};function T(a){return r(a)?document.getElementById(a):a}function Fa(a,c){Ca(c,function(b,d){if(d=="style")a.style.cssText=b;else if(d=="class")a.className=b;else if(d=="for")a.htmlFor=b;else if(d in Ga)a.setAttribute(Ga[d],b);else a[d]=b})}var Ga={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",rowspan:"rowSpan",valign:"vAlign",height:"height",width:"width",usemap:"useMap",frameborder:"frameBorder",type:"type"};
function Ha(){var a=arguments,c=a[0],b=a[1];if(!Aa&&b&&(b.name||b.type)){c=["<",c];b.name&&c.push(' name="',v(b.name),'"');if(b.type){c.push(' type="',v(b.type),'"');var d={};Ea(d,b);b=d;delete b.type}c.push(">");c=c.join("")}c=document.createElement(c);if(b)if(r(b))c.className=b;else q(b)=="array"?Ba.apply(i,[c].concat(b)):Fa(c,b);a.length>2&&Ia(document,c,a,2);return c}
function Ia(a,c,b,d){function e(h){if(h)c.appendChild(r(h)?a.createTextNode(h):h)}for(d=d;d<b.length;d++){var f=b[d];ba(f)&&!(s(f)&&f.nodeType>0)?B(Ja(f)?ma(f):f,e):e(f)}}function U(a,c){var b=a.createElement("div");if(M){b.innerHTML="<br>"+c;b.removeChild(b.firstChild)}else b.innerHTML=c;if(b.childNodes.length==1)return b.removeChild(b.firstChild);else{for(var d=a.createDocumentFragment();b.firstChild;)d.appendChild(b.firstChild);return d}}function V(a,c){a.appendChild(c)}
function Ka(a,c){if("textContent"in a)a.textContent=c;else if(a.firstChild&&a.firstChild.nodeType==3){for(;a.lastChild!=a.firstChild;)a.removeChild(a.lastChild);a.firstChild.data=c}else{for(var b;b=a.firstChild;)a.removeChild(b);a.appendChild((a.nodeType==9?a:a.ownerDocument||a.document).createTextNode(c))}}function Ja(a){if(a&&typeof a.length=="number")if(s(a))return typeof a.item=="function"||typeof a.item=="string";else if(q(a)=="function")return typeof a.item=="function";return j};function W(a){a=a||{};this.O=a.key;this.b=a.template||"";this.a=a.formatter||{};this.o=a.callbackName||La}function Ma(a){a=a.replace("<","&lt;").replace(">","&gt;");return a=a.replace('"',"&quot;").replace("'","&#39;")}
function Na(a,c,b,d){if(!c||b<200||300<=b)throw"FeedRenderer : "+d;if(a=W.prototype.j[a-0]){var e=[],f=a.Q||"",h=a.N||{};a=a.element||"";B(c.feed.entries,function(l,g){e[g]=f.replace(/%([^%]*)%/g,function(o,k){return k in l?(h[k]||Ma)(l[k],l):""})});if(q(a)=="function")a(e,c);else{e=e.join("");s(a)&&a.nodeType>0||(a=T(a));a&&V(a,U(document,e))}}}var La="";W.prototype.j=[];W.prototype.e=m("b");W.prototype.h=m("a");
W.prototype.d=function(a,c,b){if(!this.b)throw"FeedRenderer : The template string must be set.";if(!this.o)throw"FeedRenderer : The callback name must be set.";b=b||{};a=["http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&callback=",u(this.o),"&q=",u(a),"&context=",this.j.length];var d=b.num;b=b.scoring;var e=this.O;if(d)a=C(a,["&num=",u(d)]);if(e)a=C(a,["&key=",u(e)]);if(b)a=C(a,["&scoring=",u(b)]);this.j.push({element:c,Q:this.b,N:this.a});c=Ha("script",{type:"text/javascript",
src:x.apply(i,a)});document.body.appendChild(c)};function X(a,c){a=a||{};c=c||{};var b=a;if(typeof b!="string"){var d=a.key,e=a.pub===j?j:true;if(!d)throw Y('The "key" parameter is required.');b=[e?"http":"https","://spreadsheets.google.com"];a.domain&&!e&&b.push("/a/",u(a.domain));b.push("/tq?key=",u(d));a.sheet?b.push("&sheet=",u(a.sheet)):b.push("&gid=",u(a.gid||0));typeof a.headers=="number"&&b.push("&headers=",a.headers);e&&b.push("&pub=1");b=x.apply(i,b);d={};e=a;for(var f in e)d[f]=e[f];f=c;for(var h in f)d[h]=f[h];c=d}this.q=new google.visualization.Query(b);
this.b=c.template||"";this.a=c.formatter||{}}function Oa(a){return v(""+a)}function Y(a){return"SpreadsheetRenderer : "+a}X.prototype.e=m("b");X.prototype.h=m("a");X.prototype.d=function(a,c){this.q.setQuery(a);this.q.send(ca(this.P,this,c))};
X.prototype.P=function(a,c){if(!c)throw Y("Null response.");if(c.isError())throw Y(c.getMessage());var b=c.getDataTable(),d=b.getNumberOfColumns(),e=b.getNumberOfRows(),f=[],h=[],l=[],g,o,k,p;for(g=0;g<d;++g){f[g]=b.getColumnLabel(g);h[g]=this.a[f[g]]||this.a[g]||Oa}for(o=0;o<e;++o){k={};p={};for(g=0;g<d;++g)k[g]=k[f[g]]={value:b.getFormattedValue(o,g),rawValue:b.getValue(o,g)};for(g=0;g<d;++g)p[g]=p[f[g]]=h[g](k[g].value,k[g].rawValue,k);l[o]=this.b.replace(/%([^%]*)%/g,function(A,aa){if(!aa||aa.length<=
0)return"%";return p[aa]})}if(q(a)=="function")a(l,b);else{l=l.join("");s(a)&&a.nodeType>0||(a=T(a));a&&V(a,U(document,l))}};if(typeof history.navigationMode!="undifined")history.navigationMode="fast";var Z={};window.template=Z;Z.FeedRenderer=W;Z.feedCallback=function(){Na.apply(this,arguments)};La="template.feedCallback";var Pa=[],Qa=[];Z.f=function(a,c){a=="ready"?Qa.push(c):Pa.push(c)};Z.addWindowEvent=Z.f;Z.invokeContentReady=function(){B(Qa,function(a){a()})};window.onload=function(){B(Pa,function(a){a()})};
Z.f("ready",function(){if(document.location.href.match(/^http\:\/\/blog\.livedoor\.jp\/sourcewalker\/?(.*)$/i)){var a="http://webos-goodies.jp/"+(RegExp.$1||""),c=x('<div style="text-align:center; color:red; font-weight:bold; margin:16px 0px;">',"\u30b5\u30a4\u30c8\u3092\u79fb\u8ee2\u3057\u307e\u3057\u305f\u3002<br>",'\u79fb\u8ee2\u5148\uff1a<a href="',a,'">',a,"</a>","</div>");a=T("tpl_old_site_notification");c=U(document,c);a.appendChild(c)}});
Z.generateRelatedLinks=function(a,c){var b=/(\w+)\.html$/,d="";if(window.location.href.match(b))d=RegExp.$1;var e=[];B(na(a.p,0,5),function(h,l){var g=h.u.match(b)&&RegExp.$1==d?"<li>%t%</li>":'<li><a href="%u%">%t%</a></li>';e[l]=g.replace(/%([^%]*)%/g,function(o,k){return v(h[k]||"")})});var f=v(c+"categories/"+a.t+".html");e=C(['<h1><a href="',f,'">',a.c,"</a></h1><ul>"],e,['</ul><div class="morecategory"><a href="',f,'">&gt;&gt; \u3082\u3063\u3068\u8aad\u3080</a></div>']);e=x.apply(i,e);return U(document,
e)};var $={Timestamp:function(a,c){return c instanceof Date?x(c.getFullYear(),"\u5e74",c.getMonth()+1,"\u6708",c.getDate(),"\u65e5 ",c.getHours(),":",c.getMinutes()):""},Name:function(a,c,b){c=(b.Url||{}).value;return/^https?:\/\//.test(c)?x('<a href="',v(c),'">',v(a),"</a>"):v(a)},Comment:function(a){return v(a).replace(/(\r\n|\r|\n)/g,"<br>")}};$.Source=$.Name;$.Excerpt=$.Comment;
Z.renderComments=function(a){renderer=new X({key:"pMIBrnJ4PHK_Tnb_IAz3cTQ"});renderer.e('<div class="comment_item"><h2><n>.&nbsp;Posted by %Name% &nbsp;&nbsp;&nbsp;%Timestamp%</h2><p>%Comment%</p></div>');renderer.h($);renderer.d("select * WHERE B = '"+a+"' ORDER BY A",function(c,b){var d=1,e=b.getNumberOfRows();if(e>0){c=c.join("").replace(/<n>/g,function(){return d++});c=x('<h1>\u3053\u306e\u8a18\u4e8b\u3078\u306e\u30b3\u30e1\u30f3\u30c8</h1><div class="comment_body">',c,"</div>");V(T("tpl_comments"),
U(document,c))}Ka(T("tpl_num_comments"),e)})};
Z.renderTrackbacks=function(a){renderer=new X({key:"pMIBrnJ4PHK_XSOfGkVhjTQ"});renderer.e('<div class="trackback_item"><h2><n>.&nbsp;%Source%&nbsp;&nbsp;[&nbsp;%Site%&nbsp;]&nbsp;&nbsp;&nbsp;%Timestamp%</h2><p>%Excerpt%</p></div>');renderer.h($);renderer.d("select * WHERE B = '"+a+"' ORDER BY A",function(c,b){var d=1,e=b.getNumberOfRows();if(e>0){c=c.join("").replace(/<n>/g,function(){return d++});c=x('<h1>\u3053\u306e\u8a18\u4e8b\u3078\u306e\u30c8\u30e9\u30c3\u30af\u30d0\u30c3\u30af</h1><div class="trackback_body">',c,
"</div>");V(T("tpl_trackbacks"),U(document,c))}Ka(T("tpl_num_trackbacks"),e)})};
var Ra={publishedDate:function(a){a=new Date(a);var c=new pa(10),b;b=a.getTime();var d=da();if(d<b)b=d;b=b;d=da();var e=Math.floor((d-b)/6E4),f=j;if(e<0){f=true;e*=-1}if(e<60)b=G(e,f,0);else{e=Math.floor(e/60);if(e<24)b=G(e,f,1);else{e=(new Date).getTimezoneOffset()*6E4;e=Math.floor((d+e)/864E5)-Math.floor((b+e)/864E5);if(f)e*=-1;b=e<14?G(e,f,2):""}}if(!(b=b)){b=[];for(d=0;d<c.g.length;++d){f=c.g[d].text;1==c.g[d].type?b.push(ta(c,f,a,a,a,void 0)):b.push(f)}b=b.join("")}return b}};
Z.f("ready",function(){var a=new W({key:"ABQIAAAADFolcpMzeDEXDBR65zomPRSdobuQ8nl73Zh0G-Y7QnxRnfXdORRvX5O5---NvrXXjsKrVcjvSimLkw"});a.e('<a class="sidebody" href="%link%">%title%</a>');a.d("http://webos-goodies.jp/atom.xml","tpl_recent_articles",{num:8});a.e(x('<a class="sidebody" href="%link%" target="_blank">%contentSnippet%<br>','<span class="tpl-buzz-date">%publishedDate%</span></a>'));a.h(Ra);a.d("http://buzz.googleapis.com/feeds/113438044941105226764/public/posted","tpl_buzz",{num:16})});
Z.f("ready",function(){var a=T("tpl_recommendations");if(a){var c=a.clientWidth,b=a.clientHeight;a.innerHTML='<iframe src="http://www.facebook.com/plugins/recommendations.php?site=webos-goodies.jp&amp;width='+c+"&amp;height="+b+'&amp;header=false&amp;border_color=white" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:'+c+"px; height:"+b+'px;" allowTransparency="true"></iframe>'}});
})();