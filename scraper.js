/* CONTENT SCRAPER */

/* Node Modules */
var fs = require("fs");
var http = require("http");
var cheerio = require("cheerio");
var json2csv = require("json2csv");

/* Global Variables */
var homePageURL = "http://www.shirts4mike.com/";
var productPageLinks = [];
var columnHeaders = ["Title", "Price", "ImageURL", "URL", "Time"];
var scrapeData = [];

// Function that gets the current time.
function getTime() {

    var time = new Date();

    var hour = time.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = time.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = time.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;

}

// Function that gets the current date.
function getDate() {

	var date = new Date();

	var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day;

}

// Using File System module, check for a folder called 'data'. If it doesn't exist, create the folder.
if (fs.existsSync("./data") === false) {

	fs.mkdirSync("./data");

}

// 
http.get(homePageURL, (response) => {

	if (response.statusCode !== 200) {

		console.log("Error! The response status code is " + response.statusCode + ". Cannot access the home page!");	

	} else if (response.statusCode == 200) {
				
		response.on("data", (chunk) => {

    		var $ = cheerio.load(chunk);

    		$("a[href*='.php']").each(function(){

    			var url = $(this).attr("href");

    			if (url.includes("?id=")) {

    				productPageLinks.push(url);

    				http.get(homePageURL + url, (response) => {
									
						var requestURL = homePageURL + url;

						if (response.statusCode !== 200) {

							console.log("Error! The response status code is " + response.statusCode + ". The site you visited was http://www.shirts4mike.com/" + url);

						} else if (response.statusCode == 200) {

							response.on("data", (chunk) => {

								var $ = cheerio.load(chunk);

								var Title = $("title").text();
								var Price = $(".price").text();
								var ImageURL = $(".shirt-picture > span > img").attr("src");
								var Time = getTime();
								var shirtData = {};

								shirtData.Title = Title;
								shirtData.Price = Price;
								shirtData.ImageURL = homePageURL + ImageURL;
								shirtData.URL = requestURL;
								shirtData.Time = Time;
								scrapeData.push(shirtData);

								var csv = json2csv({ data: scrapeData, fields: columnHeaders });
								 
								fs.writeFile("./data/" + getDate() + ".csv", csv, function(error) {
								  if (error) throw error;
								  console.log("file saved");
								});
							});
						}
					});

    			} else {

    				http.get(homePageURL + url, (response) => {

    					if (response.statusCode !== 200) {

    						console.log("Error! The response status code is " + response.statusCode + ".");

    					} else if (response.statusCode == 200) {

    						response.on("data", (chunk) => {

    							var $ = cheerio.load(chunk);

    							$("a[href*='.php']").each(function(){

    								var url = $(this).attr("href");

					    			if (url.includes("?id=") && productPageLinks.indexOf(url) === -1) {
					    				
					    				productPageLinks.push(url);

					    				var requestURL = homePageURL + url;

					    				http.get(requestURL, (response) => {

											if (response.statusCode !== 200) {

												console.log("Error! The response status code is " + response.statusCode + ". The site you visited was http://www.shirts4mike.com/" + url);

											} else if (response.statusCode == 200) {

												response.on("data", (chunk) => {

													var $ = cheerio.load(chunk);

													var Title = $("title").text();
													var Price = $(".price").text();
													var ImageURL = $(".shirt-picture > span > img").attr("src");
													var Time = getTime();
													var shirtData = {};

													shirtData.Title = Title;
													shirtData.Price = Price;
													shirtData.ImageURL = homePageURL + ImageURL;
													shirtData.URL = requestURL;
													shirtData.Time = Time;
													scrapeData.push(shirtData);

													var csv = json2csv({ data: scrapeData, fields: columnHeaders });
													 
													fs.writeFile("./data/" + getDate() + ".csv", csv, function(error) {
													  if (error) throw error;
													  console.log("file saved");
													});
												});
											}
										});
					    			}

					    		});
						    		
    						});

    					}

    				});

    			}

    		});
    		
  		});
	}
});