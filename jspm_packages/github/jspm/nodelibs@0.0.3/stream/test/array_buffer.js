/* */ 
"format cjs";function TestWritable(e){return this instanceof TestWritable?(Writable.call(this,e),void(this._written=[])):new TestWritable(e)}var path=require("../../path"),test=require("tape"),xUint8Array="undefined"==typeof Uint8Array?require("typedarray").Uint8Array:Uint8Array,Writable=require("../writable"),inherits=require("inherits");inherits(TestWritable,Writable),TestWritable.prototype._write=function(e,t,r){this._written.push(e),r()};var typedArray=new xUint8Array(1);typedArray[0]=88,"undefined"!=typeof Uint8Array&&test(".writable writing ArrayBuffer",function(e){var t=new TestWritable;t.write(typedArray.buffer),t.end(),e.equal(t._written.length,1),e.equal(t._written[0].toString(),"X"),e.end()}),test(".writable writing Uint8array",function(e){var t=new TestWritable;t.write(typedArray),t.end(),e.equal(t._written.length,1),e.equal(t._written[0].toString(),"X"),e.end()});
//# sourceMappingURL=array_buffer.js.map