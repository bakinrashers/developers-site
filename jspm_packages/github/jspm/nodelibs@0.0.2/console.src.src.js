"format cjs";
/*global window, global*/
function log(){}function info(){console.log.apply(console,arguments)}function warn(){console.log.apply(console,arguments)}function error(){console.warn.apply(console,arguments)}function time(e){times[e]=Date.now()}function timeEnd(e){var t=times[e];if(!t)throw new Error("No such label: "+e);var r=Date.now()-t;console.log(e+": "+r+"ms")}function trace(){var e=new Error;e.name="Trace",e.message=util.format.apply(null,arguments),console.error(e.stack)}function dir(e){console.log(util.inspect(e)+"\n")}function assert(e){if(!e){var t=slice.call(arguments,1);assert.ok(!1,util.format.apply(null,t))}}var util=require("./util"),assert=require("./assert"),slice=Array.prototype.slice,console,times={};console="undefined"!=typeof global&&global.console?global.console:"undefined"!=typeof window&&window.console?window.console:{};for(var functions=[[log,"log"],[info,"info"],[warn,"warn"],[error,"error"],[time,"time"],[timeEnd,"timeEnd"],[trace,"trace"],[dir,"dir"],[assert,"assert"]],i=0;i<functions.length;i++){var tuple=functions[i],f=tuple[0],name=tuple[1];console[name]||(console[name]=f)}module.exports=console;