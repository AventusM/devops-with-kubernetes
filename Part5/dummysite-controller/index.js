const k8s = require('@kubernetes/client-node');
const mustache = require('mustache');
const request = require('request');
const JSONStream = require('json-stream');
const fs = require('fs').promises;

const DEPLOYMENT_KIND = 'deployment';
const SERVICE_KIND = 'service';
const INGRESS_KIND = 'ingress';
const POST_VERB = 'post';
const ADDED_STREAM_TYPE = 'ADDED';

// Use Kubernetes client to interact with Kubernetes
const kc = new k8s.KubeConfig(); // Has to be at the top (initalize before call it...)

process.env.NODE_ENV === 'development'
  ? kc.loadFromDefault()
  : kc.loadFromCluster();

const opts = {};
kc.applyToRequest(opts);

const client = kc.makeApiClient(k8s.CoreV1Api);

const sendRequestToApi = async (api, method = 'get', options = {}) =>
  new Promise((resolve, reject) =>
    request[method](
      `${kc.getCurrentCluster().server}${api}`,
      { ...opts, ...options, headers: { ...options.headers, ...opts.headers } },
      (err, res) => (err ? reject(err) : resolve(JSON.parse(res.body))),
    ),
  );

const fieldsFromDummySite = (object) => ({
  dummysite_app_name: object.metadata.name,
  deployment_name: `${object.metadata.name}-${DEPLOYMENT_KIND}`,
  service_name: `${object.metadata.name}-${SERVICE_KIND}`,
  ingress_name: `${object.metadata.name}-${INGRESS_KIND}`,
  namespace: object.metadata.namespace,
  image: object.spec.image,
  website_url: object.spec.website_url,
});

const getFileYAML = async (kind, fields) => {
  const typeTemplate = await fs.readFile(`${kind}.mustache`, 'utf-8');
  return mustache.render(typeTemplate, fields);
};

// Absolutely mandatory, re-deployments will result in errors without this check
const deployed = async (fields) => {
  const { dummysite_app_name, namespace } = fields;
  const { items } = await sendRequestToApi(
    generateApiVersionUrl(DEPLOYMENT_KIND, namespace),
  );

  return items.find(
    (item) =>
      item.metadata.labels &&
      item.metadata.labels.target === dummysite_app_name,
  ); // NOTE That only deployments have labels, this will crash without labels field check existing
};

// URLs from apiVersion from each kind
// https://v1-18.docs.kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#-strong-api-overview-strong
// Go to create kind and use url similar to what is used in deployments (varies between kinds)

// --- EXAMPLE BELOW ---
// HTTP Request
// POST /apis/apps/v1/namespaces/{namespace}/deployments <--
const generateApiVersionUrl = (kind, namespace) => {
  if (kind === DEPLOYMENT_KIND) {
    return `/apis/apps/v1/namespaces/${namespace}/deployments`;
  }
  if (kind === SERVICE_KIND) {
    return `/api/v1/namespaces/${namespace}/services`;
  }
  if (kind === INGRESS_KIND) {
    return `/apis/extensions/v1beta1/namespaces/${namespace}/ingresses`;
  }
};

const createKind = async (kind, fields) => {
  const namespace = fields.namespace;
  const yaml = await getFileYAML(kind, fields);
  const apiUrl = generateApiVersionUrl(kind, namespace);
  console.log(`Creating resource "${kind}" to namespace "${namespace}"`);

  return sendRequestToApi(apiUrl, POST_VERB, {
    headers: {
      'Content-Type': 'application/yaml',
    },
    body: yaml,
  });
};

const createResourcesFrom = async (fields) => {
  await createKind(DEPLOYMENT_KIND, fields);
  await createKind(SERVICE_KIND, fields);
  await createKind(INGRESS_KIND, fields);
};

const run = async () => {
  (await client.listPodForAllNamespaces()).body; // A bug in the client(?) was fixed by sending a request and not caring about response
  const stream = new JSONStream();

  // No delete type seems to be available in this instance as the program just crashes on kubectl delete -f ...
  stream.on('data', async ({ type, object }) => {
    const fields = fieldsFromDummySite(object);
    console.log('Streamed object of type: ', type);
    console.log('Object itself', object);

    // Deletion doesn't seem to be even necessary in the assignment
    if (type === ADDED_STREAM_TYPE && (await deployed(fields))) {
      return;
    } else if (type === ADDED_STREAM_TYPE) {
      await createResourcesFrom(fields);
    }
  });

  request
    .get(
      `${
        kc.getCurrentCluster().server
      }/apis/stable.dwk/v1/dummysites?watch=true`, // Adjusted to dummysites apiVersion
      opts,
    )
    .pipe(stream);
};

run();
