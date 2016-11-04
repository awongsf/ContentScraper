/* CONTENT SCRAPER */

var fs = require("fs");

// Check for folder called 'data'. If it doesn't exist, create the folder.
if (fs.existsSync("./data") === false) {
	fs.mkdirSync("./data");
}

/*

Create a scraper.js file. This should be the file that runs every day.

The scraper should create a folder called data, if a folder called data doesn't already exist (it should check for the folder).

The information from the site you scrape should be stored in a CSV file named after today's date: 2016-01-29.csv.

Use a third party npm package to scrape content from the site. As part of this assignment, you'll need to explain why you chose this package.

The scraper should be able to visit the website http://shirts4mike.com and follow links to all t-shirts.

The scraper should get the price, title, url and image url from the product page and save it in the CSV.

Use a third party npm package to create an CSV file. As part of this assignment, you’ll need to explain why you chose this package.

The column headers should be in this order: Title, Price, ImageURL, URL and Time. ‘Time’ should be the time the scrape happened. 
The columns must be in order (if we were really populating a database, the columns would need to be in order correctly populate the database).

If the site is down, an error message describing the issue should appear in the console. You can test your error by disabling the wifi on your computer.

If the data file for today’s date already exists, your program should overwrite the file.

*/