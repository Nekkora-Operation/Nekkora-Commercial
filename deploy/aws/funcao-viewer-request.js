// CloudFront Function (runtime cloudfront-js-2.0), evento viewer-request da distribuição do Commercial.
// COM-RELEASE-003-D/F — mantida em JavaScript ES5 (o runtime não aceita módulos nem toda a sintaxe moderna).
//
// 1. www.nekkora.com → https://nekkora.com (301), preservando caminho e query string: o endereço canônico é o apex.
// 2. Prefixo interno _releases/ (manifestos e cópias de cada release, usados no rollback): nunca servido. A URI vira
//    um objeto inexistente → o S3 responde 403 → a resposta de erro da distribuição devolve /404.html com status 404.
//    A política do bucket também nega esse prefixo ao CloudFront (defesa em profundidade).
//
// Testada por scripts/testes/funcao-cloudfront.test.mjs e aplicada pelo servidor local de homologação.
var CANONICAL_HOST = 'nekkora.com';

function queryString(qs) {
  var parts = [];
  for (var name in qs) {
    var item = qs[name];
    var values = item.multiValue ? item.multiValue : [item];
    for (var i = 0; i < values.length; i++) {
      parts.push(values[i].value === '' ? name : name + '=' + values[i].value);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value.toLowerCase() : '';
  if (host === 'www.' + CANONICAL_HOST) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + CANONICAL_HOST + request.uri + queryString(request.querystring) },
        'strict-transport-security': { value: 'max-age=31536000; includeSubDomains' },
        'cache-control': { value: 'max-age=3600' },
      },
    };
  }
  var path = request.uri;
  try {
    path = decodeURIComponent(request.uri);
  } catch (e) {
    // URI com escape inválido: segue como veio (o S3 não encontra o objeto e a distribuição responde 404)
  }
  if (path.toLowerCase().indexOf('/_releases') === 0) {
    request.uri = '/_bloqueado';
  }
  return request;
}
