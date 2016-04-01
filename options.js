// Saves options to chrome.storage.local.
function handleOptions() {
  var entryField = document.getElementById('user-key');
  chrome.storage.local.set({'rosetteKey': entryField.value}, function() {
  	// Notify user settings were saved
  	document.getElementById('save-message').style.visibility = "visible";
    document.getElementById('save-message').innerHTML = "Settings successfully updated.";
  });
}

document.getElementById('save').addEventListener('click', handleOptions);