//campos "description" e "law_article" devem ser condicentes gramaticalmente com a mensagem que será gerada
//exemplo: "a viatura encontrava-se estacionada" + description + ", em violação" + law_article


var PENALTIES = {
    passeios : {
        select     : "Passeio ou zona pedonal",
        description: "sobre uma zona exclusivamente pedonal",
        law_article: "da alínea f) do n.º 1 do art.º 49.º do Código da Estrada"
    },
    passadeiras : {
        select     : "Menos de 5 m. antes de passadeira",
        description: "a menos de 5 metros antes de uma zona legalmente sinalizada para travessia de peões",
        law_article: "da alínea d) do n.º 1 do art.º 49.º do Código da Estrada"
    },
    ciclovia : {
        select     : "Sobre ciclovia",
        description: "sobre uma pista para velocípedes",
        law_article: "da alínea f) do n.º 1 do art.º 49.º do Código da Estrada"      
    },    
    travessia_ciclovia : {
        select     : "Menos de 5 m. antes de travessia de ciclovia",
        description: "a menos de 5 metros antes da travessia de uma pista para velocípedes",
        law_article: "da alínea d) do n.º 1 do art.º 49.º do Código da Estrada"   
    },
    antes_semaforo : {
        select     : "Menos de 20 m. antes de semáforo, se o veículo os encobrir",
        description: "a menos de 20 metros antes de semáforos, sendo que no presente caso o veículo os encobria",
        law_article: "da alínea e) do n.º 1 do art.º 49.º do Código da Estrada"      
    },
    rotunda : {
        select     : "Placa central de rotunda",
        description: "sobre uma placa central de rortunda",
        law_article: "da alínea f) do n.º 1 do art.º 49.º do Código da Estrada"   
    },
    deficiente : {
        select     : "Lugar de pessoa com deficiência",
        description: "num lugar reservado a pessoa com deficiência",
        law_article: "da alínea q) do n.º 1 do art.º 145.º do Código da Estrada, sendo por conseguinte uma contraordenação grave"   
    },
    eletrico : {
        select     : "Lugar de veículo elétrico",
        description: "num lugar reservado a um veículo automóvel elétrico",
        law_article: "da alínea g) do n.º 2 do artigo 164.º do Código da Estrada"   
    },
    residentes_apenas:{
        select      : "Estacionamento indevido em zona de residentes",
        decription  : "num lugar em zona de residentes sem que tenha o correspondente título que a habilita a tal",
        law_article : "da alínea f) do n.º 1 do artigo 50.º do Código da Estrada"
    },
    abandonado:{
        select      : "Veículo estacionado na rua há mais de um mês",
        decription  : "em local da via pública há pelo menos 30 dias ininterruptos",
        law_article : "da alínea a) do n.º 1 do artigo 163.º do Código da Estrada"        
    }
};

