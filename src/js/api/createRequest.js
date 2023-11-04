const createRequest = async (options = {}) => {
  const response = await fetch(options.url, {
    method: options.method,
    body: JSON.stringify(options.data),
  });

  const json = await response.json();

  return json;
};

export default createRequest;
