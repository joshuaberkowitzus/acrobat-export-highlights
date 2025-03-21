var version = "04/23";

// Start time
var d0 = new Date();
var startTime = util.printd("dd/mm/yyyy HH:MM", d0);

// Initialize console
console.show();
console.clear();

var separator = "––––––––––––––";
var properties = ["quads", "contents"];
var possible = 1;
var highlightedPage = new Array(this.numPages);

this.syncAnnotScan();
var annots = this.getAnnots();

if (annots != null) {
    var cT = 0;
    for (var i = 0; i < annots.length; i++) {
        if (annots[i].type == "Highlight" || annots[i].type == "Underline" || annots[i].type == "Squiggly" || annots[i].type == "StrikeOut" || annots[i].type == "Redact") {
            if (annots[i].type != "StrikeOut" && !possible) possible = 1;
            var page = annots[i].page;
            if (typeof highlightedPage[page] === "undefined") highlightedPage[page] = new Array();
            highlightedPage[page].push(i.toString());
            for (var prop = 0; prop < properties.length; prop++) {
                if (typeof eval("annots[i]." + properties[prop]) == "string" || properties[prop] == "quads") {
                    highlightedPage[page].push(eval("annots[i]." + properties[prop]));
                }
            }
            highlightedPage[page].push("-");
        }
    }

    var incr = properties.length + 2; // 1 for page number + 1 for separator
    for (var i = highlightedPage.length - 1; i >= 0; i--) {
        if (typeof highlightedPage[i] === "undefined") {
            highlightedPage.splice(i, 1);
        } else {
            highlightedPage[i].unshift(i);
        }
    }

    var responses = highlightedPage.slice(0);
    for (var j = 0; j < responses.length; j++) {
        responses[j] = highlightedPage[j].slice(0);
        for (k = 2; k < responses[j].length; k++) responses[j][k] = highlightedPage[j][k].slice(0);
    }
    for (var j = 0; j < responses.length; j++) {
        for (k = 2; k < responses[j].length; k += incr) responses[j][k] = [];
    }

    for (var j = 0; j < highlightedPage.length; j++) {
        var p = highlightedPage[j][0];
        console.clear();
        console.println("Process starting: " + startTime);
        console.println(separator);
        console.println("Processing page " + (p + 1));

        // Max and min Y coordinates in the page
        var max = [];
        var min = [];
        for (k = 2; k < highlightedPage[j].length; k += incr) {
            r = highlightedPage[j][k][0];
            r = r.toString();
            r = r.split(",");
            max.push(r[1]);
            min.push(r[7]);
        }
        max.sort(function (a, b) { return b - a });
        min.sort(function (a, b) { return a - b });
        var yMax = Number(max[0]);
        var yMin = Number(min[0]);

        // Check words
        var wordCount = this.getPageNumWords(p);
        var mT = 0;
        for (var i = 0; i < wordCount; i++) {
            var word = this.getPageNthWord(p, i, true);
            var q = this.getPageNthWordQuads(p, i);
            m = (new Matrix2D).fromRotated(this, p);
            mInv = m.invert();
            r = mInv.transform(q);
            r = r.toString();
            r = r.split(",");
            var xGmot = Number(r[0]);
            var yGmot = Number(r[1]);
            var xDmot = Number(r[6]);
            var yDmot = Number(r[7]);
            if (yGmot > yMax + 1) continue;
            else if (yGmot < yMin - 1 && mT) break;
            else {
                for (k = 2; k < highlightedPage[j].length; k += incr) {
                    for (m = 0; m < highlightedPage[j][k].length; m++) {
                        r = highlightedPage[j][k][m];
                        r = r.toString();
                        r = r.split(",");
                        var xG = Number(r[0]);
                        var yG = Number(r[1]);
                        var xD = Number(r[6]);
                        var yD = Number(r[7]);
                        if (xGmot > xG - 1 && yGmot < yG + 1 && xGmot < xD && yDmot > yD - 1) {
                            mT++;
                            responses[j][k].push(this.getPageNthWord(p, i, false));
                        }
                    }
                }
            }
        }
    }

    console.clear();
    console.println("Process starting: " + startTime);
    console.println(separator);
    console.println("Building the result");
    var text = "";
    for (var j = 0; j < responses.length; j++) {
        var onPage = Math.floor((responses[j].length - 1) / incr) + cT;
        var fieldText = "";
        if (text != "") {
            text += "\r";
            fieldText += "\r";
        }
        for (k = 2; k < responses[j].length; k += incr) {
            var words = responses[j][k].toString();
            words = words.replace(/^\s+|\s+$/, "").replace(/ ,/g, " ").replace(/-,/g, "-").replace(/\(,/g, "\(").replace(/\",/g, "\"").replace(/\[,/g, "\[").replace(/\n,/g, "\n").replace(/¡,/g, "¡").replace(/¿,/g, "¿");
            var adjective = ""; // Redact
            text += "\r" + words + "";
            var response = responses[j][k + 1];
            text += "\r";
        }
    }

    // End time
    console.clear();
    console.println("Process starting: " + startTime);
    var df = new Date();
    var endTime = util.printd("dd/mm/yyyy à HH:MM", df);
    console.println("Process ending: " + endTime);
    var duration = (df.valueOf() - d0.valueOf()) / 1000 / 60;
    var minutes = parseInt(duration);
    var seconds = (duration - minutes) * 60;
    seconds = parseInt(seconds * 10) / 10;
    var durationText = "";
    if (minutes > 0) {
        durationText = minutes == 1 ? "1 minute" : minutes + " minutes";
    }
    if (seconds > 0) {
        durationText += seconds < 2 ? " " + seconds + " second" : " " + seconds + " seconds";
    }
    durationText = durationText.replace(/^\s+|\s+$/gm, "");
    if (durationText.length > 0) {
        console.println("Process duration: " + durationText + "\r\r");
    }
    console.println(text);
    var fileName = "Comments of " + util.printd("dd-mm-yy - HH:MM", new Date()).replace(/:/, "h");
    var reportFile = fileName + ".txt";
    this.createDataObject(reportFile, "©™Σ", "text/html; charset=utf-16");
    var oFile = util.streamFromString(text);
    this.setDataObjectContents(reportFile, oFile);

    // Final message
    var message = "You can import the attached .txt file into a spreadsheet using Unicode UTF-8 format.";
    if (annots.length - cT == 1) app.alert("One comment has been detailed.\r\r" + message, 3);
    else app.alert((annots.length - cT) + " comments have been detailed.\r\r" + message, 3);
}

if (annots == null) app.alert("There are no comments in this document.", 3);
