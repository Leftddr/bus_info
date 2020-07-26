
document.addEventListener('DOMContentLoaded', function() {

   var route_url = "http://openapi.gbis.go.kr/ws/rest/busrouteservice";
   var route_key = "input your key";
   var bus_url = "http://openapi.gbis.go.kr/ws/rest/buslocationservice";
   var target_url = "http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll";
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
                    get_target(list_for_route_id[i]);
                });
            }
       })
   }

   function get_info(route_id){
        getInfo(route_id).then(function(data){
            var stationId = data.getElementsByTagName("stationId");
            var remainSeatCnt = data.getElementsByTagName("remainSeatCnt");
            var result = "";
            for(let i = 0 ; i < stationId.length ; i++){
                result += '<div id = result_info' + i + ' style = "board:1px solid black">';
                result += '<p style = "font-size:10px">' + '정류소 id : ' + stationId[i].childNodes[0].nodeValue + '</p>';
                if(remainSeatCnt[i].childNodes[0].nodeValue == -1)
                    result += '<p style = "font-size:10px; color:red">' + '남은 좌석 : 정보 없음' + '</p>';
                else
                    result += '<p style = "font-size:10px; color:red">' + '남은 좌석 : ' + remainSeatCnt[i].childNodes[0].nodeValue + '</p>';
                result += '</div>'; 
            }
            document.querySelector("#result").innerHTML = "";
            document.querySelector("#result_info").innerHTML = result;
        })
   }

   function getInfo(route_id){
       return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + route_key;
            queryParams += '&' + encodeURIComponent('serviceKey') + '=' + encodeURIComponent(1234567890);
            queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent(route_id);
            xhr.open('GET', bus_url + queryParams);
            xhr.onreadystatechange = function(){
                if(this.readyState == 4){
                    resolve(xhr.responseXML);
                }
            }
            xhr.send('');
       });
   }

   function get_target(route_id){
       getTarget(route_id).then(function(data){
            alert(data.innerHTML);
            var stNm = data.getElementsByTagName("stNm");
            var result = "";
            for(let i = 0 ; i < stNm.length ; i++){
                result += '<p>' + stNm[i].childNodes[0].nodeValue + '</p>';
            }
            document.querySelector("#result").innerHTML = result;
       })
   }

   function getTarget(route_id){
       return new Promise(function(resolve, reject){
           var xhr = new XMLHttpRequest();
           var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + route_key;
           queryParams += '&' + encodeURIComponent('busRouteId') + '=' + encodeURIComponent(route_id);
           xhr.open('GET', target_url + queryParams);
           xhr.onreadystatechange = function(){
               if(this.readyState == 4){
                   resolve(xhr.responseXML);
               }
           }
           xhr.send('');
       })
   }

   document.querySelector("#img").addEventListener('click', function(){
       var capturing = chrome.tabs.captureVisibleTab(null, {}, function(dataUri){
          var result = '<div><img src = "' + dataUri + '"width = "100%" height = "100%"></div>';
          document.querySelector("#result").innerHTML = result;
       })
   })

   document.querySelector("#btn").addEventListener('click', function(){
        processing();
   });
});