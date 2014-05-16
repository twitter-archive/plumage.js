function recursiveLinkify(element, match, replacer) {

    // For each content node in the given element,
    $.each(
        element.contents(),
        function(index, element) {
            element = $(element);

            // Replace it's content if it's a text node
            if (element.get(0).nodeType == document.TEXT_NODE) {
                element.after($("<div />").text(element.text()).html().replace(match, replacer)).remove();
            }

            // Or recurse down into it if it's not an anchor or a button
            else if (element.prop("tagName") != "A" && element.prop("tagName") != "BUTTON") {
                recursiveLinkify(element, match, replacer);
            }
        }
    );
}

(function($) {
    $.fn.linkify = function(opts) {
        return this.each(function() {

            // Regex from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
            var matchURLs = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/;
            var replaceURLs = function(str) {
                return "<a href='"+(str.indexOf("://") === -1 ? "http://" : "")+str+"'>"+str+"</a>";
            }
            recursiveLinkify($(this), matchURLs, replaceURLs);

            // Regex from http://www.regular-expressions.info/email.html
            var matchEmails = /\b[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ig;
            var replaceEmails = function(str) {
                return "<a href='mailto:"+str+"'>"+str+"</a>";
            }
            recursiveLinkify($(this), matchEmails, replaceEmails);
        });
    }
})(jQuery);
