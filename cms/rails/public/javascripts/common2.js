(function(){function i(a){return function(b){this[a]=b}}var j=this;
function k(a){var b=typeof a;if(b=="object")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)=="[object Array]"||typeof a.length=="number"&&typeof a.splice!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("splice"))return"array";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)=="[object Function]"||typeof a.call!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("call")))return"function"}else return"null";
else if(b=="function"&&typeof a.call=="undefined")return"object";return b}function aa(a){var b=k(a);return b=="array"||b=="object"&&typeof a.length=="number"}function l(a){return typeof a=="string"}function m(a){a=k(a);return a=="object"||a=="array"||a=="function"}function n(a){var b=k(a);if(b=="object"||b=="array"){if(a.O)return a.O.call(a);b=b=="array"?[]:{};for(var c in a)b[c]=n(a[c]);return b}return a}
function ba(a,b){var c=b||j;if(arguments.length>2){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(c,e)}}else return function(){return a.apply(c,arguments)}}var q=Date.now||function(){return+new Date};function r(a,b){b=b||{};for(var c in b)a=a.replace(new RegExp("\\{\\$"+c+"\\}","gi"),b[c]);return a};var t=Array.prototype,u=t.forEach?function(a,b,c){t.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)};function v(){return t.concat.apply(t,arguments)}function ca(a){if(k(a)=="array")return v(a);else{for(var b=[],c=0,d=a.length;c<d;c++)b[c]=a[c];return b}}function da(a,b,c){return arguments.length<=2?t.slice.call(a,b):t.slice.call(a,b,c)};function ea(a,b,c){for(var d in a)b.call(c,a[d],d,a)};var fa={},ga=/^[a-zA-Z0-9\-_.!~*'()]*$/;function w(a){a=String(a);if(!ga.test(a))return encodeURIComponent(a);return a}function x(a,b){if(b)return a.replace(y,"&amp;").replace(z,"&lt;").replace(A,"&gt;").replace(B,"&quot;");else{if(!ha.test(a))return a;if(a.indexOf("&")!=-1)a=a.replace(y,"&amp;");if(a.indexOf("<")!=-1)a=a.replace(z,"&lt;");if(a.indexOf(">")!=-1)a=a.replace(A,"&gt;");if(a.indexOf('"')!=-1)a=a.replace(B,"&quot;");return a}}var y=/&/g,z=/</g,A=/>/g,B=/\"/g,ha=/[&<>\"]/;
function C(a,b,c){a=c!==undefined?a.toFixed(c):String(a);c=a.indexOf(".");if(c==-1)c=a.length;return(new Array(Math.max(0,b-c)+1)).join("0")+a}function D(){return Array.prototype.join.call(arguments,"")}q();var E,F,G,H;function I(){return j.navigator?j.navigator.userAgent:null}H=G=F=E=false;var J;if(J=I()){var ia=j.navigator;E=J.indexOf("Opera")==0;F=!E&&J.indexOf("MSIE")!=-1;G=!E&&J.indexOf("WebKit")!=-1;H=!E&&!G&&ia.product=="Gecko"}var K=F,ja=H,ka=G,L="",M;if(E&&j.opera){var N=j.opera.version;L=typeof N=="function"?N():N}else{if(ja)M=/rv\:([^\);]+)(\)|;)/;else if(K)M=/MSIE\s+([^\);]+)(\)|;)/;else if(ka)M=/WebKit\/(\S+)/;if(M){var O=M.exec(I());L=O?O[1]:""}};function P(a){return l(a)?document.getElementById(a):a}function la(a,b){ea(b,function(c,d){if(d=="style")a.style.cssText=c;else if(d=="class")a.className=c;else if(d=="for")a.htmlFor=c;else if(d in ma)a.setAttribute(ma[d],c);else a[d]=c})}var ma={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",rowspan:"rowSpan",valign:"vAlign",height:"height",width:"width",usemap:"useMap",frameborder:"frameBorder",type:"type"};function na(){return oa(document,arguments)}
function oa(a,b){var c=b[0],d=b[1];if(K&&d&&(d.name||d.type)){c=["<",c];d.name&&c.push(' name="',x(d.name),'"');if(d.type){c.push(' type="',x(d.type),'"');d=n(d);delete d.type}c.push(">");c=c.join("")}var e=a.createElement(c);if(d)if(l(d))e.className=d;else la(e,d);if(b.length>2){d=function(h){if(h)e.appendChild(l(h)?a.createTextNode(h):h)};for(c=2;c<b.length;c++){var f=b[c];aa(f)&&!(m(f)&&f.nodeType>0)?u(pa(f)?ca(f):f,d):d(f)}}return e}
function Q(a,b){var c=a.createElement("div");c.innerHTML=b;if(c.childNodes.length==1)return c.removeChild(c.firstChild);else{for(a=a.createDocumentFragment();c.firstChild;)a.appendChild(c.firstChild);return a}}function S(a,b){a.appendChild(b)}
function qa(a,b){if("textContent"in a)a.textContent=b;else if(a.firstChild&&a.firstChild.nodeType==3){for(;a.lastChild!=a.firstChild;)a.removeChild(a.lastChild);a.firstChild.data=b}else{for(var c;c=a.firstChild;)a.removeChild(c);a.appendChild((a.nodeType==9?a:a.ownerDocument||a.document).createTextNode(b))}}function pa(a){if(a&&typeof a.length=="number")if(m(a))return typeof a.item=="function"||typeof a.item=="string";else if(k(a)=="function")return typeof a.item=="function";return false};var T={z:["BC","AD"],w:["Before Christ","Anno Domini"],B:["J","F","M","A","M","J","J","A","S","O","N","D"],I:["J","F","M","A","M","J","J","A","S","O","N","D"],A:["January","February","March","April","May","June","July","August","September","October","November","December"],H:["January","February","March","April","May","June","July","August","September","October","November","December"],D:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],K:["Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"],N:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],M:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],G:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],L:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],W:["S","M","T","W","T","F","S"],J:["S","M","T","W","T","F","S"],F:["Q1","Q2","Q3","Q4"],C:["1st quarter","2nd quarter","3rd quarter","4th quarter"],v:["AM","PM"],n:["EEEE, MMMM d, y","MMMM d, y","MMM d, y","M/d/yy"],o:["h:mm:ss a zzzz",
"h:mm:ss a z","h:mm:ss a","h:mm a"],T:{Md:"M/d",MMMMd:"MMMM d",MMMd:"MMM d"},U:6,X:[5,6],V:2};function ra(){}function U(a){if(typeof a=="number"){var b=new ra;b.i=a;b.s=sa(a);a=a;if(a==0)a="UTC";else{var c=["UTC",a<0?"+":"-"];a=Math.abs(a);c.push(Math.floor(a/60)%100);a%=60;a!=0&&c.push(":",a);a=c.join("")}b.m=[a,a];b.j=[];return b}b=new ra;b.s=a.id;b.i=-a.std_offset;b.m=a.names;b.j=a.transitions;return b}function ta(a){var b=["GMT"];b.push(a<=0?"+":"-");a=Math.abs(a);b.push(C(Math.floor(a/60)%100,2),":",C(a%60,2));return b.join("")}
function sa(a){if(a==0)return"Etc/GMT";var b=["Etc/GMT",a<0?"-":"+"];a=Math.abs(a);b.push(Math.floor(a/60)%100);a%=60;a!=0&&b.push(":",C(a,2));return b.join("")}function V(a,b){b=Date.UTC(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate(),b.getUTCHours(),b.getUTCMinutes())/36E5;for(var c=0;c<a.j.length&&b>=a.j[c];)c+=2;return c==0?0:a.j[c-1]}function ua(a,b){a=-(a.i-V(a,b));b=[a<0?"-":"+"];a=Math.abs(a);b.push(C(Math.floor(a/60)%100,2),C(a%60,2));return b.join("")};function va(a){this.g=[];typeof a=="number"?wa(this,a):xa(this,a)}var ya=[/^\'(?:[^\']|\'\')*\'/,/^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/,/^[^\'GyMkSEahKHcLQdmsvzZ]+/];function xa(a,b){for(;b;)for(var c=0;c<ya.length;++c){var d=b.match(ya[c]);if(d){d=d[0];b=b.substring(d.length);if(c==0)if(d=="''")d="'";else{d=d.substring(1,d.length-1);d=d.replace(/\'\'/,"'")}a.g.push({text:d,type:c});break}}}
function za(a,b,c){var d=c?(b.getTimezoneOffset()-(c.i-V(c,b)))*6E4:0,e=d?new Date(b.getTime()+d):b,f=e;if(c&&e.getTimezoneOffset()!=b.getTimezoneOffset()){d+=d>0?-86400000:864E5;f=new Date(b.getTime()+d)}d=[];for(var h=0;h<a.g.length;++h){var g=a.g[h].text;1==a.g[h].type?d.push(Aa(a,g,b,e,f,c)):d.push(g)}return d.join("")}function wa(a,b){if(b<4)b=T.n[b];else if(b<8)b=T.o[b-4];else if(b<12)b=T.n[b-8]+" "+T.o[b-8];else{wa(a,10);return}xa(a,b)}
function Aa(a,b,c,d,e,f){a=b.length;switch(b.charAt(0)){case "G":c=d.getFullYear()>0?1:0;return a>=4?T.w[c]:T.z[c];case "y":c=d.getFullYear();if(c<0)c=-c;return a==2?C(c%100,2):String(c);case "M":a:{c=d.getMonth();switch(a){case 5:a=T.B[c];break a;case 4:a=T.A[c];break a;case 3:a=T.D[c];break a;default:a=C(c+1,a);break a}}return a;case "k":return C(e.getHours()||24,a);case "S":return(e.getTime()%1E3/1E3).toFixed(Math.min(3,a)).substr(2)+(a>3?C(0,a-3):"");case "E":c=d.getDay();return a>=4?T.N[c]:T.G[c];
case "a":a=e.getHours();return T.v[a>=12&&a<24?1:0];case "h":return C(e.getHours()%12||12,a);case "K":return C(e.getHours()%12,a);case "H":return C(e.getHours(),a);case "c":a:{c=d.getDay();switch(a){case 5:a=T.J[c];break a;case 4:a=T.M[c];break a;case 3:a=T.L[c];break a;default:a=C(c,1);break a}}return a;case "L":a:{c=d.getMonth();switch(a){case 5:a=T.I[c];break a;case 4:a=T.H[c];break a;case 3:a=T.K[c];break a;default:a=C(c+1,a);break a}}return a;case "Q":c=Math.floor(d.getMonth()/3);return a<4?
T.F[c]:T.C[c];case "d":return C(d.getDate(),a);case "m":return C(e.getMinutes(),a);case "s":return C(e.getSeconds(),a);case "v":a=(a=f)||U(c.getTimezoneOffset());return a.s;case "z":b=(b=f)||U(c.getTimezoneOffset());return a<4?b.m[V(b,c)>0?2:0]:b.m[V(b,c)>0?3:1];case "Z":b=(b=f)||U(c.getTimezoneOffset());return a<4?ua(b,c):ta(b.i-V(b,c));default:return""}};function W(a,b,c){if(!b&&c==0){b=r("{$num} minute ago",{num:a});c=r("{$num} minutes ago",{num:a});return a==1?b:c}else if(b&&c==0){b=r("in {$num} minute",{num:a});c=r("in {$num} minutes",{num:a});return a==1?b:c}else if(!b&&c==1){b=r("{$num} hour ago",{num:a});c=r("{$num} hours ago",{num:a});return a==1?b:c}else if(b&&c==1){b=r("in {$num} hour",{num:a});c=r("in {$num} hours",{num:a});return a==1?b:c}else if(!b&&c==2){b=r("{$num} day ago",{num:a});c=r("{$num} days ago",{num:a});return a==1?b:c}else if(b&&
c==2){b=r("in {$num} day",{num:a});c=r("in {$num} days",{num:a});return a==1?b:c}else return""};function X(a){a=a||{};this.Q=a.key;this.d=a.template||"";this.a=a.formatter||{};this.q=a.callbackName||Ba}function Ca(a){a=a.replace("<","&lt;").replace(">","&gt;");return a=a.replace('"',"&quot;").replace("'","&#39;")}
function Da(a,b,c,d){if(!b||c<200||300<=c)throw"FeedRenderer : "+d;if(a=X.prototype.l[a-0]){var e=[],f=a.S||"",h=a.P||{};a=a.element||"";u(b.feed.entries,function(g,o){e[o]=f.replace(/%([^%]*)%/g,function(p,s){return s in g?(h[s]||Ca)(g[s],g):""})});if(k(a)=="function")a(e,b);else{e=e.join("");m(a)&&a.nodeType>0||(a=P(a));a&&S(a,Q(document,e))}}}var Ba="";X.prototype.l=[];X.prototype.b=function(a){return"FeedRenderer : "+a};X.prototype.f=i("d");X.prototype.h=i("a");
X.prototype.e=function(a,b,c){if(!this.d)throw this.b("The template string must be set.");if(!this.q)throw this.b("The callback name must be set.");c=c||{};a=["http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&callback=",w(this.q),"&q=",w(a),"&context=",this.l.length];var d=c.num;c=c.scoring;var e=this.Q;if(d)a=v(a,["&num=",w(d)]);if(e)a=v(a,["&key=",w(e)]);if(c)a=v(a,["&scoring=",fa.Y(c)]);this.l.push({element:b,S:this.d,P:this.a});b=na("script",{type:"text/javascript",src:D.apply(D,
a)});document.body.appendChild(b)};function Y(a,b){a=a||{};b=b||{};var c=a;if(typeof c!="string"){c=a.key;var d=a.domain||"",e="pub"in a&&a.pub!==null?a.pub:1;if(!c)throw this.b('The "key" parameter is required.');if(d&&e==0)d="/a/"+w(d);c=D("http://spreadsheets.google.com",d,"/tq?key=",w(c),"&gid=",w(a.gid||0),"&pub=",w(e));d={};a=a;for(var f in a)d[f]=a[f];f=b;for(var h in f)d[h]=f[h]}this.r=new google.visualization.Query(c);this.d=b.template||"";this.a=b.formatter||{}}function Ea(a){return x(""+a)}
Y.prototype.b=function(a){return"SpreadsheetsRenderer : "+a};Y.prototype.f=i("d");Y.prototype.h=i("a");Y.prototype.e=function(a,b){this.r.setQuery(a);this.r.send(ba(this.R,this,b))};
Y.prototype.R=function(a,b){if(!b)throw this.b("Null response.");if(b.isError())throw this.b(this.getMessage());b=b.getDataTable();var c=b.getNumberOfColumns(),d=b.getNumberOfRows(),e=[],f=[],h=[],g,o,p,s;for(g=0;g<c;++g){e[g]=b.getColumnLabel(g);f[g]=this.a[e[g]]||this.a[g]||Ea}for(o=0;o<d;++o){p={};s={};for(g=0;g<c;++g)p[g]=p[e[g]]={value:b.getFormattedValue(o,g),rawValue:b.getValue(o,g)};for(g=0;g<c;++g)s[g]=s[e[g]]=f[g](p[g].value,p[g].rawValue,p);h[o]=this.d.replace(/%([^%]*)%/g,function(Ia,
R){if(!R||R.length<=0)return"%";return s[R]})}if(k(a)=="function")a(h,b);else{h=h.join("");m(a)&&a.nodeType>0||(a=P(a));a&&S(a,Q(document,h))}};if(typeof history.navigationMode!="undifined")history.navigationMode="fast";var Z={};window.template=Z;Z.FeedRenderer=X;Z.feedCallback=function(){Da.apply(this,arguments)};Ba="template.feedCallback";var Fa=[],Ga=[];Z.k=function(a,b){a=="ready"?Ga.push(b):Fa.push(b)};Z.addWindowEvent=Z.k;Z.invokeContentReady=function(){u(Ga,function(a){a()})};window.onload=function(){u(Fa,function(a){a()})};
Z.k("ready",function(){if(document.location.href.match(/^http\:\/\/blog\.livedoor\.jp\/sourcewalker\/?(.*)$/i)){var a="http://webos-goodies.jp/"+(RegExp.$1||""),b=D('<div style="text-align:center; color:red; font-weight:bold; margin:16px 0px;">',"\u30b5\u30a4\u30c8\u3092\u79fb\u8ee2\u3057\u307e\u3057\u305f\u3002<br>",'\u79fb\u8ee2\u5148\uff1a<a href="',a,'">',a,"</a>","</div>");a=P("tpl_old_site_notification");b=Q(document,b);a.appendChild(b)}});
Z.generateRelatedLinks=function(a,b){var c=/(\w+)\.html$/,d="";if(window.location.href.match(c))d=RegExp.$1;var e=[];u(da(a.p,0,5),function(f,h){var g=f.u.match(c)&&RegExp.$1==d?"<li>%t%</li>":'<li><a href="%u%">%t%</a></li>';e[h]=g.replace(/%([^%]*)%/g,function(o,p){return x(f[p]||"")})});b=x(b+"categories/"+a.t+".html");e=v(['<h1><a href="',b,'">',a.c,"</a></h1><ul>"],e,['</ul><div class="morecategory"><a href="',b,'">&gt;&gt; \u3082\u3063\u3068\u8aad\u3080</a></div>']);e=D.apply(D,e);return Q(document,
e)};var $={Timestamp:function(a,b){return b instanceof Date?D(b.getFullYear(),"\u5e74",b.getMonth()+1,"\u6708",b.getDate(),"\u65e5 ",b.getHours(),":",b.getMinutes()):""},Name:function(a,b,c){b=(c.Url||{}).value;return/^https?:\/\//.test(b)?D('<a href="',x(b),'">',x(a),"</a>"):x(a)},Comment:function(a){return x(a).replace(/(\r\n|\r|\n)/g,"<br>")}};$.Source=$.Name;$.Excerpt=$.Comment;
Z.renderComments=function(a){renderer=new Y({key:"pMIBrnJ4PHK_Tnb_IAz3cTQ"});renderer.f('<div class="comment_item"><h2><n>.&nbsp;Posted by %Name% &nbsp;&nbsp;&nbsp;%Timestamp%</h2><p>%Comment%</p></div>');renderer.h($);renderer.e("select * WHERE B = '"+a+"' ORDER BY A",function(b,c){var d=1;c=c.getNumberOfRows();if(c>0){b=b.join("").replace(/<n>/g,function(){return d++});b=D('<h1>\u3053\u306e\u8a18\u4e8b\u3078\u306e\u30b3\u30e1\u30f3\u30c8</h1><div class="comment_body">',b,"</div>");S(P("tpl_comments"),
Q(document,b))}qa(P("tpl_num_comments"),c)})};
Z.renderTrackbacks=function(a){renderer=new Y({key:"pMIBrnJ4PHK_XSOfGkVhjTQ"});renderer.f('<div class="trackback_item"><h2><n>.&nbsp;%Source%&nbsp;&nbsp;[&nbsp;%Site%&nbsp;]&nbsp;&nbsp;&nbsp;%Timestamp%</h2><p>%Excerpt%</p></div>');renderer.h($);renderer.e("select * WHERE B = '"+a+"' ORDER BY A",function(b,c){var d=1;c=c.getNumberOfRows();if(c>0){b=b.join("").replace(/<n>/g,function(){return d++});b=D('<h1>\u3053\u306e\u8a18\u4e8b\u3078\u306e\u30c8\u30e9\u30c3\u30af\u30d0\u30c3\u30af</h1><div class="trackback_body">',b,
"</div>");S(P("tpl_trackbacks"),Q(document,b))}qa(P("tpl_num_trackbacks"),c)})};var Ha={publishedDate:function(a){a=new Date(a);var b=new va(10),c=a.getTime(),d=q();if(d<c)c=d;c=c;d=q();var e=Math.floor((d-c)/6E4),f=false;if(e<0){f=true;e*=-1}if(e<60)c=W(e,f,0);else{e=Math.floor(e/60);if(e<24)c=W(e,f,1);else{e=(new Date).getTimezoneOffset()*6E4;e=Math.floor((d+e)/864E5)-Math.floor((c+e)/864E5);if(f)e*=-1;c=e<14?W(e,f,2):""}}return c||za(b,a)}};
Z.k("ready",function(){var a=new X({key:"ABQIAAAADFolcpMzeDEXDBR65zomPRSdobuQ8nl73Zh0G-Y7QnxRnfXdORRvX5O5---NvrXXjsKrVcjvSimLkw"});a.f('<a class="sidebody" href="%link%">%title%</a>');a.e("http://webos-goodies.jp/atom.xml","tpl_recent_articles",{num:8});a.f(D('<a class="sidebody" href="%link%" target="_blank">%contentSnippet%<br>','<span class="tpl-buzz-date">%publishedDate%</span></a>'));a.h(Ha);a.e("http://buzz.googleapis.com/feeds/113438044941105226764/public/posted","tpl_buzz",{num:16})});
})();