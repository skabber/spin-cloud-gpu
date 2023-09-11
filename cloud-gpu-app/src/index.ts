import {
  Config,
  HandleRequest,
  HttpRequest,
  HttpResponse,
  InferencingOptions,
  Llm,
  Router,
} from "@fermyon/spin-sdk";

function validateRequest(headers: Record<string, string>): boolean {
  if (headers["authorization"] === `bearer ${Config.get("auth_token")}`) {
    return true;
  }
  return false;
}

interface InferenceParams {
  model: string;
  prompt: string;
  options?: InferencingOptions;
}

function infer(data: HttpRequest): HttpResponse {
  validateRequest(data.headers);
  let params = data.json() as InferenceParams;
  let response = Llm.infer(params.model, params.prompt, params.options);

  return {
    status: 200,
    headers: { "content-type": "text/html" },
    body: JSON.stringify(response),
  };
}

interface EmbeddingParams {
  model: string;
  input: string[];
}

function embed(data: HttpRequest): HttpResponse {
  validateRequest(data.headers);
  let params = data.json() as EmbeddingParams;
  let response = Llm.generateEmbeddings(params.model, params.input);
  return {
    status: 200,
    headers: { "content-type": "text/html" },
    body: JSON.stringify(response),
  };
}

let router = Router();
router.get("/infer", (_, req) => {
  return infer(req);
});
router.get("/embedd", (_, req) => {
  return embed(req);
});

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  return await router.handleRequest(request, request);
};