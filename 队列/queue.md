
C++ 中栈的方法

back()返回最后一个元素
empty()如果队列空则返回真
front()返回第一个元素
pop()删除第一个元素
push()在末尾加入一个元素
size()返回队列中元素的个数

```javascript
var queue = []
queue.back = function(){
   return this[this.length-1]
}
queue.front = function(){
   return this[0]
}
queue.enqueue = function(a){
   return this.push(a)
}
queue.dequeue = function(){
   return this.shift();
}
queue.empty = function(){
   return this.length === 0
}
queue.size = function(){
   return this.length;
}
```