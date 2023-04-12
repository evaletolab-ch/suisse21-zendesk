module.exports = {  
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  devServer: {
    proxy: {
      '^/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true, // so CORS doesn't bite us. 
      }
    }
  }
}