$(function(){
  DNode.connect(function (remote) {
    $('input').live('change keyup', function(){
      var expenses = $('input').map(function(){
            return $(this).val();
          });
      var total = 0;
      for(var i=expenses.length; i--;){
        total = expenses[i];
      }
      $('#total').text(total);
      remote.optimize(expenses, function(naive, opt){
        $('#naive00').text(naive[0][0]);
        $('#naive01').text(naive[0][1]);
        $('#naive02').text(naive[0][2]);
        $('#naive03').text(naive[0][3]);
        $('#naive10').text(naive[1][0]);
        $('#naive11').text(naive[1][1]);
        $('#naive12').text(naive[1][2]);
        $('#naive13').text(naive[1][3]);
        $('#naive20').text(naive[2][0]);
        $('#naive21').text(naive[2][1]);
        $('#naive22').text(naive[2][2]);
        $('#naive23').text(naive[2][3]);
        $('#naive30').text(naive[3][0]);
        $('#naive31').text(naive[3][1]);
        $('#naive32').text(naive[3][2]);
        $('#naive33').text(naive[3][3]);
        $('#opt00').text(opt[0][0]);
        $('#opt01').text(opt[0][1]);
        $('#opt02').text(opt[0][2]);
        $('#opt03').text(opt[0][3]);
        $('#opt10').text(opt[1][0]);
        $('#opt11').text(opt[1][1]);
        $('#opt12').text(opt[1][2]);
        $('#opt13').text(opt[1][3]);
        $('#opt20').text(opt[2][0]);
        $('#opt21').text(opt[2][1]);
        $('#opt22').text(opt[2][2]);
        $('#opt23').text(opt[2][3]);
        $('#opt30').text(opt[3][0]);
        $('#opt31').text(opt[3][1]);
        $('#opt32').text(opt[3][2]);
        $('#opt33').text(opt[3][3]);
      });
    });
  });
});
