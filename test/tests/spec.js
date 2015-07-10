
////////////////////////////////////////////////////////////////////////
//////////    最前面的是与绑定没关的测试   /////////////////////////////
////////////////////////////////////////////////////////////////////////

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}

describe("util模块", function () {
    //http://ued.qunar.com/mobile/qapp/document/
    var util = QApp.util
    describe('util.is', function () {
        it("async", function (done) {
          util(util.is("xxx", "String")).to.be(true)
        });
    });
})

