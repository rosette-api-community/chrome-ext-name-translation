#chrome-ext-name-translation

**Chrome extension utilizing the Rosette API to translate names on webpages among different languages.**

##Installation

Check out this repo to your machine.

Visit chrome://extensions in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  The menu's icon is three horizontal bars and select Extensions under the Tools menu to get to the same place).

Ensure that the Developer mode checkbox in the top right-hand corner is checked.

Click Load unpacked extension… to pop up a file-selection dialog.

Navigate to the directory in which your extension files live (the directory into which you've cloned this git repo), and select it.

Alternatively, you can drag and drop the directory where your extension files live onto chrome://extensions in your browser to load it.

##How to Use

Click on the Rosette icon in your Chrome extensions bar at the top right. Click `Enter API Key` to enter your Rosette API Key and save it.

Make sure the extension is enabled, and go to any site, highlight a name, and see the translations.

###About this extension

The Rosette Name Translation Chrome extension is part of a series of Chrome extensions designed to demonstrate the capabilities of the Rosette API by Basis Technology. All extensions require a Rosette API Key to function in Chrome. If you don't have one, you can get one [here](https://developer.rosette.com/signup). The Name Translation extension's sister extensions are the Rosette Entity Extraction and Rosette Sentiment Analysis extensions. Check them out in their Github repos.

The Name Translation extension allows the user to highlight a name (or other word) in the text of a webpage and uses the Rosette API's Name Translation feature to translate that name into other languages, including Arabic (Ara), Chinese (Zho), Russian (Rus), English (Eng), and Korean (Kor). The user can also select which translations they'd like to see with the checkboxes along the bottom of the popup.


###Why isn't this extension working?

This extension is a demo. As such, there are several reasons why it may not work, or at least may appear not to work. Here are some common ones.

* Incorrect Rosette Developer Key stored in the extension. If you haven't entered a key in the "Enter API Key" part of the popup, the extension will probably ask you for one. However, if you enter an invalid key (or even hit "Save" while the key field is empty), the extension will not tell you what's wrong. Try entering your key again. Beware, the key is deleted from local storage when the extension is removed from Chrome.

* A particular website doesn't like being crawled by bots. The combination of page-reading JavaScript with the Rosette API can look like a bot to some pages, so that website may refuse to be read as whole page. Sometimes it will work if you highlight text in the page.

* If it doesn't look like it's working, try refreshing the page or clicking on the extension again. It may sometimes come up with different results.

Best of luck! Enjoy this taste of the Rosette API!
