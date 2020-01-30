// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.nytimes.com/section/world/").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);
        // For each element with a "title" class
        $("h2").each(function (i, element) {
            // Save the text and href of each link enclosed in the current element
            var title = $(element).children("a").text();
            var link = $(element).children("a").attr("href");

            // If this found element had both a title and a link
            if (title && link) {
                // Insert the data in the scrapedData db
                db.scrapedData.insert({
                    title: title,
                    link: link
                },
                    function (err, inserted) {
                        if (err) {
                            // Log the error if one is encountered during the query
                            console.log(err);
                        }
                        else {
                            // Otherwise, log the inserted data
                            console.log(inserted);
                        }
                    });
            }
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});


// =================

// Parses our HTML and helps us find elements
// var cheerio = require("cheerio");
// // Makes HTTP request for HTML page
// var axios = require("axios");

// // First, tell the console what server.js is doing
// console.log("\n***********************************\n" +
//     "Grabbing every thread name and link\n" +
//     "from reddit's webdev board:" +
//     "\n***********************************\n");

// // Making a request via axios for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
// axios.get("https://n").then(function (response) {

//     // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    // var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
//     var results = [];

//     // With cheerio, find each p-tag with the "title" class
//     // (i: iterator. element: the current element)
//     $("h2").each(function (i, element) {

//         // Save the text of the element in a "title" variable
//         var title = $(element).text();

//         // In the currently selected element, look at its child elements (i.e., its a-tags),
//         // then save the values for any "href" attributes that the child elements may have
//         var link = $(element).children().attr("href");

//         // Save these results in an object that we'll push into the results array we defined earlier
//         results.push({
//             title: title,
//             link: link
//         });
//     });

//     // Log the results once you've looped through each of the elements found with cheerio
//     console.log(results);
// });
