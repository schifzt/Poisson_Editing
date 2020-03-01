// instanciate new modal
var modal = new tingle.modal({
    footer:false,
    stickyFooter: false,
    closeMethods: ["overlay"],
    closeLabel: "Close",
    onOpen: function() {
        console.log("modal open");
    },
    onClose: function() {
        console.log("modal closed");
    },
    beforeClose: function() {
        return true; // close the modal
    }
});

// set content
modal.setContent(document.getElementById("help_content").innerHTML);

// add a button
modal.addFooterBtn("close","button", function() {
    modal.close();
});
