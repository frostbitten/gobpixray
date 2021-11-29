const GETHANDLE = 'https://data.metropolis.drib.net/get_handle'
let syncButton = null;
let mintButton = null;

let original_location = null;

// const mintIFrameOrigin = 'https://localhost:8082' //test
const mintIFrameOrigin = window.location.origin //live

function setup() {
  print("SETTING UP!")
  frameRate(1);

  original_location = window.location.href;
  window.onhashchange = locationHashChanged;

  syncButton = createButton('');
  syncButton.mousePressed(syncUnsyncPressed);
  syncButton.parent('ui_sync');

  mintButton = createButton('mint');
  mintButton.mousePressed(mintPressed);
  mintButton.parent('ui_sync');
  mintButton.attribute('disabled', '');

  updateSyncUnsyncButton();
}

let suspendInput = false;
function mintPressed() {
  if (market_is_shown) {
    toggleMarket();
  }
  suspendInput = true;
  let rootDiv = document.getElementById("root2");
  rootDiv.style.opacity = "0.99";  
  rootDiv.style.display = "block";
  console.log('mintPressed')
  // if(window.tz && window.tz.mint_metropolis) {
    // window.tz.mint_metropolis();
  // }
  // console.log("HIC interface enabled");
}

function hideMint() {
  let rootDiv = document.getElementById("root2");
  rootDiv.style.opacity = "0.0";
  setTimeout(function() {rootDiv.style.display = "none";}, 300);
  // mintingElementSwap(false);
  suspendInput = false;
}

function syncUnsyncPressed() {
  if (syncButton.elt.innerText == 'sync') {
    print("SYNC");
    if(window.tz != null && window.tz.address != null) {
      print("WAS SYNCED");
      syncButton.elt.innerText = 'unsync';
      return;
    }
    if (window.tz != null && window.tz.handle_sync != null) {
      print("SYNCING");
      window.tz.handle = null;
      window.tz.handle_sync();
      return;
    }
  }
  if (syncButton.elt.innerText == 'unsync') {
    print("UNSYNC");
    if(window.tz != null && window.tz.address == null) {
      print("WAS UNSYNCED");
      syncButton.elt.innerText = 'sync';
      return;
    }
    if (window.tz != null && window.tz.handle_unsync != null) {
      print("UNSYNCING");
      window.tz.handle = null;
      window.tz.handle_unsync();
      return;
    }
  }
}

async function fetchHandleFromAddress() {
  if(window.tz != null && window.tz.address != null) {
    let response = await fetch(GETHANDLE + "?" + window.tz.address);
    let handle = await response.text();
    console.log("Setting handle to " + handle);
    window.tz.handle = handle;
  }
}

let is_synced = false;
function updateSyncUnsyncButton() {
  if(window.tz != null && window.tz.address != null) {
    is_synced = true;
    syncButton.elt.innerText = 'unsync';
    if (window.tz.handle == null) {
      fetchHandleFromAddress();
    }
    else {
      console.log("HANDLE was already " + window.tz.handle);
    }
  }
  else if (window.tz != null && window.tz.address == null) {
    is_synced = false;
    syncButton.elt.innerText = 'sync';
  }
  else {
    is_synced = false;
    syncButton.elt.innerText = '?';
  }
  updateMintButton();
}

function updateMintButton() {
  if(is_synced && result_is_ready) {
    // Re-enable the button
    mintButton.removeAttribute('disabled');
  }
  else {
    // Disable the button
    mintButton.attribute('disabled', '');
  }  
}

function draw() {
  // print("Drawing...");
}

function locationHashChanged() {
  if(window.location.hash == "#recover") {
    console.log("recover state called. reverting: ");
    // checkMintPost();
    hideMint();
    updateSyncUnsyncButton();
    window.location.href = original_location;
    window.location.hash = "";
    return;    
  }
}

function getCurrentTzAddress() {
  if(window.tz != null && window.tz.address != null) {
    return window.tz.address;
  }
  else {
    return null;
  }
}

let market_is_shown = false;
function toggleMarket() {
  let target = document.getElementById("market");
  if (market_is_shown) {
    target.style.opacity = "0.0";
    target.style.display = "none";
    market_is_shown = false;
  }
  else {
    target.style.opacity = "1.0";  
    target.style.display = "block";
    market_is_shown = true;
  }
}

let help_is_shown = false;
function toggleHelp() {
  let target = document.getElementById("help");
  if (help_is_shown) {
    target.style.opacity = "0.0";  
    target.style.display = "none";
    help_is_shown = false;
  }
  else {
    target.style.display = "block";
    target.style.opacity = "0.95";  
    help_is_shown = true;
  }
}

// https://gist.github.com/sebleier/554280
const stopWords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];

function setupMintData(resultObj) {
  let objkt_file = {
    "title": "Upload OBJKT",
    "mimeType": "image/png",
  };
  objkt_file.reader = resultObj.dataUrl;
  objkt_file.buffer = resultObj.buffer;
  objkt_file.file = resultObj.blob;
  let md = resultObj.meta;
  let mint_info = resultObj.info;
  print(resultObj);

  // poor man's sanitation https://stackoverflow.com/a/23453651/1010653
  let tagstr = mint_info["title"].toLowerCase().replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
  let wordSplits = tagstr.split(/\s+/);
  // print("wordSplits");
  // console.log(wordSplits);
  let wordSet = new Set(wordSplits);
  // remove stopwords, etc
  stopWords.forEach(Set.prototype.delete, wordSet);
  // print("Wordset");
  // console.log(wordSet);
  let wordArray = Array.from(wordSet);
  // print("wordArray");
  // console.log(wordArray);
  let tags = wordArray.join(",") + ",pixray_objkt"
  // print("tags are " + tags);

  let desc = "Neural network image created by " + mint_info["creator"]
  if (mint_info["title"] == "(untitled)") {
    desc = desc + " with no title provided";
  }
  else {
    desc = desc + " from the given title '" + mint_info["title"] + "' ";
  }
  desc = desc + " on the pixray objkt tool at " + md["Source"]
  if (mint_info["optional_settings"] != "") {
    desc = desc + " with optional settings\n" + mint_info["optional_settings"] + "\n";
  }
  desc = desc + " (pixray v1.4b1)"

  let walletStr = getCurrentTzAddress();

  window.tz = window.tz || {};
  window.tz.minting_location = "none";
  window.tz.minting_wallet = walletStr;
  window.tz.mintData = {
    "title": mint_info["title"] + " (pixray_objkt)",
    "description": desc,
    "tags": tags,
    "royalties": 10,
    "file": objkt_file,
    "mint_fee": 2.0
  }
  window.tz.mintPrice = 2.0;

  result_is_ready = true;
  
	document.getElementsByTagName("iframe")[0].contentWindow.postMessage({
		name: 'mint_data',
		data: {
			// img: new_image,
			obj: resultObj,
			mintData: window.tz.mintData,
			wallet: getCurrentTzAddress(),
		}
	},mintIFrameOrigin)
	
  updateMintButton();
}

// helper function: blob to dataURL
// https://stackoverflow.com/a/30407959/1010653
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}

// take the image now on a canvas, add metadata, convert to blob, etc
function prepareImage(p5cb) {
  let img_w = p5cb.img.width;
  let img_h = p5cb.img.height;
  let mint_info = p5cb.mint_info;

  let walletStr = getCurrentTzAddress();
  let showName = walletStr
  window.tz = window.tz || {};
  if (window.tz.handle != null) {
    showName = window.tz.handle + " (" + walletStr + ")";
  }
  mint_info["creator"] = showName;
  cleanShowName = showName.replace(/[^\x00-\x7F]/g, "_");
  infoUrl = "https://pixray.gob.io/objkt/"
  let dateStr = new Date().toDateString();

      // "Seed":              mint_info["seed"],

  // annoyingly png metadata has to be latin-1 ... https://stackoverflow.com/a/20856346/1010653
  let meta_map = {
      "Title":             mint_info["title"].replace(/[^\x00-\x7F]/g, "_"),
      "Optional Settings": mint_info["optional_settings"].replace(/[^\x00-\x7F]/g, "_"),
      "Software":          "pixray" + " (" + mint_info["build"] + ")",
      "Creator":           cleanShowName,
      "Author":            "dribnet and " + cleanShowName,
      "Copyright":         "(c) 2021 Tom White (dribnet)",
      "Source":            infoUrl,
      "Created":           dateStr
    };

  let metadata = {
    "tEXt": meta_map
  }

  var offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = img_w;
  offscreenCanvas.height = img_h;
  var context = offscreenCanvas.getContext('2d');
  // background is flat white
  context.fillStyle="#FFFFFF";
  context.fillRect(0, 0, img_w, img_h);
  context.drawImage(p5cb.canvas, 0, 0, img_w, img_h);

  // https://jsfiddle.net/donmccurdy/jugzk15b/
  const mimeType = 'image/png';
  // Convert canvas to Blob, then Blob to ArrayBuffer.
  offscreenCanvas.toBlob((blob) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const arrayBuffer = reader.result;
      // console.log(arrayBuffer.byteLength + ' bytes.');
      // console.log(arrayBuffer);
      let uint8View = new Uint8Array(arrayBuffer);
      // console.log(uint8View[0], uint8View[1]);
      const chunks = extractChunks(uint8View);
      // console.log(chunks);
      insertMetadata(chunks, metadata);
      // console.log(chunks);
      let freshUint8View = encodeChunks(chunks)
      const newBlob = new Blob([freshUint8View.buffer], {type: mimeType});
      blobToDataURL(newBlob, function(dataurl){
        // https://stackoverflow.com/a/40606838/1010653
        // const parent = document.getElementById("offscreenContainer")
        // while (parent.firstChild) {
        //     parent.firstChild.remove()
        // }

        if (document.contains(document.getElementById("defaultCanvas1"))) {
                    document.getElementById("defaultCanvas1").remove();
        }

        // offscreenCanvas.remove();
        // offscreenCanvas.parentNode.removeChild(offscreenCanvas);
        setupMintData({"dataUrl":dataurl, "blob": newBlob,
                       "buffer": freshUint8View, "meta" : meta_map,
                       "info": mint_info});
      });
    });
    reader.readAsArrayBuffer(blob);
  }, mimeType);
}

// this method async runs a baby p5.js program to get the image on a canvas
async function beginFetchImage(img_src, mint_info) {
  var s = function( p ) {
    p.img = null;

    p.preload = function() {
      // console.log("P PRELOAD START")
      p.img = p.loadImage(img_src);
      // console.log("P PRELOAD END")
    }

    p.setup = function() {
      // console.log("P SETUP " +  p.img.width +","+ p.img.height)
      p.createCanvas(p.img.width, p.img.height);
      p.noLoop();
    };

    p.draw = function() {
      p.background(0);
      p.image(p.img, 0, 0);
      // console.log("P DRAW DONE " +  p.img.width +","+ p.img.height);
      // this is the callback to use the image for minting, etc.
      prepareImage(this);
	  return;
    }
  }

  let p5cb = new p5(s);
  p5cb.mint_info = mint_info;
  p5cb.redraw(); 
}

let result_is_ready = false;
let standby_image = "placeholder.png";
// update UI with either null (if processing) or a URL to a completed image
async function refreshResult(new_image, mint_info=null) {
  // let target = document.getElementById("result_img");
  if (new_image == null) {
    result_is_ready = false;
    // target["src"] = standby_image;
    updateMintButton();
  }
  else {
    // target["src"] = new_image;
    // beginFetchImage(standby_image); // <- use this when CORS debugging
    print("THIS IS THE FILE: " + new_image)
    await beginFetchImage(new_image, mint_info);
  }
  // console.log("UPDATED TO " + new_image);
}

async function mintTheArtwork(mint_params){
	console.log('mintTheArtwork',mint_params)
	 mintingError = ""
	try {
		
		const contract = await window.tz.Tezos.wallet.at("KT1Aq4wWmVanpQhq4TTfjZXB5AjFpx15iQMM");
		const op = await window.tz.Tezos.wallet.batch()
			.withContractCall(contract.methods.mint_artist(
					mint_params.collection_id,
					mint_params.editions,
					mint_params.token_metadata_cid_bytes,
					mint_params.creator_wallet
			))
			.withTransfer({ to: 'tz2XLyo68rXjNWKKiNdVJQahmYMrBAjffgob', amount: 1 }) //pixray
			.withTransfer({ to: 'tz1i49t5VkqZ3hcScXLpzCUpifhL1dhrteBf', amount: 1 }) //frostbitten payouts
			// .withTransfer({ to: mint_params.creator_wallet, amount: 1, mutez: true }) //test
			.send();

		console.log('Operation hash:', op.hash);
		await op.confirmation(); 
		return { success: true, opHash: op.hash };
		
	} catch (error) {
		console.log(error);
		if( typeof error === "string" ){
			mintingError = error
		}else if( typeof error === "objkt" && "message" in error ){
			mintingError = error.message
		}else 
		return { success: false, opHash: "" };
	}
}

function testMessage(){
	
	const msg = JSON.parse('{"name":"replicate.prediction","data":{"status":"success","error":null,"inputs":{"title":"gradients","quality":"mintable","optional_settings":"iterations: 0"},"output_text":null,"output_file":"/api/models/dribnet/pixray-genesis/files/0fceb196-96bc-498c-9797-2af9ce73665c/tempfile.png"}}')
	respondToMessage(msg)
}

// update UI when processing starts or stops
function respondToMessage(d) {
  // console.log(d);
  if (d.hasOwnProperty('name') && d.hasOwnProperty('data') && (d["name"] == "mint_artwork")) {
	  mintTheArtwork(d["data"])
  }
  if (!d.hasOwnProperty('name') || (d["name"] != "replicate.prediction")) {
    // console.log("NO PREDICTION")
    return;
  }
  if (d["data"]["status"] == "success") {
    if(d["data"]["inputs"]["quality"].trim() == "draft") {
      // console.log("DRAFT COMPLETE")
      return;      
    }
    let title = "";
    if (d["data"]["inputs"].hasOwnProperty('title')) {
      title = d["data"]["inputs"]["title"].trim();
    }
    let optional_settings = "";
    if (d["data"]["inputs"].hasOwnProperty('optional_settings')) {
      optional_settings = d["data"]["inputs"]["optional_settings"].trim();
    }
    if (title == "") {
      title = "(untitled)";
    }
    let mint_info = {
      "title": title,
      "optional_settings": optional_settings,
      "seed": "seed pending",
      "build": "v1.4b1",
	  "filename": d["data"]["output_file"].split('files/')[1].split('/')[0]+'.png'
    }
    refreshResult("https://replicate.com" + d["data"]["output_file"], mint_info);
  }
  else if (result_is_ready) {
    refreshResult(null);
  }
}

// listen for messages coming from replicate.com embed
window.addEventListener("message", (event) => {
  respondToMessage(event.data);
})
