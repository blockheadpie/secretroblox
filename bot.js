var username = 'ty909rox';
var password = 'voxhall123';
var cL = 39; // How many pages long is ?Category=2 in the catalog? This will need updating every now-and-then.
 
var http = require('http');
var https = require('https');
var zlib = require('zlib');
var fs = require('graceful-fs');
 
var RSec = '';
var stringdump = '';
 
var y = 0;
 
var totalItems = 0;
var totalHats = 0;
var totalGear = 0;
var totalFaces = 0;
var itemsChecked = 0;
 
var NewItems = {}
var RAPs = {};
var items = {};
 
function login() {
    console.log(login)
    var dataJson = JSON.stringify({
        username: username,
        password: password
    });
    var options = {
    hostname: 'roblox.com',
    port: 443,
    path: '/NewLogin',
    method: 'POST',
    headers: {
        'Content-Length': Buffer.byteLength(dataJson),
        'Content-Type': 'application/json'
    }
    };
    var req = https.request(options, function(rsp) {
        rsp.on('error', function(e) {
            console.log('Error!')
            login()
            return;
        })
        rsp.on('data', function() {
            console.log('Data received!')
        })
        rsp.on('end', function() {
            var setcookie = rsp.headers["set-cookie"];
            if (setcookie) {
                for (var p = 0; p < setcookie.length; p++) {
                    if (setcookie[p].charAt(0) == '.') {
                        RSec = setcookie[p].replace(/ *\_[^)]*\_ */g, "");
                        RSec = RSec.substring(0, RSec.indexOf(';'));
                    };
                };
            };
        });
    });
    req.on('error', function(e) {
        console.log('Error with login!');
        login()
        return;
    })
    req.write(dataJson);
    req.end();
}
 
function coreIH(f) {
    console.log(coreIH)
    var dg3 = {
        hostname: 'roblox.com',
        path: '/Trade/InventoryHandler.ashx?token=&filter=' + f + '&userid=1&itemsPerPage=14&page=1',
        headers: {
            'Cookie':RSec,
            'Accept-Encoding':'gzip',
        }
    };
    var raprequ = http.request(dg3, function(rspv) {
        var str3 = [];
        var gunzip3 = zlib.createGunzip();
        rspv.pipe(gunzip3)
        gunzip3.on('error', function(e) {
            console.log('Error on ROBLOX\'s inventory prelims!');
            return;
        })
        gunzip3.on('data', function(chunk3) {
            str3.push(chunk3);
        });
        gunzip3.on('end', function() {
            var newobj5 = Buffer.concat(str3).toString();
            var newobj6 = JSON.parse(newobj5);
            if (f == 0 && newobj6.data) {
                totalHats = newobj6.data.totalNumber;
                totalItems = totalItems + totalHats;
                for (var j = 1; j <= Math.ceil(totalHats / 14); j++) {
                    rapGRAB(f, j)
                }
            } else if (f == 1 && newobj6.data) {
                totalGear = newobj6.data.totalNumber;
                totalItems = totalItems + totalGear;
                for (var k = 1; k <= Math.ceil(totalGear / 14); k++) {
                    rapGRAB(f, k)
                }
            } else if (f == 2 && newobj6.data) {
                totalFaces = newobj6.data.totalNumber;
                totalItems = totalItems + totalFaces;
                for (var l = 1; l <= Math.ceil(totalFaces / 14); l++) {
                    rapGRAB(f, l)
                }
            } else {
                console.log('error')
            };
        });
    });
    raprequ.on('error', function(e) {
        console.log('Error requesting info about ROBLOX\'s inventory!')
        return;
    });
    raprequ.end()
};
function rapGRAB(f, rapPAGE) {
    var options2 = {
        hostname: 'roblox.com',
        path: '/Trade/InventoryHandler.ashx?token=&filter=' + f + '&userid=1&itemsPerPage=14&page=' + rapPAGE,
        headers: {
            'cookie':RSec,
            'Accept-Encoding':'gzip',
        }
    };
    var requ = http.request(options2, function(response) {
        var str2 = [];
        var gunzip2 = zlib.createGunzip();
        response.pipe(gunzip2)
        gunzip2.on('error', function(e) {
            console.log('Error on ROBLOX\'s inventory!');
            return;
        })
        gunzip2.on('data', function(chunk2) {
            str2.push(chunk2);
        });
        gunzip2.on('end', function() {
            var newobj3 = Buffer.concat(str2).toString();
            var newobj4 = JSON.parse(newobj3);
            if (newobj4.data) {
                for (m in newobj4.data.InventoryItems) {
                    if (newobj4.data.InventoryItems[m].AveragePrice != "---") {
                        var RAP = newobj4.data.InventoryItems[m].AveragePrice;
                        var item = newobj4.data.InventoryItems[m].ItemLink.split("=").pop();
                        RAPs[item] = RAP;
                    };
                    itemsChecked++
                };
            };
            if (itemsChecked >= totalItems) {
                for (var c = 1; c < cL+1; c++) {
                    cataGRAB(c);
                };
                return;
            };
        });
    });
    requ.on('error', function(e) {
        console.log('Error requesting ROBLOX\'s inventory!');
        return;
    })
    requ.end();
};
function cataGRAB(page) {
    var dg = {
        hostname: 'search.roblox.com',
        path: '/catalog/json?Category=2&PageNumber=' + page,
        headers: {
            'Accept-Encoding': 'gzip'
            }
    };
    var omagawsh = http.request(dg, function(rspn) {
        var strn = []
        var gunzip = zlib.createGunzip();
        rspn.pipe(gunzip)
        gunzip.on('error', function (e) {
            console.log('Error with catalog data!');
        })
        gunzip.on('data', function (chunk) {
            strn.push(chunk)
        });
        gunzip.on('end', function() {
            var newobj = Buffer.concat(strn).toString();
            var newobj2 = JSON.parse(newobj);
            for (i in newobj2) {
                if (newobj2[i].BestPrice) {
                    var id = newobj2[i].AssetId;
                    var price = newobj2[i].BestPrice;
                    var name = newobj2[i].Name;
                    items[id] = new Array(price.replace(/\,/g,""), name);
                }
            };
            y++
            if (y >= cL) {
                compa(RAPs, items)
            };
        });
    })
    omagawsh.on('error', function(e) {
        console.log('Error requesting the ROBLOX catalog!');
        return;
    })
    omagawsh.end();
};
function compa(e, f) {
    console.log(compa)
    function isEmpty(damnobject) {
        for (var key in damnobject) {
            if (damnobject.hasOwnProperty(key)){
                return false;
            }
        }
        return true;
    }
    if (isEmpty(NewItems)) {
        var processed = 0;
        var localDump = [];
        Object.keys(e).forEach(function(n){
            if (f[n]) {
                NewItems[n] = {"Name":f[n][1], "RAP":parseInt(e[n],10), "LowestPrice":parseInt(f[n][0])}
                if (NewItems[n]["RAP"] > NewItems[n]["LowestPrice"]) {
                    NewItems[n]["PercentOff"] = Math.round(((e[n] - f[n][0]) / e[n]) * 100)
                    localDump.push(NewItems[n])
                };
                processed++;
            };
        });
        if (processed === Object.keys(NewItems).length) {
            sortIt();
        };
        function sortIt() {
            demSort = localDump.sort(function(a,b) {
                return a["PercentOff"] - b["PercentOff"];
            });
            for (dat in demSort) {
                console.log(demSort[dat]["PercentOff"] + "% off. " + demSort[dat]["Name"] + " (RAP: " + demSort[dat]["RAP"] + ") is selling for " + demSort[dat]["LowestPrice"])
            }
        }
    } else {
        var processedn = 0;
        var processedm = 0;
        var SecList = {};
        var newDump = [];
        Object.keys(e).forEach(function(cur){
            if (f[cur]) {
                SecList[cur] = {"Name":f[cur][1], "RAP":parseInt(e[cur],10), "LowestPrice":parseInt(f[cur][0])}
                if (SecList[cur]["RAP"] > SecList[cur]["LowestPrice"]) {
                    SecList[cur]["PercentOff"] = Math.round(((e[cur] - f[cur][0]) / e[cur]) * 100)
                };
            };
            processedn++
        });
        if (processedn => Object.keys(SecList).length) {
            sortEt();
        };
        function sortEt() {
            Object.keys(SecList).forEach(function(m) {
                if ((NewItems[m]) && ((SecList[m]["LowestPrice"] != NewItems[m]["LowestPrice"]) || (SecList[m]["RAP"] != NewItems[m]["RAP"])) && (SecList[m]["PercentOff"])) {
                    newDump.push(SecList[m])
                };
                processedm++
            });
        }
        if (processedm => Object.keys(SecList).length) {
            NewItems = SecList
            daNS = newDump.sort(function(a,b) {
                return a["PercentOff"] - b["PercentOff"];
            });
            for (dese in daNS) {
                console.log("NEW: " + daNS[dese]["PercentOff"] + "% off. " + daNS[dese]["Name"] + " (RAP: " + daNS[dese]["RAP"] + ") is selling for " + daNS[dese]["LowestPrice"])
            }
        }
    }
}
login()
setTimeout(function() {
    setInterval(function() {
            y = 0;
            coreIH(0);
            coreIH(1);
            coreIH(2);
    }, 3500);
}, 5000);
