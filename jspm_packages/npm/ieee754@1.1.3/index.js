/* */
"format cjs";exports.read=function(e,r,n,t,i){var s,o,u=8*i-t-1,a=(1<<u)-1,c=a>>1,l=-7,f=n?i-1:0,p=n?-1:1,d=e[r+f];for(f+=p,s=d&(1<<-l)-1,d>>=-l,l+=u;l>0;s=256*s+e[r+f],f+=p,l-=8);for(o=s&(1<<-l)-1,s>>=-l,l+=t;l>0;o=256*o+e[r+f],f+=p,l-=8);if(0===s)s=1-c;else{if(s===a)return o?0/0:1/0*(d?-1:1);o+=Math.pow(2,t),s-=c}return(d?-1:1)*o*Math.pow(2,s-t)},exports.write=function(e,r,n,t,i,s){var o,u,a,c=8*s-i-1,l=(1<<c)-1,f=l>>1,p=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,d=t?0:s-1,m=t?1:-1,h=0>r||0===r&&0>1/r?1:0;for(r=Math.abs(r),isNaN(r)||1/0===r?(u=isNaN(r)?1:0,o=l):(o=Math.floor(Math.log(r)/Math.LN2),r*(a=Math.pow(2,-o))<1&&(o--,a*=2),r+=o+f>=1?p/a:p*Math.pow(2,1-f),r*a>=2&&(o++,a/=2),o+f>=l?(u=0,o=l):o+f>=1?(u=(r*a-1)*Math.pow(2,i),o+=f):(u=r*Math.pow(2,f-1)*Math.pow(2,i),o=0));i>=8;e[n+d]=255&u,d+=m,u/=256,i-=8);for(o=o<<i|u,c+=i;c>0;e[n+d]=255&o,d+=m,o/=256,c-=8);e[n+d-m]|=128*h};
//# sourceMappingURL=index.js.map