$(document).ready(function() {
    var urls = ["../img/main1.png", "../img/main2.png", "../img/main3.png"];
    var index = 1;

    $('body').css('background', 'linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),url("' + urls[0] + '") no-repeat center center fixed');
    setInterval(function() {
        $('body').css('background', 'linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),url("' + urls[index] + '") no-repeat center center fixed');
        index == urls.length-1 ? index = 0 : index++;
        }, 7000);
});