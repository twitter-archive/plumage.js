define([], function() {
    module("Core Tests");

    test("Test core methods", function(){
        expect(2);

        equal( 1, 1, "A trivial test");
        ok( true, "Another trivial test");
    });
});