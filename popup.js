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

    // Load translations
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {method: "getSelectedText"}, function(response) { // send message to be received by content.js
            setTimeout(function() {
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

                            /////////////////////////////////////////
                            // Make XMLHttpRequests to Rosette API //
                            /////////////////////////////////////////
                            var url = "https://api.rosette.com/rest/v1/name-translation";

                            // Languages currently available for Rosette API
                            var languages = {
                                "ara": "Arabic", 
                                "zho": "Chinese", 
                                "rus": "Russian", 
                                "eng": "English", 
                                "kor": "Korean"
                            };

                            // Languages the user wants to translate
                            var selected = readCheckboxes();

                            // Create JSON inputs to send to Rosette API
                            var inputs = [];
                            var x = 0;
                            for (key in selected) {
                                inputs[x] = "{\"name\": \"" + response.data + "\", \"targetLanguage\": \"" + selected[key] + "\"}";
                                x++;
                            }

                            // Create a new XMLHttpRequest for each language to be translated
                            var requests = [];
                            for (var key in selected) {

                                var xhr = new XMLHttpRequest();
                                xhr.open("POST", url, true);
                                xhr.setRequestHeader("X-RosetteAPI-Key", result.rosetteKey);
                                xhr.setRequestHeader("Accept", "application/json");
                                xhr.setRequestHeader("Content-Type", "application/json");
                                xhr.errCaught = false;

                                requests.push(xhr);
                            }

                            var i = 0;
                            for (var key in selected) {
                                // Set the onreadystatechange function of each XHR to load the translation to the extension's popup window
                                requests[i].onreadystatechange = function() {
                                    if (this.readyState == 4 && this.status == 200) {
                                        var JSONresponse = JSON.parse(this.responseText);
                                        console.log(JSONresponse);
                                        document.getElementById('status').innerHTML = document.getElementById('status').innerHTML +
                                            languages[JSONresponse.targetLanguage] + " Translation: <b>" + JSONresponse.translation + "</b><br/>";
                                    } else if (this.status == 415) { // catch errors when translation is not supported by Rosette API; often applies to identity translations, e.g. English -> English
                                        if (this.errCaught == false) {
                                            document.getElementById('status').innerHTML = document.getElementById('status').innerHTML +
                                                "Sorry, this translation not supported<br/>";
                                        }
                                        this.errCaught = true;
                                    }
                                }
                                
                                // Have the completion of each request trigger the sending of the next one
                                // This prevents Rosette API error 429 (Too Many Requests) by only ever letting the extension send one request at a time
                                // The onload method is called when the XMLHttpRequest receives any response, even if that response is another
                                // Rosette API error, such as 415 (Unsupported Language)
                                requests[i].onload = function() {
                                    if (requests.indexOf(this) < requests.length - 1) { // Don't let the last request trigger a request that doesn't exist
                                        var input = inputs[requests.indexOf(this) + 1];
                                        requests[requests.indexOf(this) + 1].send(input);
                                    }
                                }
                                
                                i++;
                            }

                            // Start the chain reaction of request-sending
                            requests[0].send(inputs[0]);

                        }
                    });
                }
            }, 100);
        });
    });
});

// NOTE: The content_fb.js file in the chrome-ext-Sentiment repo contains the
// most elegant structure for sending non-concurrent XMLHttpRequests (to avoid 429 errors)
// out of all the Chrome extension examples.
