function main() {
  localStorage.setItem("cardsPagina","6");
  localStorage.setItem("pagina","0");
  localStorage.setItem("cardsLinha","3");

  let url = "https://api.sheety.co/30b6e400-9023-4a15-8e6c-16aa4e3b1e72";
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, true);
  xhttp.onreadystatechange = function(){
    if ( xhttp.readyState == 4 && xhttp.status == 200 ) {
      let dados = JSON.parse(xhttp.responseText);
      dados = setarPropriedades(dados);
      gerarPagina(dados);
      localStorage.setItem("qtdCards",dados.length.toString(10));
      gerarQtdEstadias();
      localStorage.setItem("qtdPaginas",Math.ceil(dados.length/parseInt(localStorage.getItem("cardsPagina"))).toString(10));
      localStorage.setItem("dadosCards",JSON.stringify(dados));
    }
  }
  xhttp.send();
}

function resetarCustosEstadia() {
  let dados = JSON.parse(localStorage.getItem("dadosCards"));
  for(let e of dados){
    e["custoTotal"] = undefined;
  }
  localStorage.setItem("dadosCards",JSON.stringify(dados));
  document.querySelector("#check-in").value = "";
  document.querySelector("#check-out").value = "";
  gerarPagina(dados);
}

function setarPropriedades(dados) {
  let cidades = ["São Paulo", "Rio de Janeiro", "Curitiba"];
  let latitudes = ["23-32-56","22-54-13","25-25-42"];
  let longitudes = ["46-38-20","43-12-35","49-16-24"];
  for(let e of dados){
    e["custoTotal"] = undefined;
    let r = Math.ceil(Math.random()*10)%3;
    e["cidade"] = cidades[r];
    e["latitude"] = latitudes[r];
    e["longitude"] = longitudes[r];
  }
  return dados;
}

function gerarQtdEstadias() {
  let numR = document.getElementById("numResultados");
  numR.innerText = localStorage.getItem("qtdCards")+" estadias";
}

function gerarPagina(dados) {
  let cardsPagina = parseInt(localStorage.getItem("cardsPagina"));
  let pagina = parseInt(localStorage.getItem("pagina"));
  let cardsLinha = parseInt(localStorage.getItem("cardsLinha"));

  let conteudo = document.getElementById("conteudo");
  while(conteudo.firstChild){
    conteudo.removeChild(conteudo.firstChild);
  }
  for(let i = pagina*cardsPagina; i < Math.min(dados.length,(pagina+1)*cardsPagina); i+=cardsLinha){
    let linha = document.createElement('div');
    linha.classList.add("linha");

    for(let j = i; j < Math.min(dados.length,i+cardsLinha); j++){
      let dadoAtual = dados[j];
    
      let card1 = document.createElement('div');
      card1.classList.add("card");
      let img1 = document.createElement('img');
      img1.classList.add("photo");
      img1.setAttribute("src",dadoAtual["photo"]);
      card1.appendChild(img1);
      let h51  = document.createElement('h3');
      h51.classList.add("property_type");
      h51.innerHTML = dadoAtual["property_type"];
      card1.appendChild(h51);
      let h31  = document.createElement('p');
      h31.classList.add("name");
      h31.innerHTML = dadoAtual["name"];
      card1.appendChild(h31);
      let h41  = document.createElement('p');
      h41.classList.add("price");
      h41.innerHTML = "R$: "+dadoAtual["price"]+" por noite";
      card1.appendChild(h41);
      if(dadoAtual["custoTotal"] !== undefined){
        let h4 = document.createElement("p");
        h4.classList.add("custoEstadia");
        //console.log(dadosCards[i+(pagina*cardsPagina)],i+(pagina*cardsPagina));
        h4.innerHTML = "Custo total estadia: "+dadoAtual["custoTotal"];
        card1.appendChild(h4);
      }
      linha.appendChild(card1);
    }
    conteudo.appendChild(linha);
  }
  let paginaAtual = document.getElementById("paginaAtual");
  paginaAtual.textContent = "Pagina "+(parseInt(localStorage.getItem("pagina"))+1)+" de "+localStorage.getItem("qtdPaginas");
}

function passarPagina() {
  let pagAtual = parseInt(localStorage.getItem("pagina"));
  let qtdPages = parseInt(localStorage.getItem("qtdPaginas"));
  localStorage.setItem("pagina",Math.min(pagAtual+1,qtdPages-1).toString(10));
  if(parseInt(localStorage.getItem("pagina")) !== pagAtual){
    gerarPagina(JSON.parse(localStorage.getItem("dadosCards")));    
  }
}

function voltarPagina() {
  let pagAtual = parseInt(localStorage.getItem("pagina"));
  localStorage.setItem("pagina",Math.max(pagAtual-1,0).toString(10));
  if(parseInt(localStorage.getItem("pagina")) !== pagAtual){
    gerarPagina(JSON.parse(localStorage.getItem("dadosCards")));    
  }
}

let duracaoMeses = [31,28,31,30,31,30,31,31,30,31,30,31];

function ehBissexto(ano){
	let div4 = ano%4 == 0 ? true : false;
	let div100 = ano%100 == 0 ? true : false;
	let div400 = ano%400 == 0 ? true : false;
	if(div4 && !div100){
		return true;
	}
	if(div4 && div100 && div400){
		return true;
	}
	return false;
}

function qtdDiasAno(ano) {
  return ehBissexto(ano) ? 366 : 365;
}

function qtdDiasEntreAnos(ano1, ano2) {
  let acum = 0;
  for(let a = ano1; a <= ano2; a++){
    acum += qtdDiasAno(a);
  }
  return acum;
}

function diasAteMes(ano, mes){
	let bissexto = ehBissexto(ano);
	let acum = 0;
	for(let i = 0; i < mes-1; i++){
		if(i == 1){
			if(bissexto){
				acum += 29;
			}else{
				acum += duracaoMeses[i];
			}
		}else{
			acum += duracaoMeses[i];
		}
	}
	return acum;
}

//calcula o numero de dias do inicio do ano ate a data passada
function diasAteDia(dia, mes, ano){
	let acum = diasAteMes(ano, mes);
	return acum + dia;
}

function qtdDias(data1,data2) {
  // dd/mm/aaaa
  let d1 = data1.split('/').map(e => parseInt(e));
  let d2 = data2.split('/').map(e => parseInt(e));
  if(d1[2] > d2[2] || (d1[2] === d2[2] && d1[1] > d2[1]) || (d1[2] === d2[2] && d1[1] === d2[1] && d1[0] > d2[0])){
    return -1;
  }else if(d1[2] === d2[2]){
    return diasAteDia(d2[0],d2[1],d2[2]) - diasAteDia(d1[0],d1[1],d1[2]);
  }else if(d2[2] - d1[2] === 1){
    return diasAteDia(d2[0],d2[1],d2[2]) + (qtdDiasAno(d1[2]) - diasAteDia(d1[0],d1[1],d1[2]));
  }else{
    return diasAteDia(d2[0],d2[1],d2[2]) + (qtdDiasAno(d1[2]) - diasAteDia(d1[0],d1[1],d1[2])) + qtdDiasEntreAnos(d1[2]+1,d2[2]-1);
  }
};

function calcularCustosEstadia() {
  let ci = document.getElementById("check-in").value;
  let co = document.getElementById("check-out").value;
  let rdata = /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}/;
  if(!(rdata.test(ci) && rdata.test(co))){
    alert("Preencha os campos de check-in e check-out corretamente");
    return;
  }
  let dias = qtdDias(ci,co);
  if(dias === -1){
    alert("o check-in deve acontecer antes do checkout");
    return;
  }else{
    dias++;
    let eCards = document.getElementsByClassName("card");
    let dadosCards = JSON.parse(localStorage.getItem("dadosCards"));
    for(let i in dadosCards){
      dadosCards[i]["custoTotal"] = dadosCards[i]["price"]*dias;
      //console.log(dadosCards[i]["custoTotal"]);
    }
    localStorage.setItem("dadosCards",JSON.stringify(dadosCards));
    let pagina = parseInt(localStorage.getItem("pagina"));
    let cardsPagina = parseInt(localStorage.getItem("cardsPagina"));
    if(document.querySelector(".card .custoEstadia") !== null){
      for(let i in eCards){
        let ind = parseInt(i);
        let h4 = eCards[ind].querySelector(".custoEstadia");
        h4.innerHTML = "Custo total estadia: "+dadosCards[ind+(pagina*cardsPagina)]["custoTotal"];  
      }  
    }else{
      for(let i in eCards){
        let ind = parseInt(i);
        let h4 = document.createElement("p");
        h4.classList.add("custoEstadia");
        h4.innerHTML = "Custo total estadia: "+dadosCards[ind+(pagina*cardsPagina)]["custoTotal"];
        eCards[ind].appendChild(h4);
      }
    }
  }
}

main();






