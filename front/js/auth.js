function pushReg(){
    let firstname = $("#firstName").val();
    let lastname = $("#lastName").val();
    let username = $("#userName").val();
    let password = $("#password").val();
    $.ajax({
        url: "/register-data",
        method: "POST",
        data: {"firstname":firstname, "lastname":lastname, "username":username, "password":password}
    }).done(function(data){
        if(Object.keys(data).length == 0){
            window.location.replace("/");
        }
        $(".form-group").find("input").each(function(){
            $(this)[0].classList.remove("error");
        })
        $(".error-text").get(0).innerHTML = "";
        for(let row in data){
            for(let error in data[row]){
                if(error == "passwordShort"){
                    $("#password").get(0).classList.add("error");
                }
                else if(error == "usernameIncorrect"){
                    $("#userName").get(0).classList.add("error");
                }
                else{
                    var element = "#"+error+"";   
                    $(element).get(0).classList.add("error");
                }
                $(".error-text").get(0).innerHTML += "<a>"+ data[row][error] +"</a><br>" 
            }
        }
    });
}

function pushLogin(){
    let username = $("#userName").val();
    let password = $("#password").val();
    $.ajax({
        url: "/login-data",
        method: "POST",
        data: {"username":username, "password":password}
    }).done(function(data){
        if(Object.keys(data).length == 0){
            window.location.replace("/");
        }
        $(".form-group").find("input").each(function(){
            $(this)[0].classList.remove("error");
        })
        $(".error-text").get(0).innerHTML = "";
        for(let row in data){
            for(let error in data[row]){
                if(error == "passwordIncorrect"){
                    $("#password").get(0).classList.add("error");
                }
                if(error == "usernameIncorrect"){
                    $("#userName").get(0).classList.add("error");
                }
                else{
                    var element = "#"+error+"";   
                    $(element).get(0).classList.add("error");
                }
                $(".error-text").get(0).innerHTML += "<a>"+ data[row][error] +"</a><br>" 
            }
        }
    });
}