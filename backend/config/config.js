const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://learning-hub-api.zoonou.com'
    : 'http://localhost:10000'
};

export default config;
