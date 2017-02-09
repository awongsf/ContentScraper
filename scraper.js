/* CONTENT SCRAPER */

// A web scraper that visits shirts4mike.com, follows links to all
// t-shirts, and saves the product data in a CSV file.

/* Node Modules */
var fs = require("fs");
var http = require("http");
var cheerio = require("cheerio");
// I chose to use cheerio to scrape content from the site because its selector implementation is 
// identical to jQuery, which I am familiar with. It has by far the most number of downloads, along with builds tests 
// are currently passing. Though the version is only 0.22.0, there has been 58 releases.   
var json2csv = require("json2csv");
// I chose to use json2csv to create a CSV file that stores the product data because it is also a popular
// and active package with build tests that are currently passing. It is well documented, which made for a
// more enjoyable learning experience.

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

// Function that handles errors and logs them to a file.
var logError = function(error, url) {
	
	console.log("There was an error trying to reach " + url);
	console.log("Error message: " + error);
	var errorData = "\n" + getDate() + "-" + getTime() + "-" + error;
	fs.appendFile("scraper-error.log", errorData, (err) => {
	  if (err) throw err;
	  console.log('The error has been recorded in scraper-error.log');
	});
};

// Using File System module, check for a folder called 'data'. If it doesn't exist, create the folder.
if (fs.existsSync("./data") === false) {

	fs.mkdirSync("./data");

}

// Using HTTP module, make a GET request to website homepage
http.get(homePageURL, (response) => {

	// If the response is not successful, log an error message to the console and an error log.
	if (response.statusCode !== 200) {

		logError(response.statusMessage, homePageURL);

	// If the response is successful, pass the webpage's HTML to cheerio.
	} else if (response.statusCode == 200) {

		response.on("data", (chunk) => {

    		var $ = cheerio.load(chunk);

    		// Using cheerio, iterate over all links that contain '.php'
    		$("a[href*='.php']").each(function(){

    			var url = $(this).attr("href");

    			// If the link contains '?id=' it is a product page, so make a GET request to the link and get product info
    			if (url.includes("?id=")) {

    				// Add all product page links found on homepage to an array
    				productPageLinks.push(url);

    				http.get(homePageURL + url, (response) => {
									
						var requestURL = homePageURL + url;

						// If the response is not successful, log an error message to the console and an error log.
						if (response.statusCode !== 200) {

							logError(response.statusMessage, requestURL);

						} else if (response.statusCode == 200) {

							response.on("data", (chunk) => {

								// Pass product page's HTML to cheerio.
								var $ = cheerio.load(chunk);

								// Get the title, price, image URL, and current time
								// Store them into object named shirtData
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

								// Add shirtData to globally accessible array
								scrapeData.push(shirtData);
							});
						}
					});

    			} else {

    				// If the link doesn't contain '?id=', make a GET request to that link
    				http.get(homePageURL + url, (response) => {

    					// If the response is not successful, log an error message to the console and an error log.
    					if (response.statusCode !== 200) {

    						logError(response.statusMessage, homePageURL + url);

    					} else if (response.statusCode == 200) {

    						// If the response is successful, pass the webpage's HTML to cheerio.
    						response.on("data", (chunk) => {

    							var $ = cheerio.load(chunk);

    							// Using cheerio, iterate over all links that contain '.php'
    							$("a[href*='.php']").each(function(){

    								var url = $(this).attr("href");

    								// If the link includes '?id=' and doesn't already exist in productPageLinks array,
    								// make a GET request to that link and get product info
					    			if (url.includes("?id=") && productPageLinks.indexOf(url) === -1) {
					    				
					    				productPageLinks.push(url);

					    				var requestURL = homePageURL + url;

					    				http.get(requestURL, (response) => {

					    					// If the response is not successful, log an error message to the console and an error log.
											if (response.statusCode !== 200) {

												logError(response.statusMessage, requestURL);

											} else if (response.statusCode == 200) {

												response.on("data", (chunk) => {

													// Pass product page's HTML to cheerio.
													var $ = cheerio.load(chunk);

													// Get the title, price, image URL, and current time
													// Store them into object named shirtData
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

													// Add shirtData to globally accessible array
													scrapeData.push(shirtData);

													// Use json2csv to save scrapeData in a csv file
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
// If there is a problem with the initial GET request to website hompage,
// log an error message to the console and to an error log.
}).on('error', (e) => {
	console.log('There was a problem with the initial GET request to shirts4mike homepage.');
	var errorData = "\n" + getDate() + "-" + getTime() + "-" + e.message;
	fs.appendFile("scraper-error.log", errorData, (err) => {
	  if (err) throw err;
	  console.log('The error has been recorded in scraper-error.log');
	});
});