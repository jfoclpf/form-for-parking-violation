## API

A API JSON da base de dados encontra-se em `api.denuncia-estacionamento.app`, providenciando de forma aberta e gratuita informação completamente anónima das ocorrências recebidas.

A API segue o padrão [JSON:API](https://jsonapi.org/).

### Lista de infrações

A lista de infrações e respetivos códigos pode ser obtida em [/penalties_list](https://api.denuncia-estacionamento.app/penalties_list)

Receberá algo como

```json
    {
      "id": "passeios",
      "type": "penalty",
      "attributes": {
        "code": "passeios",
        "description": "Sobre uma zona exclusivamente pedonal",
        "base_legal": "Violação da alínea f) do n.º 1 do art.º 49.º do Código da Estrada"
      }
    },
    {
      "id": "na_passadeira",
      "type": "penalty",
      "attributes": {
        "code": "na_passadeira",
        "description": "Numa passadeira, ou seja, numa zona legalmente sinalizada para travessia de peões",
        "base_legal": "Violação da alínea d) do n.º 1 do art.º 49.º do Código da Estrada"
      }
    },
```

Deve usar depois o `id` para fazer pedidos ao caminho `/penalties/{penaldyId}`

## Exemplo

Por exemplo o pedido [/penalties/passeios](https://api.denuncia-estacionamento.app/penalties/passeios) retorna todas as infrações relacionadas com veículos estacionados numa zona exclusivamente pedonal:

```json
{
  "meta": {
    "author": "João Pimentel Ferreira",
    "url": "https://api.denuncia-estacionamento.app",
    "standard": "JSON:API v1.1",
    "path": "/penalties/passeios",
    "penalty": {
      "code": "passeios",
      "description": "Sobre uma zona exclusivamente pedonal",
      "base_legal": "Violação da alínea f) do n.º 1 do art.º 49.º do Código da Estrada"
    }
  },
  "data": [
    {
      "id": "822df419-af9e-11ec-ad15-0050563c897b",
      "type": "penalty_record",
      "attributes": {
        "data_data": "2020-06-14T22:00:00.000Z",
        "data_hora": "09:17:00",
        "data_coord_latit": 38.7007,
        "data_coord_long": -9.23914,
        "autoridade": "Polícia de Segurança Pública - Geral"
      }
    },
    {
      "id": "822df566-af9e-11ec-ad15-0050563c897b",
      "type": "penalty_record",
      "attributes": {
        "data_data": "2020-06-14T22:00:00.000Z",
        "data_hora": "14:33:00",
        "data_coord_latit": 38.7872,
        "data_coord_long": -9.19271,
        "autoridade": "Polícia de Segurança Pública - Geral"
      }
    },

```
