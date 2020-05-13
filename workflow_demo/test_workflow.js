



lexicon_name = "wikispeech_lexserver_demo:enu";
wloc = window.location;
ws_host = wloc.protocol + "//" + wloc.hostname + ":" + wloc.port;
console.log(ws_host);

function getLexiconList() {
    var params = {};
    $.get(
	ws_host+'lexserver/lexicon/list',
        params,
        function(response) {
	    console.log(response);
	    lexicon_selector = document.getElementById("lexicon_selector");
	    for (var i = 0, len = response.length; i < len; i++) {
		var lexicon = response[i];
		console.log(lexicon);
		var name = lexicon.name;
		console.log(name);
		var option = document.createElement("option");
		option.setAttribute("value", name);
		option.text = name;
		lexicon_selector.appendChild(option);
		if ( name == lexicon_name ) {
		    option.setAttribute("selected","true");		    
		}
	    }
	}
    )

}

function setLexicon(new_lexicon_name) {
    lexicon_name = new_lexicon_name;
    console.log("New lexicon name: "+lexicon_name);
}

/* Lexicon table TODO not on click of header*/
function setupLexiconTable() {
    $("#words_table tbody tr").click(function(){
	$(this).addClass('selected').siblings().removeClass('selected');    
	//alert(orth);
	//$("#selected_word").html(orth);
	//var trans=$(this).find('td:eq(1)').html();
	//alert(value);
	//$("#selected_trans").html(trans);

	console.log("setupLexiconTable calling displaySelected")
	displaySelected(this);
    });
}

//make sure that the lexicon table is setup after loading words
$( document ).ajaxComplete(function( event, xhr, settings ) {
    console.log("ajaxComplete calling setupLexiconTable")
    setupLexiconTable();
});

//$(".makeSSML").on('input', function(){
$("#ssml_transcription_div").on('input', function(){


    console.log(this);
    console.log(this.innerHTML);
    
    // store current positions in variables
    var start = this.selectionStart,
        end = this.selectionEnd;

    //for div?
    //var carPos = getCaretPosition(this);
    
    //this.value = this.value.toLowerCase();
    this.innerHTML = makeSSMLReplacementString(this.innerHTML);

    // restore from variables...
    this.setSelectionRange(start, end);


});

$("#ssml_transcription_input").on('input', function(){

    //TODO
    //THIS WHOLE THING DOESN'T WORK

    
    var orth = $('#selected_word').text();

    var ssml_trans = this.value;
    //console.log(this);
    //console.log("ssml_transcription_input.value before validation: "+this.value);
    console.log("ssml_transcription_input.value before validation: "+ssml_trans);
    //console.log(this.innerText);

    validateTranscription(this);


    // store current positions in variables
    var start = this.selectionStart,
        end = this.selectionEnd;

    console.log("ssml_transcription_input.value after validation: "+ssml_trans);
    //this.value = makeSSMLReplacementString(this.value, orth);
    makeSSMLReplacementString();

    // restore from variables...
    this.setSelectionRange(start, end);


});

//In case we still want to use editable div, something like this is needed..
function getCaretPosition(element) {
    var caretOffset = 0;
    if (w3) {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (ie) {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}



function makeSSMLReplacementString() {

    var trans_string = $("#ssml_transcription_input").val();
    var orth = $('#selected_word').text();


    trans_string = trans_string.replace(/"/g, "&quot;");
    trans_string = trans_string.replace(/&nbsp;/g, " ");

    console.log("orth: "+orth);
    console.log("trans_string: "+trans_string);

    phoneme_string = "<phoneme alphabet=\"x-sampa\" ph=\""+trans_string+"\">"+orth+"</phoneme>";
    console.log(phoneme_string);

    $("#ssml_replacement").text(phoneme_string);

    //return new_ssml;
}

function displaySelected(row) {
    console.log("Displaying selected: "+row);

    //$("#ssml_transcription").html("");

    $("#ssml_replacement").html("");
    $("#autotrans").html("");

    var ssml_transcription_input = document.getElementById("ssml_transcription_input");
    ssml_transcription_input.value = "";
    
    
    var orth=$(row).find('td:eq(0)').html();
    $("#selected_word").html(orth);

    var trans=$(row).find('td:eq(2)')[0];
    var in_lex=$(row).find('td:eq(3)').html();
    var in_ssml=$(row).find('td:eq(4)').html();

    console.log(trans);
    var phoneme_string = trans.innerHTML.replace(/^.*<p>(<phoneme.+>).+<\/phoneme><\/p>.*$/,"$1");
    phoneme_string = phoneme_string+orth+"</phoneme>";
    console.log(phoneme_string);
    $("#ssml_replacement").text(phoneme_string);
    
    if ( in_ssml === "T" ) {
	//var ssml_transcription = document.getElementById("ssml_transcription");
	//var clone = trans.cloneNode(true);
	//ssml_transcription.appendChild(clone);

	//var ssml_transcription_input = document.getElementById("ssml_transcription_input");
	var clone = trans.cloneNode(true);
	ssml_transcription_input.value = clone.innerText;

    } else if ( in_lex !== "T" ) {
	var clone = trans.cloneNode(true);
	$("#autotrans").html(clone);
    }



    //If the word was found in lexicon
    var selected_table = document.getElementById("selected_table")
    selected_table.innerHTML = "";
    if ( orth in global_entries ) {
	entry_list = global_entries[orth];
	console.log(entry_list);
	var lang = document.getElementById("language_selector").value;
	displayInSimpleEditor(entry_list,selected_table, orth, lang);
	    
    }

}


function displayInSimpleEditor(entry_list, selected_table, orth, lang) {

	for (i=0; i<entry_list.length; i++) {
	    var entry = entry_list[i];
	    console.log(entry);

	    var row = document.createElement("tr");

	    //ENTRY NR
	    var nr = document.createElement("td");
	    nr.innerHTML = i+1; //first is 0
	    row.appendChild(nr)

	    //ENTRY TRANSCRIPTION (only shows first)
	    var trans = document.createElement("td");

	    trans.setAttribute("id","selected_trans_"+i);
	    trans.setAttribute("class", "ssml");

	    var xmllang = lang;
	    if ( lang == "en" ) {
		xmllang = "en-US";
	    }
	    if ( lang == "nb" ) {
		xmllang = "no";
	    }

	    trans.setAttribute("lang", xmllang);
	    trans.setAttribute("contenteditable",true);
	    trans.setAttribute("style", "background-color:lightgreen;");
	    
	    trans.innerHTML = entry["transcriptions"][0]["strn"];
	    trans.setAttribute("onkeyup","validateTranscription($('#selected_trans_"+i+"')[0], '"+lang+"');");	    
	    row.appendChild(trans)
	    
	    //LISTEN BUTTON
	    var listen = document.createElement("td");
	    var listen_button = document.createElement("input");
	    listen_button.setAttribute("type","button");
	    listen_button.setAttribute("value","listen");
	    listen_button.setAttribute("onclick", "playTranscription($('#selected_trans_"+i+"')[0], '"+lang+"');");
	    listen.appendChild(listen_button);
	    row.appendChild(listen)

	    //ENTRY LANG
	    var langE = document.createElement("td");
	    langE.innerHTML = entry["language"];
	    row.appendChild(langE)

	    //ENTRY POS
	    var pos = document.createElement("td");
	    pos.innerHTML = entry["partOfSpeech"];
	    row.appendChild(pos)

	    //ENTRY WORDPARTS
	    var parts = document.createElement("td");
	    parts.innerHTML = entry["wordParts"];
	    row.appendChild(parts)
	    
	    //ENTRY PREFERRED
	    var pref_td = document.createElement("td");
	    var pref = document.createElement("input");
	    //pref.type = "checkbox"
	    pref.type = "radio";
	    //Not sure if all three of these are needed really..
	    pref.id = "preferred_"+i;
	    pref.name = "preferred";
	    pref.value = "preferred";
	    
	    console.log("entry['preferred']: "+entry["preferred"]);
	    pref.checked = entry["preferred"];
	    pref_td.appendChild(pref)
	    row.appendChild(pref_td)

	    
	    //ENTRY TAG
	    var tag = document.createElement("td");
	    tag.id = "tag_"+i;
	    tag.innerText = entry["tag"];
	    row.appendChild(tag)
	    


	    //that's it
	    selected_table.appendChild(row);
	}
    
}

function updateLexicon(orth) {
    console.log("updateLexicon("+orth+")");
    entry_list = global_entries[orth];
    console.log(entry_list);
    for (i=0; i<entry_list.length; i++) {
	var entry = entry_list[i];
	console.log(entry);
	var newtrans = document.getElementById("selected_trans_"+i).innerHTML;
	if ( newtrans !== entry["transcriptions"][0]["strn"] ) {
	    console.log("UPDATING TRANS: "+entry["transcriptions"][0]["strn"]+" -> "+newtrans);
	    entry["transcriptions"][0]["strn"] = newtrans;
	}
	var newpref = document.getElementById("preferred_"+i).checked;
	if (newpref !== entry.preferred) {
	    console.log("UPDATING PREF: "+entry.preferred+" -> "+newpref);
	    entry.preferred = newpref;
	}
	var newtag = document.getElementById("tag_"+i).innerText;
	if (newtag !== entry.tag) {
	    console.log("UPDATING TAG: "+entry.tag+" -> "+newtag);
	    entry.tag = newtag;
	}
	updateEntry(entry);
    }
}


function makeSSMLTranscription(transcription, lang) {
    var speak = document.createElement("speak");
    
    var xmllang = lang;
    if ( lang == "en" ) {
	xmllang = "en-US";
    }
    if ( lang == "nb" ) {
	xmllang = "no";
    }

    speak.setAttribute("xml:lang", xmllang);
	
    speak.setAttribute("version","1.0");
    speak.setAttribute("xmlns", "http://www.w3.org/2001/10/synthesis");
    speak.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    speak.setAttribute("xsi:schemalocation", "http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis/synthesis.xsd");
    

    transcription = transcription.replace(/"/g, "&quot;");
    var ssml = "<p><phoneme alphabet=\"x-sampa\" ph=\""+transcription+"\">"+transcription+"</phoneme></p>";
    speak.innerHTML = ssml;

    return speak;
}

/* Step 1 - send html/text/ssml to wikispeech for textprocessing */
/* Called from Input tab "start" button */
/* TODO remove hardcoded language */
function tokeniseHtmlText(lang) {
    var html_editor = document.getElementById('html_editor');
    //console.log(html_editor);
    var html = html_editor.innerHTML;

    var xmllang = lang;
    if ( lang == "en" ) {
	xmllang = "en_US";
    }
    if ( lang == "nb" ) {
	xmllang = "no";
    }
    
    var ssml_header = '<?xml version="1.0" encoding="UTF-8" ?>\n<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"\n  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n  xsi:schemaLocation="http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis/synthesis.xsd"\nxml:lang="'+xmllang+'">\n';
    var ssml_footer = "</speak>";

    var ssml_content = filterToSSML(html);
    
    var ssml = ssml_header+ssml_content+ssml_footer;
    
    console.log("Tokenising:\n"+ssml);

    var params = {
	"lang": lang,
	"input_type": "ssml",
	"input": ssml
    }
    
    $.get(
        ws_host+'textprocessing/',
        params,
        function(response) {
	    console.log(response);

	    if (response.hasOwnProperty("paragraphs")) {
		//console.log("Found utt");
		////addSentencesToSynthesisTab(data.sentences);
		addHtmlSentencesToSynthesisTab(lang);
		
		var data = getSentenceAndTokens(response);
		
		addWordsToLexiconTab(data.words, lang);

	    } else {
		console.log("ERROR: response is not an utt");
	    }
        }
    );
}

function filterToSSML(html) {
    //Because s and sub have html meanings, they are prefixed with "ssml:"
    var ssml_content = html.replace(/ssml:/g, "")

    //&nbsp; breaks marytts ssml parser.
    //Declare the entity?
    ssml_content = ssml_content.replace(/&nbsp;/g, " ")

    //remove unclosed br tags (even closed come out wrong)
    //ssml_content = ssml_content.replace(/<br>/g, "<br/>")
    ssml_content = ssml_content.replace(/<br>/g, " ")

    return ssml_content;
    
}



function getSentenceAndTokens(utt) {

    var sentencelist = [];
    var words = {};
    
    var paragraphs = utt.paragraphs;
    for ( i=0; i<paragraphs.length; i++ ) {
	var p = paragraphs[i];
	var sentences = p.sentences;
	for ( j=0; j<sentences.length; j++ ) {
	    var s = sentences[j];
	    var phrases = s.phrases;
	    var tokenlist = [];
	    for ( l=0; l<phrases.length; l++ ) {
		var ph = phrases[l];
		var tokens = ph.tokens;
		for ( m=0; m<tokens.length; m++ ) {
		    var token = tokens[m];
		    //console.log(token);
		    var orth = token.token_orth;
		    orth = orth.toLowerCase();
		    tokenlist.push(orth);
		    if (orth in words) {
			words[orth]["freq"] += 1;
		    } else {
			words[orth] = {};
			words[orth]["freq"] = 1;
			var trans = getTranscription(token);
			//transcriptions[orth] = trans;
			words[orth]["transcription"] = trans;
			console.log(token);
			if ( !token.words[0].hasOwnProperty("g2p_method") ) {
			    words[orth]["in_ssml"] = true;
			}
			console.log(orth + " : ")
			console.log(words[orth]);
		    }
		}
	    }
	    sentencelist.push({tokens:tokenlist});
	}
    }
    return {sentences:sentencelist, words: words};
}


function getTranscription(token) {
    var trans = "";
    var words = token.words;
    for ( i=0; i<words.length; i++ ) {
	var w = words[i];
	trans = trans+w.trans;
    }
    return trans;
}

/* Step 2, add sentences in synthesis tab */
/* TODO Is this responsive enough? */
function addHtmlSentencesToSynthesisTab(lang) {
    var html_editor = document.getElementById('html_editor');
    //console.log(html_editor);

    var synthesis_container = document.getElementById("synthesis_container");
    //console.log(synthesis_container);
    synthesis_container.innerHTML = "";

    var text_chunks;

    //Use ssml:s tags if they exist
    text_chunks = html_editor.getElementsByTagName("ssml:s");
    //If there are no sentences, use p tags instead
    if ( text_chunks.length == 0 ) {
	console.log("Found no ssml:s elements");
	text_chunks = html_editor.getElementsByTagName("p");
	//If there are no p tags, use entire text (?)
	if ( text_chunks.length == 0 ) {
	    console.log("Found no p elements, using entire text");
	    text_chunks = [html_editor.innerHTML];
	}
	
    }


    console.log("TEXT CHUNKS: ");
    console.log(text_chunks);


    for ( var i=0; i<text_chunks.length; i++ ) {
	var t = text_chunks[i];
	var clone = t.cloneNode(true);
	//console.log("TEXT CHUNK: ");
	//console.log(clone);
	
	var p = document.createElement("p");
	var speak = document.createElement("speak");

	var xmllang = lang;
	if ( lang == "en" ) {
	    xmllang = "en-US";
	}
	if ( lang == "nb" ) {
	    xmllang = "no";
	}
	    

	speak.setAttribute("xml:lang", xmllang);
	
	speak.setAttribute("version","1.0");
	speak.setAttribute("xmlns", "http://www.w3.org/2001/10/synthesis");
	speak.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
	speak.setAttribute("xsi:schemalocation", "http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis/synthesis.xsd");

	p.appendChild(speak);

	var html = clone.innerHTML;
	//console.log("HTML: "+html);
	//var filtered = filterToSSML(html);
	//console.log("Filtered: "+filtered);
	//HB 161026 Display unfiltered, filter at synthesis time instead
	//speak.innerHTML = filtered;
	speak.innerHTML = html;
	
	synthesis_container.appendChild(p);

	p.setAttribute("class", "ssml");
	
	var id = "sentence_nr_"+i;
	p.setAttribute("id",id);

	console.log("addHtmlSentencesToSynthesisTab: LANGUAGE")
	console.log(lang)
	p.setAttribute("lang", lang);
   
	var playButton = document.createElement("input");
	playButton.setAttribute("type", "button");
	playButton.setAttribute("value", "Speak");
	playButton.setAttribute("onclick", "console.log("+id+"); play("+id+");");

	p.appendChild(playButton);

    }	    


}

/*not used any more */
function addSentencesToSynthesisTab(sentences) {
    var synthesis_container = document.getElementById("synthesis_container");
    console.log(synthesis_container);
    synthesis_container.innerHTML = "";

    for ( i=0; i<sentences.length; i++ ) {
	var s = sentences[i].tokens;
	var sentence_text = s.join(" ");

	var p = document.createElement("p");
	var t = document.createTextNode(sentence_text);
	p.appendChild(t);           
	synthesis_container.appendChild(p);
	
	var id = "sentence_nr_"+i;
	p.setAttribute("id",id);

	var lang = "sv";
	p.setAttribute("lang", lang);
   
	var playButton = document.createElement("input");
	playButton.setAttribute("type", "button");
	playButton.setAttribute("value", "Speak");
	playButton.setAttribute("onclick", "play("+id+");");

	p.appendChild(playButton);

    }	    
}


/* Step 3, list words in lexicon tab */

function addWordsToLexiconTab(words, lang) {
    var words_table = document.getElementById("words_table");
    var words_table_tbody = words_table.getElementsByTagName("tbody")[0];
    words_table_tbody.innerHTML = "";

    var sorted_wordlist = Object.keys(words).sort();

    //remove punctuation
    for (var i=sorted_wordlist.length-1; i>=0; i--) {
	if (sorted_wordlist[i].match(/^[.,?!]+$/)) {
            sorted_wordlist.splice(i, 1);
            // break;       //<-- Uncomment  if only the first term has to be removed
	}
    }

    
    console.log(sorted_wordlist);

    for ( i=0; i<sorted_wordlist.length; i++ ) {
	var orth = sorted_wordlist[i];
	var word = words[orth];
	console.log(orth);
	if ( !orth.match(/^[.,?!]+$/) ) {
	    //console.log("Adding word: "+word);

	    var word_id = "word_"+i;

	    //<div data-role="main" class="ui-content">
	    //<div class="ui-grid-a">
	    //<div class="ui-block-a">
					 
	    var tr = document.createElement("tr");
	    tr.setAttribute("id","entry_"+i);

	    //1
	    var td = document.createElement("td");
	    //td.setAttribute("id",word_id);
	    //td.setAttribute("style", "display: inline-block; width: 10em;");
	    var w = document.createTextNode(orth);
	    td.appendChild(w);
            tr.appendChild(td);

	    //2 frequency
	    var td = document.createElement("td");
	    td.innerHTML = word.freq;
            tr.appendChild(td);

	    //3
	    //Add transcription predicted by synthesiser 
	    var trans = document.createElement("td");
	    trans.setAttribute("id","trans_"+i);
	    //trans.setAttribute("style", "display: inline-block; width: 30em;");
	    trans.setAttribute("class", "ssml");

	    trans.setAttribute("lang", lang);

	    var speak = document.createElement("speak");

	    var xmllang = lang;
	    if ( lang == "en" ) {
		xmllang = "en-US";
	    }
	    else if ( lang == "nb" ) {
		xmllang = "no";
	    }

	    speak.setAttribute("xml:lang", xmllang);
	
	    speak.setAttribute("version","1.0");
	    speak.setAttribute("xmlns", "http://www.w3.org/2001/10/synthesis");
	    speak.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
	    speak.setAttribute("xsi:schemalocation", "http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis/synthesis.xsd");

	    var transcription = word.transcription;
	    transcription = transcription.replace(/"/g, "&quot;");
	    var ssml = "<p><phoneme alphabet=\"x-sampa\" ph=\""+transcription+"\">"+transcription+"</phoneme></p>";
	    //var ssml = "<p><phoneme alphabet=\"x-sampa\" ph=\""+transcription+"\">BABIAN</phoneme></p>";
	    //var t = document.createTextNode(ssml);
	    //speak.appendChild(t);
	    speak.innerHTML = ssml;
	    trans.appendChild(speak);
	    tr.appendChild(trans);
	    
	    //4
	    var in_lex = document.createElement("td");
	    tr.appendChild(in_lex);
	    //var in_lex = document.createElement("input");
	    //in_lex.setAttribute("type","checkbox");
	    //in_lex.setAttribute("value","in_lex");
	    //td.appendChild(in_lex);
	    //tr.appendChild(td);
	    
	    //5
	    var in_ssml = document.createElement("td");
	    if ( word.hasOwnProperty("in_ssml") && word.in_ssml == true) {
		in_ssml.innerHTML = "T";
	    }
	    tr.appendChild(in_ssml);

	    //6
	    var multiple = document.createElement("td");
	    tr.appendChild(multiple);

	    //7
	    var td = document.createElement("td");
	    var listen_button = document.createElement("input");
	    listen_button.setAttribute("type","button");
	    listen_button.setAttribute("value","listen");
	    listen_button.setAttribute("onclick", "useOriginalText = false; showControls = false; play($('#trans_"+i+"')[0]);");
	    //listen_button.setAttribute("onclick", "playTranscription($('#trans_"+i+"'));");
	    td.appendChild(listen_button);
	    tr.appendChild(td);
	    



	    

	    words_table_tbody.appendChild(tr);


	} else {
	    console.log("Ignoring: "+word);
	}
    }
    //See if the words are found in lexicon, update table accordingly
    //Better to look up all words first..
    wordsInLex(words, lang);

    
}


function validateTranscription(t, lang) {
    console.log(t);

    //if it's an element
    var trans = t.innerHTML;
    //if it's an input field
    //TODO check instead if it is..
    if ( trans == "" ) {
	trans = t.value;
	//replace all except first ' with % if ssml transcription..
	trans = trans.replace(/'/g,"%%");
	trans = trans.replace("%%","'");
	trans = trans.replace("%%", "%");
	trans = trans.replace(/%%/g,"");
    }

    console.log("validateTranscription: trans = "+trans);
    
    var word = "dummy";
    var entry = {
	"strn": word,
	"wordParts": word,
	"transcriptions":[
	    {
		"strn": trans
	    }
	]
    };

    //TODO fix
    if ( lang == undefined ) {
	lang = document.getElementById("language_selector").value;
    }    
    console.log("validateTranscription: lang = "+lang);
    
    //TODO hardcoded symbolsets
    if ( lang == "sv" ) {
	var symbolset = "sv-se_ws-sampa";
    }
    else if ( lang == "en" ) {
	var symbolset = "en-us_ws-sampa";
    }
    else if ( lang == "nb" ) {
	var symbolset = "nb-no_ws-sampa";
    } else {
	console.log("WARNING: no symbolset defined for language "+lang);
	return;
    }
    
    var params = {
	"symbolsetname": symbolset,
	"entry": JSON.stringify(entry)
    }

    
    $.get(
        ws_host+'lexserver/validation/validateentry',
        params,
        function(response) {
	    console.log("validateTranscription: response = "+response);
	    var container = $('#validation')[0];
	    container.innerHTML = "";

	    if ( response["entryValidations"].length == 0 ) {

		t.setAttribute("style", "background-color:lightgreen;");

	    } else {

		displayValidationResult(response["entryValidations"], container, t);
		
	    }
	}
    );
}

function displayValidationResult(messages, container, transcription_field) {
		
    //{"id":0,"level":"Fatal","ruleName":"SymbolSet","Message":"Invalid transcription symbol ' g' in /\"\" b  g . d e s/","timestamp":""}
		
    for (i=0; i < messages.length; i++) {
	var msg = messages[i];
	console.log(msg);
	var row = document.createElement("tr");
	
	var cell1 = document.createElement("td");
	cell1.innerHTML = msg["id"];
	row.appendChild(cell1);
	
	var cell2 = document.createElement("td");
	cell2.innerHTML = msg["level"];
	row.appendChild(cell2);
	
	var cell3 = document.createElement("td");
	cell3.innerHTML = msg["ruleName"];
	row.appendChild(cell3);
	
	var cell4 = document.createElement("td");
	cell4.innerHTML = msg["Message"];
	row.appendChild(cell4);
	
	var cell5 = document.createElement("td");
	cell5.innerHTML = msg["timestamp"];
	row.appendChild(cell5);
	
	container.appendChild(row);
    }    		    
    transcription_field.setAttribute("style", "background-color:pink;");
}


function playTranscription(t,lang) {
    //var t = $('#'+id)[0];
    console.log(t);
    var trans = t.innerHTML;
    console.log(trans);
    //alert("playTranscription "+trans+" not yet implemented");


    var word = "dummy";
    var entry = {
	"strn": word,
	"wordParts": word,
	"transcriptions":[
	    {
		"strn": trans
	    }
	]
    };

    console.log("playTranscription: LANGUAGE")
    console.log(lang)

    //TODO hardcoded symbolsets
    if ( lang == "sv" ) {
	var symbolset = "sv-se_ws-sampa";
    }
    else if ( lang == "en" ) {
	var symbolset = "en-us_ws-sampa";
    }
    else if ( lang == "nb" ) {
	var symbolset = "nb-no_ws-sampa";
    } else {
	console.log("WARNING: no symbolset defined for language "+lang);
	return;
    }

    var params = {
	"symbolsetname": symbolset,
	"entry": JSON.stringify(entry)
    }


    console.log(params);

    $.ajax(
	{
            url: ws_host+'lexserver/validation/validateentry',
            data: params,
            success: function(response) {
		console.log(response);
		var validation_container = $('#validation')[0];
		validation_container.innerHTML = "";

		if ( response["entryValidations"].length == 0 ) {

		    t.setAttribute("style", "background-color:lightgreen;");
		    
		    //Actually play only after validation
		    playSSML(trans, lang);
		
		} else {

		    displayValidationResult(response["entryValidations"], validation_container, t);
		
		}
	    },
	    error: function(xhr) {
		console.log(xhr);
		alert("An error occured: " + xhr.status + " " + xhr.statusText + " " + xhr.responseText);
	    }
	}
    );
}

function playSSML(trans, lang) {

    ssml = makeSSMLTranscription(trans, lang);

    
    container = document.createElement("p");

    container.setAttribute("lang", lang);
    container.setAttribute("class", "ssml");

    container.appendChild(ssml);

    console.log("container: ");
    console.log(container);
    
    //globals for player
    useOriginalText = false;
    showControls = false;
    play(container);
}





/* Searches for one word/re, used in lexicon editor */
/* TODO Remove hardcoded lexicon name and url*/
function searchLexicon(search_term, lang) {
    console.log("Searching lexicon for: " + search_term);

    /*
    if ( lang == "sv" ) {
	var lexicons = "sv_se_nst_lex:sv-se.nst";
    } 
    else if ( lang == "en" ) {
	var lexicons = "en_am_cmu_lex:en-us.cmu";
    }
    else {
	console.log("WARNING: no lexicon defined for lang "+lang);
    }
    */
    var lexicons = lexicon_name;
    console.log("Lexicon name: "+lexicons);

    var params = {
	"lexicons": lexicons,
	"words": search_term
    }
    
    $.get(
        ws_host+'lexserver/lexicon/lookup',
        params,
        function(response) {
	    console.log(response);
	    entry_editor.setValue(response);
        }
    );

}

/* Not used any more */
function wordInLex(word, div, trans) {
    console.log("Searching lexicon for: " + word);

    var known_words_container = document.getElementById("known_words_container");
    var unknown_words_container = document.getElementById("unknown_words_container");

    var params = {
	"lexicons": "sv_se_nst_lex:sv-se.nst",
	"words": word
    }
    
    $.get(
        'http://localhost/ws_service/lexicon/lookup',
        params,
        function(response) {
	    console.log(response);
	    if ( response == null ) {
		console.log("Adding to unknown_words: "+word);
		var transcription = "NONE";
		trans.innerHTML = transcription;
		unknown_words_container.appendChild(div)
	    } else {
		console.log("Adding to known_words: "+word);

		var transcription = response[0].transcriptions[0].strn;
		//var transcription = "' A . p a";
		trans.innerHTML = transcription;

		known_words_container.appendChild(div)
	    }
        }
    );

}



function wordsInLex(words, lang) {
    var wordlist = Object.keys(words).sort();
    var words_to_lookup = wordlist.join();
    
    //console.log("Searching lexicon for: " + words);

    //TODO hardcoded lexicon
    /*
    if ( lang == "sv" ) {
	var lexicons = "wikispeech_lexserver_demo:sv";
    } 
    else if ( lang == "en" ) {
	var lexicons = "wikispeech_lexserver_demo:enu";
    }
    else if ( lang == "nb" ) {
	var lexicons = "wikispeech_lexserver_demo:nb";
    }
    else {
	console.log("WARNING: no lexicon defined for lang "+lang);
    }
    */

    var lexicons = lexicon_name;
    console.log("Lexicon name: "+lexicons);


    var params = {
	"lexicons": lexicons,
	"pagelength": 2*wordlist.length,
	"words": words_to_lookup
    }

    $.get(
        ws_host+'lexserver/lexicon/lookup',
        params,
        function(response) {

	    console.log(response);
	    //response is a list of entries, first convert it to hash with orth as key
	    //GLOBAL for later use
	    global_entries = {};
	    for (i=0; i<response.length; i += 1) {
		var entry = response[i];

		//filter out entries with status:name=delete
		if ( entry.status.name == "delete" ) {
		    continue;
		}
		console.log("Adding to global_entries: "+entry.strn);
		if ( entry.strn in global_entries ) {
		    global_entries[entry.strn].push(entry);
		} else {
		    global_entries[entry.strn] = [entry];
		}
	    }
	    

	    //remove punctuation
	    for (var i=wordlist.length-1; i>=0; i--) {
		if (wordlist[i].match(/^[.,?!]+$/)) {
		    wordlist.splice(i, 1);
		    // break;       //<-- Uncomment  if only the first term has to be removed
		}
	    }
	    

	    for (i=0; i<wordlist.length; i += 1) {
		var word = wordlist[i];
		if ( word.match(/^[.,?!]+$/) ) {
		    console.log("ignoring: "+word);
		    continue;
		}

		var tr = document.getElementById("entry_"+i);

		//var in_lex = tr.getElementsByTagName("td")[3].getElementsByTagName("input")[0];
		var in_lex = tr.getElementsByTagName("td")[3];
		//console.log(in_lex);

		//var multiple = tr.getElementsByTagName("td")[5].getElementsByTagName("input")[0];
		var multiple = tr.getElementsByTagName("td")[5];
		

		var found = false;
		var word = wordlist[i];
		
		if ( word in global_entries ) {
		    console.log("Adding to known_words: "+word);
		    console.log(global_entries[word]);
		    
		    
		    //in_lex.setAttribute("checked", true);
		    //if ( entries[word].length > 1 ) {
			//multiple.setAttribute("checked", true);
		    //}
		    in_lex.innerHTML = "T";
		    if ( global_entries[word].length > 1 ) {
			multiple.innerHTML = "T";
		    }
		    
		    found = true;
		}
		if ( found == false ) {
		    console.log(word+" not found in lex");
		}
	    }
	    //select the first row
	    var row = document.getElementById("entry_0");
	    $(row).addClass("selected");

	    //TODO This goes wrong..
	    console.log("wordsInLex calling displaySelected")
	    displaySelected(row);


        }
    );

}


function updateEntries() {
    var entries = entry_editor.getValue();
    console.log(entries);

    for (i=0; i<entries.length; i += 1) {

	var entry = entries[i];

	updateEntry(entry);

    }

}

function updateEntry(entry) {
    console.log(entry);


    console.log(entry["lemma"]["reading"]);


    
    var entry_string = JSON.stringify(entry);
    console.log(entry_string);
    
    var params = {
	//"entry": encodeURIComponent(entry_string)
	//"entry": entry
	"entry": entry_string
    };
    //console.log(JSON.stringify(params));
    
    $.ajax({
	url: ws_host+'lexserver/lexicon/updateentry?entry='+entry_string,
	//data: params,
	type: "GET",
	contentType: "application/json",
	dataType: 'json',
	
	success: function(response) {
	    console.log(response);
	}
    });
    
    /*	
	$.get(
        'http://localhost/ws_service/lexicon/updateentry',
        params,
        function(response) {
	console.log(response);
	}
	);
    */
}

	
function testUpdateEntry() {

    var entry =  {
	"id": 365544,
	"lexiconId": 1,
	"strn": "huvud-",
	"language": "SWE",
	"partOfSpeech": " ",
	"wordParts": "hund",
	"lemma": {
	    "id": 0,
	    "strn": "",
	    "reading": "",
	    "paradigm": ""
	},
	"transcriptions": [
	    {
		"id": 929606,
		"entryId": 365544,
		"strn": "\"h A n d",
		"language": "SWE",
		"sources": [ ]
	    }
	],
	"status": {
	    "id": 365544,
	    "name": "imported",
	    "source": "nst",
	    "timestamp": "2016-09-16T07:45:36Z",
	    "current": true
	},
	"entryValidations": [ ]
    };
   
    updateEntry(entry);

    //This fails
    var entry2 = {
	"id":161631,
	"lexiconId":1,
	"strn":"byggdes",
	"language":"SWE",
	"partOfSpeech":"JJ%20SIN|DEF|GEN|MAS|POS",
	"wordParts":"byggdes",
	"lemma":{
	    "id":18639,
	    "strn":"byggd",
	    "reading":0,
	    "paradigm":"3v-ombordanst%C3%A4lld"
	},
	"transcriptions":[
	    {
		"id":167058,
		"entryId":161631,
		"strn":"\"\"%20b%20Y%20g%20.%20d%20e%20s",
		"language":"SWE"
	    }
	]
    };

    //Trying to remove things to see what fails
    //reading:0 seems to be 
    var entry3 = {
	"id":161631,
	"lexiconId":1,
	"strn":"byggdes",
	"language":"SWE",
	"partOfSpeech":"JJ",
	"wordParts":"byggdes",
	"lemma":{
	    "id":18639,
	    "strn":"byggd",
	    "reading":"",
	    "paradigm":""
	},
	"transcriptions":[
	    {
		"id":167058,
		"entryId":161631,
		"strn":"\"\" b Y g . d e s",
		"language":"SWE"
	    }
	]
    };

    updateEntry(entry3);
    
}

