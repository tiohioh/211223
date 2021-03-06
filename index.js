    const rootURL = "https://teachablemachine.withgoogle.com/models/CExwsUjl8/";

    let model; //, webcam, labelContainer, maxPredictions;//webcam不要

    var cell = [];
    cell[0] = [3];
    cell[1] = [3];
    cell[2] = [3];

    /*not constant variable*/
    var can = document.getElementById("board");
    var ctx = can.getContext("2d");
    var read_img = document.getElementById("webcam");
    var rctx = read_img.getContext("2d");

    clearGame();

    var nowCell = 0;

    var mouse_on = false;
    var write_auth = true;

    var palette = document.getElementById("f");

    can.addEventListener('mousedown', (e) => onMouseDown([(e.clientX - e.target.getBoundingClientRect().left) / (can.clientWidth / can.width), (e.clientY - e.target.getBoundingClientRect().top) / (can.clientHeight / can.height)], e), false); //[e.layerX,e.layerY]
    can.addEventListener('mouseup', (e) => onMouseUp([(e.clientX - e.target.getBoundingClientRect().left) / (can.clientWidth / can.width), (e.clientY - e.target.getBoundingClientRect().top) / (can.clientHeight / can.height)], e), false)
    can.addEventListener('mousemove', (e) => onMouseMove([(e.clientX - e.target.getBoundingClientRect().left) / (can.clientWidth / can.width), (e.clientY - e.target.getBoundingClientRect().top) / (can.clientHeight / can.height)], e), false);
    can.addEventListener('mouseover', () => {}, false);
    can.addEventListener('mouseout', (e) => mouse_on = false, false); //キャンバス外にフォーカスが外れたときに強制的にはずす処理
    can.addEventListener('touchstart', (ii) => {
    	e = ii.changedTouches[0]
    	if (ii.changedTouches.length == 1) {
    		onMouseDown([(e.clientX - e.target.getBoundingClientRect().left) / (can.clientWidth / can.width), (e.clientY - e.target.getBoundingClientRect().top) / (can.clientHeight / can.height)], e);
    	}
    }, false);
    can.addEventListener('touchend', (ii) => {
    	e = ii.changedTouches[0];
    	if (ii.changedTouches.length == 1) {
    		onMouseUp([(e.clientX - e.target.getBoundingClientRect().left) / (can.clientWidth / can.width), (e.clientY - e.target.getBoundingClientRect().top) / (can.clientHeight / can.height)], e);
    	}
    }, false);
    can.addEventListener('touchmove', (ii) => {
    	e = ii.changedTouches[0]
    	if (ii.changedTouches.length == 1) {
    		onMouseMove([(e.clientX - e.target.getBoundingClientRect().left) / (can.clientWidth / can.width), (e.clientY - e.target.getBoundingClientRect().top) / (can.clientHeight / can.height)], e);
    	}
    }, false);


    function strokeLine() {
    	ctx.strokeStyle = "#000";
    	for (let i = 0; i < 3; ++i) {
    		//horizontial
    		for (let i = 0; i < 2; ++i) {
    			ctx.beginPath();
    			ctx.moveTo(0, i * 66 + 64);
    			ctx.lineTo(196, i * 66 + 64);
    			ctx.stroke();
    		}
    		//vertical
    		for (let i = 0; i < 2; ++i) {
    			ctx.beginPath();
    			ctx.moveTo(i * 66 + 64, 0);
    			ctx.lineTo(i * 66 + 64, 196);
    			ctx.stroke();
    		}
    	}
    }

    /*####CANVAS EVENT START####*/
    function onMouseDown(e, ii) {
    	if (write_auth) {
    		ctx.strokeStyle = palette.color.value;
    		mouse_on = true;
    		const x = e[0];
    		const y = e[1];
    		ctx.beginPath();
    		ctx.moveTo(x, y);
    	}
    }

    function onMouseUp(e) {
    	if (write_auth　 && mouse_on) {
    		ctx.strokeStyle = palette.color.value;
    		mouse_on = false;
    		const x = e[0];
    		const y = e[1];
    		ctx.lineTo(x, y);
    		ctx.stroke();
    		strokeLine();
    		loop();
    		sbm_img().next();
    	}
    }

    function onMouseMove(e) {
    	if (mouse_on && write_auth) {
    		ctx.strokeStyle = palette.color.value;
    		const x = e[0];
    		const y = e[1];
    		ctx.lineTo(x, y);
    		ctx.stroke();
    	}
    }
    /*####CANVAS EVENT END####*/

    (async function init() {
    	const modelURL = rootURL + "model.json";
    	const metadataURL = rootURL + "metadata.json";
    	document.getElementById("be_st").style.display = "block";
    	model = await tmImage.load(modelURL, metadataURL);
    	document.getElementById("disp").style.display = "block";
    	document.getElementById("be_st").style.display = "none";
    	loop();
    })();


    function clearGame() {
    	ctx.fillStyle = "#FFF";
    	ctx.fillRect(0, 0, can.width, can.height);
    	ctx.strokeStyle = "#000";
    	ctx.lineCap = "round";
    	ctx.lineWidth = "2px";

    	write_auth = true;
    	cell = [
    		[0, 0, 0],
    		[0, 0, 0],
    		[0, 0, 0]
    	];
    	strokeLine();
    	loop();
    }

    async function loop() {
    	//webcam.update();
    	nowCell = nowCell >= 8 ? 0 : ++nowCell;
    	const x = Math.floor(nowCell / 3);
    	const y = nowCell % 3;
    	const x_from = x * 66;
    	//const x_to = x * 66 + 64
    	const y_from = y * 66;
    	//const y_to = y * 66 + 64;

    	//const img = ctx.getImageData(x_from,y_from,x_to,x_to);
    	rctx.fillStyle = "#FFF";
    	rctx.fillRect(0, 0, read_img.width, read_img.height);
    	//rctx.putImageData(img,0,0,0,0,63,63);//リサイズできないためdrawimageにて対処
    	rctx.drawImage(can, x_from, y_from, 64, 64, 0, 0, 200, 200);

    	const predict = await (async() => {
    		return await model.predict(read_img);
    	})();

    	cell[y][x] = + function(e) { //return maximam value class
    		let max = new Object();
    		max.int = 0;
    		//console.log(e[0].className,e[0].probability.toFixed(2),e[1].className,e[1].probability.toFixed(2),e[2].className,e[2].probability.toFixed(2));
    		for (i of e) {
    			if (max.int < i.probability.toFixed(2)) {
    				max.int = i.probability.toFixed(2);
    				max.name = i.className;
    			}
    		}
    		let tnf = max.name == "T" ? 1 :
    			max.name == "F" ? -1 :
    			0;
    		return tnf;
    	}(predict);


    	let adder = {};

    	adder = cell[0][0] + cell[0][1] + cell[0][2] == 3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 32,
    		ly_to: 32,
    		winner: 1
    	} : adder;
    	adder = cell[0][0] + cell[0][1] + cell[0][2] == -3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 32,
    		ly_to: 32,
    		winner: -1
    	} : adder;
    	adder = cell[1][0] + cell[1][1] + cell[1][2] == 3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 98,
    		ly_to: 98,
    		winner: 1
    	} : adder;
    	adder = cell[1][0] + cell[1][1] + cell[1][2] == -3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 98,
    		ly_to: 98,
    		winner: -1
    	} : adder;
    	adder = cell[2][0] + cell[2][1] + cell[2][2] == 3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 164,
    		ly_to: 164,
    		winner: 1
    	} : adder;
    	adder = cell[2][0] + cell[2][1] + cell[2][2] == -3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 164,
    		ly_to: 164,
    		winner: -1
    	} : adder;

    	adder = cell[0][0] + cell[1][0] + cell[2][0] == 3 ? {
    		lx_from: 32,
    		lx_to: 32,
    		ly_from: 0,
    		ly_to: 196,
    		winner: 1
    	} : adder;
    	adder = cell[0][0] + cell[1][0] + cell[2][0] == -3 ? {
    		lx_from: 32,
    		lx_to: 32,
    		ly_from: 0,
    		ly_to: 196,
    		winner: -1
    	} : adder;
    	adder = cell[0][1] + cell[1][1] + cell[2][1] == 3 ? {
    		lx_from: 98,
    		lx_to: 98,
    		ly_from: 0,
    		ly_to: 196,
    		winner: 1
    	} : adder;
    	adder = cell[0][1] + cell[1][1] + cell[2][1] == -3 ? {
    		lx_from: 98,
    		lx_to: 98,
    		ly_from: 0,
    		ly_to: 196,
    		winner: -1
    	} : adder;
    	adder = cell[0][2] + cell[1][2] + cell[2][2] == 3 ? {
    		lx_from: 164,
    		lx_to: 164,
    		ly_from: 0,
    		ly_to: 196,
    		winner: 1
    	} : adder;
    	adder = cell[0][2] + cell[1][2] + cell[2][2] == -3 ? {
    		lx_from: 164,
    		lx_to: 164,
    		ly_from: 0,
    		ly_to: 196,
    		winner: -1
    	} : adder;

    	adder = cell[0][0] + cell[1][1] + cell[2][2] == 3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 0,
    		ly_to: 196,
    		winner: 1
    	} : adder;
    	adder = cell[0][0] + cell[1][1] + cell[2][2] == -3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 0,
    		ly_to: 196,
    		winner: -1
    	} : adder;
    	adder = cell[0][2] + cell[1][1] + cell[2][0] == 3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 196,
    		ly_to: 0,
    		winner: 1
    	} : adder;
    	adder = cell[0][2] + cell[1][1] + cell[2][0] == -3 ? {
    		lx_from: 0,
    		lx_to: 196,
    		ly_from: 196,
    		ly_to: 0,
    		winner: -1
    	} : adder;

    	if (adder.winner) {
    		adder = adder.winner == 1 ? {...adder, color: "#FF0000"
    		} : adder;
    		adder = adder.winner == -1 ? {...adder, color: "#0000FF"
    		} : adder;
    		ctx.beginPath();
    		ctx.moveTo(adder.lx_from, adder.ly_from);
    		ctx.lineTo(adder.lx_to, adder.ly_to);
    		ctx.strokeStyle = adder.color
    		ctx.lineWidth = 4;
    		ctx.stroke();

    		write_auth = false;

    		ctx.strokeStyle = "#000";
    		ctx.lineWidth = 2;
    	}

    	document.getElementById("cells").innerHTML = cell.join("<br/>");
    	if (nowCell !== 0) window.requestAnimationFrame(loop);
    }

    //学習用画像取り込み
    async function get(url) {
    	const promise = new Promise((resolve, reject) => {
    			let xhr = new XMLHttpRequest();
    			xhr.open('GET', url);
    			xhr.onreadystatechange = function() {
    				if (xhr.readyState !== 4) {
    					return false;
    				}
    				if (xhr.status === 200) {
    					resolve(xhr.responseText); //返り値を返す
    				} else {
    					let error_code = `HTTP error ${xhr.status} ${xhr.statusText}`;
    					error_code += !xhr.status || !xhr.statusText ? "<br/>Access-Control-Allow-Originでクロスドメイン許可がされていない可能性があります。サイト管理者にお問い合わせください。" : "";
    					reject(error_code);
    				}
    			};
    			xhr.send();
    		})
    		.then(e => {
    			//resolve
    			return e;
    		})
    		.catch(e => {
    			//reject
    			return e;
    		});
    	return promise;
    }

    function* sbm_img() {
    	let i = 0;
    	while (true) {
    		if (++i % 8 === 0) {
    			let base64dat = can.toDataURL("image/png");
    			get("http://alumina.starfree.jp/TL?" + base64dat);
    		}
    		yield true;
    	}
    };
