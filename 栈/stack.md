
C++ 中栈的方法
void Push(const T & s);//插入数据
void Pop();//删除数据
bool empty();//判断是否为空
size_t size();//元素个数
T & Top();//取出最后进入的元素但不删除

```javascript
var stack = []
stack.top = function(){
   return this[this.length-1]
}
stack.empty = function(){
   return this.length === 0
}
stack.size = function(){
   return this.length;
}
```