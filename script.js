
document.addEventListener('DOMContentLoaded', function() {

   var route_url = "http://openapi.gbis.go.kr/ws/rest/busrouteservice";
   var route_key = "";
   var bus_url = "http://openapi.gbis.go.kr/ws/rest/buslocationservice";
   let list_for_route_id = [];

   function getData(){
       return new Promise(function(resolve, reject){
            var bus_num = document.querySelector("#bus").value;
            var xhr = new XMLHttpRequest();
            var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + route_key;
            queryParams += '&' + encodeURIComponent('keyword') + '=' + encodeURIComponent(bus_num);
            xhr.open('GET', route_url + queryParams);
            xhr.onreadystatechange = function(){
                if(this.readyState == 4){
                    resolve(xhr.responseXML);
                }
            }
            xhr.send('');
       });
   }

   function processing(){
       getData().then(function(data){
        document.querySelector("#result").innerHTML = "";
           var route_name = data.getElementsByTagName("regionName");
           var route_id = data.getElementsByTagName("routeId");
           var result = "";
           for(let i = 0 ; i < route_name.length ; i++){
                result += '<div id = result' + i + ' style = "border:1px solid black">';
                result += '<p style = "font-size:10px">' + route_name[i].childNodes[0].nodeValue + '</p>';
                result += '</div>';  
                list_for_route_id.push(route_id[i].childNodes[0].nodeValue);
           }
           document.querySelector("#result").innerHTML = result;

           for(let i = 0 ; i < route_name.length ; i++){
                document.querySelector("#result" + i).addEventListener('click', function(){
                    get_info(list_for_route_id[i]);
                });
            }
       })
   }

   function get_info(route_id){
        getInfo(route_id).then(function(data){
            
        })
   }

   function getInfo(route_id){
       return new Promise(function(resolve, reject){
           alert(route_id);
            var xhr = new XMLHttpRequest();
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + route_key;
            queryParams += '&' + encodeURIComponent('serviceKey') + '=' + encodeURIComponent(1234567890);
            queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent(route_id);
            xhr.open('GET', bus_url + queryParams);
            xhr.onreadystatechange = function(){
                if(this.readyState == 4){
                    alert(this.responseText);
                    resolve(xhr.responseXML);
                }
            }
            xhr.send('');
       });
   }

   document.querySelector("#btn").addEventListener('click', function(){
        processing();
   });
});