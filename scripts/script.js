// footer year variable
var d = new Date();
  var n = d.getFullYear();
  document.getElementById("copyright").innerHTML = "&copy; Copyright " + n + ", Alma Caribe, LLC";

// fade when scrolling
  $(window).scroll(function(){
    $("#jumba").css("opacity", 1 - $(window).scrollTop() / 250);
  });
