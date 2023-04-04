module.exports = {  
  publicPath : '/',
  devServer: {
    proxy: {
      '^/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true, // so CORS doesn't bite us. 
      }
    }
  }
}