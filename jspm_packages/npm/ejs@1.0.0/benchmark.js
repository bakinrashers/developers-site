/* */
"format cjs";var ejs=require("./lib/ejs"),str="<% if (foo) { %><p><%= foo %></p><% } %>",times=5e4;console.log("rendering "+times+" times");for(var start=new Date;times--;)ejs.render(str,{cache:!0,filename:"test",locals:{foo:"bar"}});console.log("took "+(new Date-start)+"ms");
//# sourceMappingURL=benchmark.js.map