// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // 👈 Cambiamos esta línea
    autoprefixer: {},
  },
}