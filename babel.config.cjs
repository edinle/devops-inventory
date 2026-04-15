module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    '@atlaskit/tokens/babel-plugin',
    ['@compiled/babel-plugin', { transformerBabelPlugins: ['@atlaskit/tokens/babel-plugin'] }],
  ],
};
