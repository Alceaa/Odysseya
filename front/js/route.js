$(document).ready(function () {
    $('#region-select').select2();
    $('#range-input').val(1);
    $('#count-number').val(1);

    $('#region-select').on("change", function(){
        if($(this).val() != ""){
            var region = $('#region-select option:selected').text();
            $.ajax({
                url: "region_count",
                method: "POST",
                data: {"region": region}
            }).done(function(data){
                $(".count-lebel").text(region + " имеет слудеющее количество объектов культурного наследия: " + data[0]["count"]);
                $('#range-input').attr('min', 0);
                $('#range-input').attr('max', data[0]["count"]);
                document.querySelectorAll(".step1").forEach(element => {
                    element.classList.remove("step-highlight");
                });
                document.querySelectorAll(".step2").forEach(element => {
                    element.classList.add("step-highlight");
                    element.style.display = "flex";
                });
                $('.step2-button').css("display", "flex");
                $('.step2-container').css("display", "flex");
            });
        }else{
            $(".count-lebel").text("");
        } 
    })
    $('#range-input').on("input", function(){
        $('#count-number').val($(this).val());
    })
    $('#count-number').on("input", function(){
        $('#range-input').val($(this).val());
    })
});
window.map = null;
function calc(){
    $(".form-container")[0].style.animation = "load 2s forwards";
    $(".step-name").css("display", "none");
    $(".map").css("display", "block");
    var region = $('#region-select option:selected').text();
    var count = $('#range-input').val();
    $.ajax({
        url: "calc",
        method: "POST",
        async: false,
        data: {"region" : region, "count" : count}
    }).done(function(data){
        ymaps3.ready.then(() => {
            if (map) {
                map.destroy();
                map = null;
            }
            initMap(JSON.parse(data));
        });
    });
}


//map
async function initMap(path) {
    await ymaps3.ready;

    

    const center = [path[Math.floor(Object.keys(path).length / 2)]["x"], path[Math.floor(Object.keys(path).length / 2)]["y"]];

    const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer} = ymaps3;
    
    map = new YMap(
        document.getElementById('app'),
        {
            location: {
                center: center,
                zoom: 6
            }
        }
    );
    map.addChild(new YMapDefaultSchemeLayer());
    map.addChild(new YMapDefaultFeaturesLayer());

    for(let i = 0; i < Object.keys(path).length; i++){
        const markerElement = document.createElement('div');
        markerElement.innerHTML = '<img src="img/marker.png" class="marker">';
        const marker = new ymaps3.YMapMarker({
            markerSource: 'markerSource',
            coordinates: [path[i]["x"], path[i]["y"]],
            draggable: false,
            mapFollowsOnDrag: false,
            popup: {content: 'Popup on the default marker', position: 'left'}
            },
            markerElement
        );
        
        map.addChild(marker);
    }
    const coordinates = [];
    for(let j = 0; j < Object.keys(path).length - 1; j++){
        coordinates.push([path[j]["x"], path[j]["y"]],
        [path[j+1]["x"], path[j+1]["y"]])
    }
    const lineStringFeature = new ymaps3.YMapFeature({
        id: 'line',
        featureSource: 'featureSource',
        geometry: {
            type: 'LineString',
            coordinates: coordinates,
        },
        style: {
            stroke: [{width: 12, color: 'rgb(14, 194, 219)'}]
        }
        });
        
        map.addChild(lineStringFeature);
}