
var Api = require('rosette-api')
// Returns a list of the values of the checked checkboxes
function readCheckboxes() {
    var selectors = document.getElementById("lang-selectors").elements;
    var selected = [];
    for (var i = 0; i < selectors.length; i++) {
        if (selectors[i].checked) {
            selected.push(selectors[i].value);
        }
    }
    return selected;
}

// Save list of checked checkboxes in local storage
function cacheCheckboxes() {
    chrome.storage.local.set({'langSelectors': readCheckboxes()});
}

document.addEventListener('DOMContentLoaded', function() {

    // Check the boxes that were checked last time; otherwise, check all the boxes
    chrome.storage.local.get('langSelectors', function (result) {
        var boxes = document.getElementById("lang-selectors").elements;
        if (result['langSelectors'] == null) {
            for (var i = 0; i < boxes.length; i++) {
                boxes[i].checked = true;
            }
        } else {
            for (var i = 0; i < boxes.length; i++) {
                if (result['langSelectors'].indexOf(boxes[i].value) > -1) {
                    boxes[i].checked = true;
                }
            }
        }
    });

    // Tell checkboxes to cache themselves and reload the popup when clicked
    document.getElementById("lang-selectors").addEventListener("click", function() {
        cacheCheckboxes();
        location.reload();
    });

// recursive request function
function request(apiSent, endpoint, lang, name, counter){
    if(counter < 1){
        return counter;
    }
      var languages = {
                          "eng": "English",
                          "ara": "Arabic",
                          "kor": "Korean",
                          "rus": "Russian",
                          "zho": "Chinese"
                      };

      apiSent.parameters.name = name;
      apiSent.parameters.targetLanguage = lang[0];
      apiSent.rosette(endpoint, function(err, res){
            if(err){
                if(err["message"]){
                    console.log(err);
                }
                //if(counter < 1){
                 //   return err;
                //} else {
                    lang.shift();
                    counter = counter - 1;
                    return request(apiSent, endpoint, lang, name, counter);
                //}

            } else {
                //if(counter < 1){
                   // return res;
                //} else {
                    lang.shift()
                    counter = counter - 1;
                    document.getElementById('status').innerHTML = document.getElementById('status').innerHTML +
                                                languages[res.targetLanguage] + " Translation: <b>" + res.translation + "</b><br/>";
                    return request(apiSent, endpoint, lang, name, counter);
                //}
            }
     });

}

    // Load translations
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {method: "getSelectedText"}, function(response) { // send message to be received by content.js
                                if (response == undefined || response.data.trim() == "") { // catches error when user selects no text
                    document.getElementById('status').innerHTML = "Try highlighting a name in your text";
                    document.getElementById('status').style.backgroundColor = "#FFFF99";

                } else if (response.method=="getSelectedText") {

                    chrome.storage.local.get('rosetteKey', function (result) { // check for key entered

                        if (result.rosetteKey == null) {
                            document.getElementById('status').innerHTML = "Please enter an API key";
                            document.getElementsByClassName("bg-info")[0].style.backgroundColor = "#FFCCCC";
                        } else {
                            // Show name highlighted by user
                            document.getElementById('status').innerHTML = "Input Name: " + response.data + "<br/><br/>";

                            var url = "https://api.rosette.com/rest/v1/name-translation";
                            var apiSent = new Api(result.rosetteKey);
                            var endpoint = "nameTranslation";
                            var appHeader = [];
                            appHeader[0] = "X-RosetteAPI-App";
                            appHeader[1] = "chrome-extension-name-translation";
                            apiSent.parameters.customHeaders = [appHeader];

                            // Languages the user wants to translate
                            var selected = readCheckboxes();
                            var counter = selected.length;
                            console.log(request(apiSent, endpoint, selected, response.data, selected.length))

                        }
                    });
                }

        });
    });
});

// NOTE: The content_fb.js file in the chrome-ext-Sentiment repo contains the
// most elegant structure for sending non-concurrent XMLHttpRequests (to avoid 429 errors)
// out of all the Chrome extension examples.
