var version="04/23";
// Début durée
d0=new Date();
debut=util.printd("dd/mm/yyyy HH:MM",d0);
// C'est parti !
console.show();
console.clear();
var lesTirets="––––––––––––––";
var lesProprietes=["quads","contents"];
var possible=1;
var highlightedPage=new Array(this.numPages);
this.syncAnnotScan();
var annots=this.getAnnots();
if (annots!=null) {
	var cT=0;
	for (var i=0; i<annots.length; i++) {
		if (annots[i].type=="Highlight" || annots[i].type=="Underline" || annots[i].type=="Squiggly" || annots[i].type=="StrikeOut" || annots[i].type=="Redact") {
			if (annots[i].type!="StrikeOut" && !possible) possible=1;
			var laPage=annots[i].page;
			if (typeof highlightedPage[laPage]==="undefined") highlightedPage[laPage]=new Array();
			highlightedPage[laPage].push(i.toString());
			for (var prop=0; prop<lesProprietes.length; prop++) {
				if (typeof eval("annots[i]."+lesProprietes[prop])=="string" || lesProprietes[prop]=="quads") {
					highlightedPage[laPage].push(eval("annots[i]."+lesProprietes[prop]));
				}
			}
			highlightedPage[laPage].push("-");
		}
	}
	var incr=lesProprietes.length+2; // 1 pour N° de page + 1 pour AV/AP
	for (var i=highlightedPage.length-1; i>=0; i--) {
		if (typeof highlightedPage[i]==="undefined") {
			highlightedPage.splice(i,1);
		} else {
			highlightedPage[i].unshift(i);
		}
	}
	reponses=highlightedPage.slice(0);
	for (var j=0; j<reponses.length; j++) {
		reponses[j]=highlightedPage[j].slice(0);
		for (k=2; k<reponses[j].length; k++) reponses[j][k]=highlightedPage[j][k].slice(0);
	}
	for (var j=0; j<reponses.length; j++) {
		for (k=2; k<reponses[j].length; k+=incr) reponses[j][k]=[];
	}
	//
	for (var j=0; j<highlightedPage.length; j++) {
		var p=highlightedPage[j][0];
		console.clear();
		console.println("D\Process starting: "+debut);
		console.println(lesTirets);
		console.println("Processing page "+(p+1));
		// Y maxi et mini dans la page
		var max=[];
		var min=[];
		for (k=2; k<highlightedPage[j].length; k+=incr) {
			r=highlightedPage[j][k][0];
			r=r.toString();
			r=r.split(",");
			max.push(r[1]);
			min.push(r[7]);
		}
		max.sort(function(a,b){return b-a});
		min.sort(function(a,b){return a-b});
		var yMax=Number(max[0]);
		var yMin=Number(min[0]);
		// Vérification des mots
		var nbMots=this.getPageNumWords(p);
		var mT=0;
		for (var i=0; i<nbMots; i++) {
			var leMot=this.getPageNthWord(p,i,true);
			var q=this.getPageNthWordQuads(p,i);
			m=(new Matrix2D).fromRotated(this,p);
			mInv=m.invert();
			r=mInv.transform(q);
			r=r.toString();
			r=r.split(",");
			var xGmot=Number(r[0]);
			var yGmot=Number(r[1]);
			var xDmot=Number(r[6]);
			var yDmot=Number(r[7]);
			if (yGmot>yMax+1) continue;
			else if (yGmot<yMin-1 && mT) break;
			else {
				for (k=2; k<highlightedPage[j].length; k+=incr) {
					for (m=0; m<highlightedPage[j][k].length; m++) {
						r=highlightedPage[j][k][m];
						r=r.toString();
						r=r.split(",");
						var xG=Number(r[0]);
						var yG=Number(r[1]);
						var xD=Number(r[6]);
						var yD=Number(r[7]);
						if (xGmot>xG-1 && yGmot<yG+1 && xGmot<xD && yDmot>yD-1) {
							mT++;
							reponses[j][k].push(this.getPageNthWord(p,i,false));
						}
					}
				}
			}
		}
	}
	console.clear();
	console.println("Process starting: "+debut);
	console.println(lesTirets);
	console.println("Building the result");
	var leTexte="";
	for (var j=0; j<reponses.length; j++) {
		var surPage=Math.floor((reponses[j].length-1)/incr)+cT;
		var texteChamp="";
		// Page
		if (leTexte!="") {
			leTexte+="\r";
			texteChamp+="\r";
		}
		for (k=2; k<reponses[j].length; k+=incr) {
			var lesMots=reponses[j][k].toString();
			var lesMots=lesMots.replace(/^\s+|\s+$/,"");
			var lesMots=lesMots.replace(/ ,/g," ");
			var lesMots=lesMots.replace(/-,/g,"-");
			var lesMots=lesMots.replace(/\(,/g,"\(");
			var lesMots=lesMots.replace(/\",/g,"\"");
			var lesMots=lesMots.replace(/\[,/g,"\[");
			var lesMots=lesMots.replace(/\n,/g,"\n");
			var lesMots=lesMots.replace(/¡,/g,"¡");
			var lesMots=lesMots.replace(/¿,/g,"¿");
			var adjectif=""; // Redact
			// Texte
			leTexte+="\r"+lesMots+"";
			// Commentaire
			var laReponse=reponses[j][k+1];
			leTexte+="\r";
		}
	}
	// Fin durée
	console.clear();
	console.println("Process starting: "+debut);
	df=new Date();
	fin=util.printd("dd/mm/yyyy à HH:MM",df);
	console.println("Process ending: "+fin);
	temps=(df.valueOf()-d0.valueOf())/1000/60;
	var lesMinutes=parseInt(temps);
	var lesSecondes=(temps-lesMinutes)*60;
	var lesSecondes=parseInt(lesSecondes*10)/10;
	var leTemps="";
	if (lesMinutes>0) {
		if (lesMinutes==1) {
			var leTemps="1 minute";
		} else {
			var leTemps=lesMinutes+"minutes";
		}
	}
	if (lesSecondes>0) {
		if (lesSecondes<2) {
			var leTemps=leTemps+" "+lesSecondes+" second";
		} else {
			var leTemps=leTemps+" "+lesSecondes+" seconds";
		}
	}
	var leTemps=leTemps.replace(/^\s+|\s+$/gm,"");
	if (leTemps.length>0) {
		console.println("Process duration: "+leTemps+"\r\r");
	}
	console.println(leTexte);
	var leFichier="Comments of "+util.printd("dd-mm-yy - HH:MM", new Date()).replace(/:/,"h");
	var leRapport=leFichier+".txt";
	this.createDataObject(leRapport, "©™Σ","text/html; charset=utf-16"); //
	var oFile=util.streamFromString(leTexte);
	this.setDataObjectContents(leRapport, oFile);
	// Message final
	var ouverture="You can import the attached .txt file into a spreadsheet using Unicode UTF-8 format.";
	if (annots.length-cT==1) app.alert("One comment has been detailed.\r\r"+ouverture,3);
	else app.alert((annots.length-cT)+" comments have been detailed.\r\r"+ouverture,3);
}
if (annots==null) app.alert("There are no comments in this document.",3)
