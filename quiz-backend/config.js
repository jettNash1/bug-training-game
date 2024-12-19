const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-render-service-name.onrender.com'
    : 'http://localhost:8080'
};

export default config;
