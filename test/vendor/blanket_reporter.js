define([],function lcov_reporter(){
    //takes the option: toHTML {boolean}

    var body = document.body;

    var appendData = function (filename,data) {

        var str="";
        str += 'SF:' + filename + '\n';

        data.source.forEach(function(line, num) {
          // increase the line number, as JS arrays are zero-based
          num++;

          if (data[num] !== undefined) {
            str += 'DA:' + num + ',' + data[num] + '\n';
          }
       });

       str += 'end_of_record\n';
       console.log(str);
    };

    return function(coverageData,options){
      for (var filename in coverageData.files) {
        var data = coverageData.files[filename];
        appendData(filename,data);
      }
    };
});